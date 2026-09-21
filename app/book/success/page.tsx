import Link from "next/link";
import { ArrowIcon } from "@/components/site-chrome";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { fulfillPaidCheckout } from "@/lib/booking";
import { getStripeClient } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let paid = false;
  let customerName = "";

  if (sessionId?.startsWith("cs_")) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      customerName = session.customer_details?.name || "";
      if (paid) await fulfillPaidCheckout(session);
    } catch (error) {
      console.error("Unable to verify booking success", error instanceof Error ? error.message : "unknown");
    }
  }

  return <>
    <SiteHeader />
    <main className="book-page">
      <section className="booking-shell booking-result">
        <p className="booking-kicker">{paid ? "BOOKED. PAID. SORTED." : "PAYMENT PROCESSING"}</p>
        <h1>{paid ? "YOUR BOOKING IS CONFIRMED" : "WE’RE CHECKING YOUR PAYMENT"}</h1>
        <span className="heading-line" />
        <p className="booking-subtitle">
          {paid
            ? `${customerName ? `Thanks ${customerName}. ` : ""}Your payment, Cal.com time, and stock allocation are confirmed. A booking email is on its way.`
            : "Your booking is not confirmed yet. If you completed payment, refresh this page in a moment or check your email."}
        </p>
        <Link className="button button-pink" href="/">BACK TO HOME <ArrowIcon /></Link>
      </section>
    </main>
    <SiteFooter />
  </>;
}
