"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/logo";
import { services } from "@/lib/services";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => setOpen(false);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`site-header${pathname === "/" ? " site-header--home" : ""}`}>
      <div className="header-inner">
        <Logo inverse />
        <nav className={`main-nav${open ? " is-open" : ""}`} aria-label="Main navigation">
          <Link className={active("/about") ? "active" : ""} href="/about" onClick={close}>About</Link>
          <div className="nav-services">
            <Link className={active("/services") ? "active" : ""} href="/services" onClick={close}>Services <Image src="/images/nav-chevron.svg" alt="" width={22} height={22} /></Link>
            <div className="service-menu">
              {services.map((service) => (
                <Link className={pathname === `/services/${service.slug}` ? "active" : ""} key={service.slug} href={`/services/${service.slug}`} onClick={close}>
                  <span>{service.cardName}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link className={active("/contact") ? "active" : ""} href="/contact" onClick={close}>Contact</Link>
          <a className="phone-link" href="tel:+64221831176"><Phone size={15} /> 022 183 1176</a>
          <Link className="button button--pink nav-book" href="/book" onClick={close}>Book a service</Link>
        </nav>
        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
