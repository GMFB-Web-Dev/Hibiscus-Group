import { cancelCalBooking, createCalBooking, getAvailableCalSlots } from "@/lib/cal-com";
import { serviceList } from "@/lib/site-data";
import { getStripeClient } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const fixedPriceServices = new Set<string>(serviceList.filter((service) => service.fixedPrice).map((service) => service.slug));

type BookingReservation = {
  reservation_id: string;
  request_id: string;
  item_name: string;
  item_detail: string;
  amount_cents: number;
  currency: string;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let reservationId = "";
  let calBookingUid = "";

  try {
    const body = await request.json() as Record<string, unknown>;
    const serviceSlug = text(body.service_slug, 40);
    const sku = text(body.inventory_sku, 100);
    const firstName = text(body.first_name, 80);
    const lastName = text(body.last_name, 80);
    const email = text(body.email, 254).toLowerCase();
    const phone = text(body.phone, 40);
    const streetAddress = text(body.street_address, 240);
    const addressLine2 = text(body.address_line_2, 240);
    const city = text(body.city, 120);
    const postcode = text(body.postcode, 20);
    const message = text(body.message, 5000);
    const timeZone = text(body.time_zone, 100) || "Pacific/Auckland";
    const slotStart = new Date(text(body.slot_start, 40));
    const slotEnd = new Date(text(body.slot_end, 40));
    const consentTerms = body.consent_terms === true;

    if (!fixedPriceServices.has(serviceSlug) || !sku) {
      return Response.json({ error: "Choose a valid fixed-price service." }, { status: 400 });
    }
    if (!firstName || !lastName || !email.includes("@") || phone.length < 6) {
      return Response.json({ error: "Complete your contact details." }, { status: 400 });
    }
    if (!streetAddress || !city || !postcode) {
      return Response.json({ error: "Complete the service address." }, { status: 400 });
    }
    if (!consentTerms) {
      return Response.json({ error: "Accept the terms and conditions to continue." }, { status: 400 });
    }
    if (!Number.isFinite(slotStart.getTime()) || !Number.isFinite(slotEnd.getTime()) || slotStart <= new Date() || slotEnd <= slotStart) {
      return Response.json({ error: "Choose an available booking time." }, { status: 400 });
    }

    const availableSlots = await getAvailableCalSlots({
      start: new Date(Math.max(Date.now(), slotStart.getTime() - 60 * 60 * 1000)).toISOString(),
      end: new Date(slotStart.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      timeZone,
    });
    const selectedSlotIsAvailable = availableSlots.some((slot) => (
      new Date(slot.start).getTime() === slotStart.getTime()
    ));

    if (!selectedSlotIsAvailable) {
      return Response.json({ error: "That time was just taken. Please choose another booking time." }, { status: 409 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error: reservationError } = await supabase
      .rpc("create_booking_reservation", {
        p_sku: sku,
        p_service_slug: serviceSlug,
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email,
        p_phone: phone,
        p_street_address: streetAddress,
        p_address_line_2: addressLine2,
        p_city: city,
        p_postcode: postcode,
        p_cal_start_at: slotStart.toISOString(),
        p_cal_end_at: slotEnd.toISOString(),
        p_cal_time_zone: timeZone,
        p_message: message || null,
        p_details: { source: "website", cal_event_type_id: process.env.CAL_EVENT_TYPE_ID },
      })
      .single();
    const reservation = data as BookingReservation | null;

    if (reservationError || !reservation) {
      const unavailable = reservationError?.message.includes("OUT_OF_STOCK") || reservationError?.message.includes("ITEM_NOT_AVAILABLE");
      return Response.json(
        { error: unavailable ? "That option has just sold out. Please choose another." : "We could not reserve that option." },
        { status: unavailable ? 409 : 500 },
      );
    }

    reservationId = reservation.reservation_id as string;
    const requestId = reservation.request_id as string;
    const itemName = reservation.item_name as string;
    const itemDetail = reservation.item_detail as string;
    const amountCents = reservation.amount_cents as number;
    const currency = reservation.currency as string;

    const calBooking = await createCalBooking({
      start: slotStart.toISOString(),
      name: `${firstName} ${lastName}`,
      email,
      timeZone,
    });
    calBookingUid = calBooking.uid!;

    const { data: calAttached, error: calAttachError } = await supabase.rpc("attach_cal_booking_to_reservation", {
      p_reservation_id: reservationId,
      p_cal_booking_uid: calBookingUid,
    });
    if (calAttachError || calAttached !== true) throw new Error("Unable to save booking.");

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: "hibiscus_booking_qjrmvexa",
      client_reference_id: requestId,
      customer_email: email,
      success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?service=${encodeURIComponent(serviceSlug)}&cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amountCents,
          product_data: {
            name: itemName,
            description: itemDetail,
            metadata: { inventory_sku: sku },
          },
        },
      }],
      metadata: {
        reservation_id: reservationId,
        request_id: requestId,
        inventory_sku: sku,
        cal_booking_uid: calBookingUid,
      },
      payment_intent_data: {
        metadata: {
          reservation_id: reservationId,
          request_id: requestId,
          inventory_sku: sku,
          cal_booking_uid: calBookingUid,
        },
      },
    });

    if (!session.url) throw new Error("Stripe Checkout did not return a URL.");

    const { data: checkoutAttached, error: checkoutAttachError } = await supabase.rpc("attach_checkout_to_reservation", {
      p_reservation_id: reservationId,
      p_checkout_session_id: session.id,
    });
    if (checkoutAttachError || checkoutAttached !== true) throw new Error("Unable to save Stripe Checkout session.");

    return Response.json({ url: session.url }, { status: 201 });
  } catch (error) {
    console.error("Booking checkout creation failed", error instanceof Error ? error.message : "unknown");

    if (calBookingUid) {
      await cancelCalBooking(calBookingUid, "Payment checkout could not be started");
    }
    if (reservationId) {
      const supabase = createAdminSupabaseClient();
      await supabase.rpc("release_inventory_reservation", { p_reservation_id: reservationId });
    }

    return Response.json({ error: "We could not start secure payment. No payment was taken." }, { status: 500 });
  }
}
