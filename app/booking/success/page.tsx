import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BookingSuccessPage() {
  return <section className="status-page"><CheckCircle2 /><p className="eyebrow">Payment received</p><h1>Your booking is in.</h1><p>Thanks for choosing Hibiscus Group. We’ll confirm the service details using the contact information supplied at checkout.</p><div className="button-row"><Link className="button button--pink" href="/">Back home</Link><Link className="button button--black" href="/contact">Contact us</Link></div></section>;
}
