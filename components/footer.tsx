import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main shell">
        <Logo inverse />
        <div className="footer-content">
          <nav aria-label="Footer navigation"><Link className="active" href="/">Home</Link><Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/contact">Contact</Link><Link href="/book">Book a service</Link></nav>
          <p>© {new Date().getFullYear()} Developed by GMFB Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
