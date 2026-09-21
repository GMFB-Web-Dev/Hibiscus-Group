import "server-only";

import type Stripe from "stripe";
import { cancelCalBooking } from "@/lib/cal-com";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

type ReservationRecord = {
  id: string;
  status: "pending" | "completed" | "released";
  cal_booking_uid: string | null;
  stripe_checkout_session_id: string | null;
  amount_cents: number | null;
  currency: string;
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
