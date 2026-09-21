import type Stripe from "stripe";
import { extendCheckoutReservation, fulfillPaidCheckout, releaseCheckoutReservation } from "@/lib/booking";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return Response.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") await fulfillPaidCheckout(session);
      else await extendCheckoutReservation(session);
    } else if (event.type === "checkout.session.async_payment_succeeded") {
      await fulfillPaidCheckout(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      await releaseCheckoutReservation(event.data.object as Stripe.Checkout.Session, "Payment was not completed");
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", event.id, error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
