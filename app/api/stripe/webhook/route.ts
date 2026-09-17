import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripeKey || !webhookSecret || !signature) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const supported = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);
  if (!supported.has(event.type)) return Response.json({ received: true });

  const session = event.data.object as Stripe.Checkout.Session;
  const reservationId = session.metadata?.reservation_id;
  if (!reservationId) return Response.json({ received: true });

  const supabase = createAdminClient();
  const shouldComplete =
    event.type === "checkout.session.async_payment_succeeded" ||
    (event.type === "checkout.session.completed" && session.payment_status === "paid");

  const { error } = shouldComplete
    ? await supabase.rpc("complete_inventory_reservation", { p_reservation_id: reservationId })
    : await supabase.rpc("release_inventory_reservation", { p_reservation_id: reservationId });

  if (error) return Response.json({ error: "Inventory settlement failed." }, { status: 500 });
  return Response.json({ received: true });
}
