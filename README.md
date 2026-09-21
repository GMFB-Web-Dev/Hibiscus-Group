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
