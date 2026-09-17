import Stripe from "stripe";

import { getBookableProduct } from "@/lib/services";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid checkout request." }, { status: 400 }); }

  const value = (key: string, limit: number) => typeof body[key] === "string" ? body[key].trim().slice(0, limit) : "";
  const sku = value("sku", 120);
  const email = value("email", 254);
  const firstName = value("firstName", 80);
  const lastName = value("lastName", 80);
  const phone = value("phone", 40);
  const address = value("address", 240);
  const suburb = value("suburb", 120);
  const postcode = value("postcode", 20);
  const date = value("date", 20);
  const quantity = typeof body.quantity === "number" && Number.isInteger(body.quantity) ? body.quantity : 1;
  const product = getBookableProduct(sku);

  if (!product || quantity < 1 || quantity > 20 || !email || !firstName || !lastName || !phone || !address || !suburb || !postcode || !date) {
    return Response.json({ error: "Please complete every required booking field." }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SECRET_KEY) {
    return Response.json({ error: "Secure payment inventory is not fully configured yet." }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { data: inventory, error: inventoryError } = await supabase
    .from("inventory_items")
    .select("sku, service_slug, name, detail, price_cents, stock_quantity, active")
    .eq("sku", sku)
    .maybeSingle();

  if (inventoryError || !inventory || !inventory.active) {
    return Response.json({ error: "That service option is not currently available." }, { status: 409 });
  }
  if (inventory.stock_quantity < quantity) {
    return Response.json({ error: `Only ${inventory.stock_quantity} remain in stock.` }, { status: 409 });
  }

  const { data: reservationId, error: reservationError } = await supabase.rpc("reserve_inventory", {
    p_sku: sku,
    p_quantity: quantity,
  });

  if (reservationError || !reservationId) {
    return Response.json({ error: "That option has just sold out. Please choose another available option." }, { status: 409 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      expires_at: Math.floor(Date.now() / 1000) + (31 * 60),
      line_items: [{ quantity, price_data: { currency: "nzd", unit_amount: inventory.price_cents, product_data: { name: inventory.name, description: inventory.detail } } }],
      success_url: `${origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book?service=${product.service}`,
      metadata: {
        reservation_id: reservationId,
        sku,
        quantity: String(quantity),
        service: inventory.service_slug,
        customer_name: `${firstName} ${lastName}`,
        phone,
        address: `${address}, ${suburb} ${postcode}`,
        preferred_date: date,
      },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");

    const { data: attached, error: attachError } = await supabase.rpc("attach_checkout_to_reservation", {
      p_reservation_id: reservationId,
      p_checkout_session_id: session.id,
    });

    if (attachError || !attached) {
      await Promise.allSettled([
        stripe.checkout.sessions.expire(session.id),
        supabase.rpc("release_inventory_reservation", { p_reservation_id: reservationId }),
      ]);
      return Response.json({ error: "Checkout could not be secured. Please try again." }, { status: 502 });
    }

    return Response.json({ url: session.url });
  } catch {
    await supabase.rpc("release_inventory_reservation", { p_reservation_id: reservationId });
    return Response.json({ error: "Checkout could not be started. Your stock hold was released." }, { status: 502 });
  }
}
