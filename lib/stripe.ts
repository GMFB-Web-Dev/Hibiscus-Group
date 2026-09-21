import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");

  stripeClient ??= new Stripe(key, {
    apiVersion: "2026-07-29.dahlia",
    appInfo: {
      name: "Hibiscus Group Booking",
      version: "1.0.0",
    },
  });

  return stripeClient;
}
