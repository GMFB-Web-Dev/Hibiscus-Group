Hibiscus Group website and booking workflow. Fixed-price services use live
Supabase inventory, Cal.com availability, Stripe-hosted Checkout, and a signed
Stripe webhook that fulfills stock exactly once after payment.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Booking integration

Copy `.env.example` to `.env.local` and configure the server-only Supabase,
Stripe sandbox, and Cal.com values. Do not expose secret keys with a
`NEXT_PUBLIC_` prefix.

The Stripe webhook endpoint is:

```text
POST /api/stripe/webhook
```

Subscribe it to `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, and `checkout.session.expired`.

For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Apply the SQL in `supabase/migrations` before using the booking page. The
checkout route validates the selected Cal.com slot again, creates a temporary
inventory reservation, books the Cal.com event, and redirects to Stripe.
Pending reservations reduce the stock shown on page one without changing the
stored stock quantity. Paid checkout fulfillment decrements stock atomically;
expired or failed checkout cancels the Cal.com booking and releases the hold.
Customers can book at most two units for one booking time, either as two
different options or quantity two of one option. The 4.5m³ Large Mini Skip is
limited to one and cannot be combined with another item. Each item is charged
in the same Checkout session and all stock is deducted together only after
payment succeeds.

The customer sees a confirmation page and booking reference once payment and
fulfillment are verified. The site does not currently send its own booking
confirmation email. Enable Stripe's successful-payment receipts in the Stripe
Dashboard if payment receipts are wanted; a separate transactional email
integration is needed for a branded email containing the booking details.
Check the Cal.com event notification settings as well: its booking is created
before payment to hold the time, so any Cal.com booking email may arrive before
the payment is complete.

## Transactional email

Paid Stripe bookings send a branded confirmation to the customer and a new
booking notification to the company. Quote requests send an acknowledgement to
the customer and a new quote notification to the company. Resend calls use
deterministic idempotency keys so Stripe webhook retries do not duplicate paid
booking emails.

Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (currently
`Hibiscus Group <bookings@weblaunch.co.nz>`), and
`COMPANY_NOTIFICATION_EMAIL` in Vercel. The company address is used for booking
and quote notifications and as the reply-to address on customer messages.

## Stock administration

The protected dashboard is available at `/admin`. Stock controls and paid
bookings are in separate tabs. The bookings tab shows selected items, booking
time, customer contact and address; pending, cancelled and failed payments,
quotes and enquiries are excluded. Admins sign in with
Supabase Auth email and password credentials. There is deliberately no public
sign-up route: create or invite the user from the Hibiscus Group project under
Supabase **Authentication → Users**, then grant that user access with their Auth
UUID in the SQL editor:

```sql
insert into public.admin_users (user_id, email, display_name)
values ('USER_UUID', 'admin@example.com', 'Administrator name')
on conflict (user_id) do update
set email = excluded.email,
    display_name = excluded.display_name,
    active = true;
```

To revoke access without deleting the Supabase Auth account:

```sql
update public.admin_users
set active = false
where user_id = 'USER_UUID';
```

Apply all migrations in `supabase/migrations` before opening the dashboard.
Every stock update is checked by the server against `admin_users` and recorded
in `inventory_adjustments`. Keep `SUPABASE_SECRET_KEY` server-only in Vercel.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
