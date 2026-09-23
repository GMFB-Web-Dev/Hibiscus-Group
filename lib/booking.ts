import "server-only";

import type Stripe from "stripe";
import { cancelCalBooking } from "@/lib/cal-com";
import { sendBookingEmails } from "@/lib/email";
import { serviceList } from "@/lib/site-data";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

type ReservationRecord = {
  id: string;
  status: "pending" | "completed" | "released";
  cal_booking_uid: string | null;
  stripe_checkout_session_id: string | null;
  amount_cents: number | null;
  currency: string;
};

type BookingRequestRecord = {
  id: string;
  service_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string | null;
  address_line_2: string | null;
  city: string | null;
  postcode: string | null;
  cal_start_at: string | null;
  cal_time_zone: string | null;
  message: string | null;
  payment_status: string;
};

type BookingReservationLine = {
  sku: string;
  quantity: number;
  amount_cents: number | null;
};

function paymentIntentId(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? "";
}

export async function fulfillPaidCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return false;

  const reservationId = session.metadata?.reservation_id;
  if (!reservationId || session.amount_total === null || !session.currency) return false;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("complete_inventory_reservation", {
    p_reservation_id: reservationId,
    p_checkout_session_id: session.id,
    p_payment_intent_id: paymentIntentId(session),
    p_amount_total: session.amount_total,
    p_currency: session.currency,
  });

  if (error) {
    console.error("Unable to fulfill paid checkout", error.code);
    throw new Error("Paid checkout could not be fulfilled.");
  }

  return data === true;
}

export async function sendPaidBookingEmails(session: Stripe.Checkout.Session) {
  const requestId = session.metadata?.request_id || session.client_reference_id;
  if (!requestId || session.amount_total === null) throw new Error("Paid booking email details are incomplete.");

  const supabase = createAdminSupabaseClient();
  const [{ data: request, error: requestError }, { data: reservations, error: reservationError }] = await Promise.all([
    supabase
      .from("customer_requests")
      .select("id,service_slug,first_name,last_name,email,phone,street_address,address_line_2,city,postcode,cal_start_at,cal_time_zone,message,payment_status")
      .eq("id", requestId)
      .eq("payment_status", "paid")
      .single<BookingRequestRecord>(),
    supabase
      .from("stock_reservations")
      .select("sku,quantity,amount_cents")
      .eq("customer_request_id", requestId)
      .eq("status", "completed"),
  ]);

  if (requestError || reservationError || !request || !reservations?.length) {
    throw new Error("Paid booking could not be prepared for email.");
  }

  const lines = reservations as BookingReservationLine[];
  const skus = lines.map((line) => line.sku);
  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory_items")
    .select("sku,name")
    .in("sku", skus);
  if (inventoryError) throw new Error("Paid booking items could not be prepared for email.");

  const names = new Map((inventory ?? []).map((item) => [item.sku as string, item.name as string]));
  const timeZone = request.cal_time_zone || "Pacific/Auckland";
  const bookedTime = request.cal_start_at
    ? new Intl.DateTimeFormat("en-NZ", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(request.cal_start_at))
    : "Time recorded in the staff dashboard";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hib.gdn").replace(/\/$/, "");

  await sendBookingEmails(request.id, {
    customerName: `${request.first_name} ${request.last_name}`.trim(),
    reference: request.id.slice(0, 8).toUpperCase(),
    serviceName: serviceList.find((service) => service.slug === request.service_slug)?.shortName || request.service_slug,
    bookedTime,
    address: [request.street_address, request.address_line_2, request.city, request.postcode].filter(Boolean).join(", ") || "Not provided",
    email: request.email,
    phone: request.phone,
    notes: request.message,
    items: lines.map((line) => ({
      name: names.get(line.sku) || line.sku,
      quantity: line.quantity,
      unitAmountCents: line.amount_cents || 0,
    })),
    totalCents: session.amount_total,
    adminUrl: `${siteUrl}/admin`,
  });
}

export async function extendCheckoutReservation(session: Stripe.Checkout.Session) {
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return false;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("extend_inventory_reservation", {
    p_reservation_id: reservationId,
    p_checkout_session_id: session.id,
  });

  if (error) {
    console.error("Unable to extend checkout reservation", error.code);
    return false;
  }

  return data === true;
}

export async function releaseCheckoutReservation(
  session: Stripe.Checkout.Session,
  reason: string,
) {
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return false;

  const supabase = createAdminSupabaseClient();
  const { data: reservation, error: readError } = await supabase
    .from("stock_reservations")
    .select("id,status,cal_booking_uid,stripe_checkout_session_id,amount_cents,currency")
    .eq("id", reservationId)
    .maybeSingle<ReservationRecord>();

  if (readError || !reservation) return false;
  if (reservation.status !== "pending") return reservation.status === "released";
  if (reservation.stripe_checkout_session_id !== session.id) return false;

  if (reservation.cal_booking_uid) {
    await cancelCalBooking(reservation.cal_booking_uid, reason);
  }

  const { data, error } = await supabase.rpc("release_inventory_reservation", {
    p_reservation_id: reservationId,
  });

  if (error) {
    console.error("Unable to release checkout reservation", error.code);
    return false;
  }

  return data === true;
}
