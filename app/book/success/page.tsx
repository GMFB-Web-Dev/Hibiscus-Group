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
  let confirmed = false;
  let paymentReceived = false;
  let customerName = "";
  let reference = "";
  let amount = "";

  if (sessionId?.startsWith("cs_")) {
    try {
      const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
      paymentReceived = session.payment_status === "paid";
      customerName = session.customer_details?.name || "";
      reference = session.client_reference_id?.slice(0, 8).toUpperCase() || "";
      amount = session.amount_total !== null && session.currency
        ? new Intl.NumberFormat("en-NZ", { style: "currency", currency: session.currency }).format(session.amount_total / 100)
        : "";
      if (paymentReceived) confirmed = await fulfillPaidCheckout(session);
    } catch (error) {
      console.error("Unable to verify booking success", error instanceof Error ? error.message : "unknown");
    }
  }

  return <>
    <SiteHeader />
    <main className="book-page">
      <section className="booking-shell booking-result">
        <p className="booking-kicker">{confirmed ? "BOOKED. PAID. SORTED." : "BOOKING UPDATE"}</p>
        <h1>{confirmed ? "YOUR BOOKING IS CONFIRMED" : paymentReceived ? "PAYMENT RECEIVED" : "WE’RE CHECKING YOUR PAYMENT"}</h1>
        <span className="heading-line" />
        <p className="booking-subtitle">
          {confirmed
            ? `${customerName ? `Thanks ${customerName}. ` : ""}Your payment is complete and your selected booking time is confirmed. Save this page as your confirmation.`
            : paymentReceived
              ? "We received your payment but are still finalising the booking. Please contact us if this message persists."
              : "Your booking is not confirmed yet. If you completed payment, refresh this page in a moment."}
        </p>
        {reference ? <p>Booking reference: <strong>{reference}</strong>{amount ? ` · Paid: ${amount}` : ""}</p> : null}
        {!confirmed && paymentReceived ? <p>Please call 022 183 1176 and quote your booking reference.</p> : null}
        <Link className="button button-pink" href="/">BACK TO HOME <ArrowIcon /></Link>
      </section>
    </main>
    <SiteFooter />
  </>;
}
