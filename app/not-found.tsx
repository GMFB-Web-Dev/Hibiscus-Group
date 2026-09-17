import Link from "next/link";

export default function NotFound() {
  return <section className="status-page"><p className="eyebrow">404</p><h1>That page isn’t on our route.</h1><p>Head back to our services and we’ll help you find the right place.</p><Link className="button button--pink" href="/services">Explore services</Link></section>;
}
