# Integration points

The public Supabase URL and publishable key are safe for browser use. Keep `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` server-only.

## Supabase inventory and admin access

The app is connected to the **Hibiscus Group** Supabase project (`zraoxievmemhavwotnhd`). The applied migrations are committed under `supabase/migrations/`.

- `inventory_items` is publicly readable only for active products. All 41 fixed-price options start with stock `5`.
- `stock_reservations` is inaccessible to browser roles. Server-only RPCs atomically reserve, complete, or release stock.
- `admin_users` is separate from Supabase Auth. RLS requires both a verified Auth session and an active row in this table before stock can be updated.
- `inventory_adjustments` records manual stock changes and the admin who made them.
- `private.admin_invites` contains the manually managed email allowlist. The initial invite is `team@weblaunch.co.nz`.

The first magic-link request has created the `team@weblaunch.co.nz` Auth user and its active admin row. Visit `/admin/login`, request a link, and complete it from that inbox to open `/admin`.

For production, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and a modern `SUPABASE_SECRET_KEY` (`sb_secret_...`). Never expose the secret key with a `NEXT_PUBLIC_` prefix.

## Stripe

Fixed-price Skip 2 U and H2O 2 U bookings display only live, active Supabase inventory. Customers can choose a quantity up to the available stock. `/api/checkout` validates the database price and atomically reserves the selected quantity before creating a Stripe-hosted Checkout Session. Card details never pass through this app.

Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`, and `NEXT_PUBLIC_SITE_URL` from `.env.example`. Configure Stripe to send these events to `/api/stripe/webhook`:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Paid sessions finalize the reservation. Failed, expired, or abandoned holds restore stock; stale holds also expire automatically when the next reservation is attempted.

## Cal.com

Quote-based Wash 2 U, Arb 2 U, and Dig & Tip 2 U enquiries show a Cal.com booking handoff after confirmation when `NEXT_PUBLIC_CALCOM_BOOKING_URL` is set to the full event URL.

## Enquiry forms

The quote and contact forms currently keep their state in the browser and show a frontend confirmation. Connect them to the destination you choose when backend work begins.
