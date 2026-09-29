"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { serviceList } from "@/lib/site-data";

function isCurrentRoute(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ActiveLink({
  href,
  children,
  className = "",
  exact = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : isCurrentRoute(pathname, href);

  return (
    <Link
      href={href}
      className={`${className}${active ? " is-active" : ""}`.trim()}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export function Logo({ indicateHome = false }: { indicateHome?: boolean }) {
  const pathname = usePathname();
  const active = indicateHome && pathname === "/";

  return (
    <Link
      href="/"
      className={`logo-box${active ? " is-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="visually-hidden">Hibiscus Group home</span>
      <span aria-hidden>LOGO</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const servicesActive = isCurrentRoute(pathname, "/services");
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <Logo indicateHome />
      <nav className="desktop-nav" aria-label="Main navigation">
        <ActiveLink href="/about">ABOUT</ActiveLink>
        <div className={`service-menu${servicesActive ? " is-active" : ""}`}>
          <ActiveLink className="service-menu-trigger" href="/services">
            <span>SERVICES</span>
            <Image
              className="service-chevron"
              src="/images/figma/nav-chevron-down.svg"
              alt=""
              width={22}
              height={22}
            />
          </ActiveLink>
          <div className="service-menu-panel">
            <ActiveLink href="/services" exact>ALL SERVICES</ActiveLink>
            {serviceList.map((service) => (
              <ActiveLink key={service.slug} href={`/services/${service.slug}`}>
                {service.shortName}
              </ActiveLink>
            ))}
          </div>
        </div>
        <ActiveLink href="/contact">CONTACT</ActiveLink>
        <a className="phone-button" href="tel:+64221831176">022 183 1176</a>
        <ActiveLink className="button button-pink" href="/book">BOOK A SERVICE</ActiveLink>
      </nav>

      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="mobile-menu-lines" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </button>

      <button
        className={`mobile-menu-backdrop${menuOpen ? " is-open" : ""}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />
      <nav
        id="mobile-navigation"
        className={`mobile-navigation${menuOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <ActiveLink href="/" onClick={closeMenu}>HOME</ActiveLink>
        <ActiveLink href="/about" onClick={closeMenu}>ABOUT</ActiveLink>
        <div className={`mobile-services${servicesActive ? " is-active" : ""}`}>
          <button
            type="button"
            aria-expanded={servicesOpen}
            aria-controls="mobile-services-list"
            onClick={() => setServicesOpen((open) => !open)}
          >
            <span>SERVICES</span>
            <Image src="/images/figma/nav-chevron-down.svg" alt="" width={20} height={20} aria-hidden />
          </button>
          <div
            id="mobile-services-list"
            className={`mobile-services-list${servicesOpen ? " is-open" : ""}`}
            aria-hidden={!servicesOpen}
          >
            <div>
              <ActiveLink href="/services" exact onClick={closeMenu}>ALL SERVICES</ActiveLink>
              {serviceList.map((service) => (
                <ActiveLink key={service.slug} href={`/services/${service.slug}`} onClick={closeMenu}>
                  {service.shortName}
                </ActiveLink>
              ))}
            </div>
          </div>
        </div>
        <ActiveLink href="/contact" onClick={closeMenu}>CONTACT</ActiveLink>
        <ActiveLink className="mobile-book-link" href="/book" onClick={closeMenu}>BOOK A SERVICE</ActiveLink>
        <a className="mobile-phone-link" href="tel:+64221831176">022 183 1176</a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <div className="footer-content">
        <nav aria-label="Footer navigation">
          <ActiveLink href="/">HOME</ActiveLink>
          <ActiveLink href="/about">ABOUT</ActiveLink>
          <ActiveLink href="/services">SERVICES</ActiveLink>
          <ActiveLink href="/contact">CONTACT</ActiveLink>
          <ActiveLink href="/book">BOOK A SERVICE</ActiveLink>
        </nav>
        <p>© 2026 Developed by GMFB Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
