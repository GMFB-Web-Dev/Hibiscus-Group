import Image from "next/image";
import Link from "next/link";
import { greaterAreas, northAreas, serviceList } from "@/lib/site-data";

export function Logo() {
  return (
    <Link href="/" className="logo-box" aria-label="Hibiscus Group home">
      LOGO
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/about">ABOUT</Link>
        <details className="service-menu">
          <summary>
            <span>SERVICES</span>
            <Image
              className="service-chevron"
              src="/images/figma/nav-chevron-down.svg"
              alt=""
              width={22}
              height={22}
            />
          </summary>
          <div className="service-menu-panel">
            <Link href="/services">ALL SERVICES</Link>
            {serviceList.map((service) => (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                {service.shortName}
              </Link>
            ))}
          </div>
        </details>
        <Link href="/contact">CONTACT</Link>
        <a className="phone-button" href="tel:+64221831176">022 183 1176</a>
        <Link className="button button-pink" href="/book">BOOK A SERVICE</Link>
      </nav>
      <details className="mobile-menu">
        <summary aria-label="Toggle navigation">
          <Image className="mobile-menu-icon mobile-menu-open-icon" src="/images/figma/icons/menu.svg" alt="" width={45} height={45} aria-hidden />
          <Image className="mobile-menu-icon mobile-menu-close-icon" src="/images/figma/icons/close.svg" alt="" width={52} height={52} aria-hidden />
        </summary>
        <nav>
          <Link href="/">HOME</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/services">SERVICES</Link>
          <Link href="/contact">CONTACT</Link>
          <Link href="/book">BOOK A SERVICE</Link>
        </nav>
      </details>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Logo />
      <div>
        <nav aria-label="Footer navigation">
          <Link href="/">HOME</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/services">SERVICES</Link>
          <Link href="/contact">CONTACT</Link>
          <Link href="/book">BOOK A SERVICE</Link>
        </nav>
        <p>© 2026 Developed by GMFB Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Hero({
  image,
  title,
  copy,
  accent = "#e52169",
  primaryLabel = "BOOK A SERVICE",
  primaryHref = "/book",
  secondaryLabel = "OUR SERVICES",
  secondaryHref = "/services",
  titleAccent = true,
  large = false,
}: {
  image: string;
  title: string;
  copy: string;
  accent?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  titleAccent?: boolean;
  large?: boolean;
}) {
  return (
    <section className={`hero ${large ? "hero-large" : ""}`} style={{ "--accent": accent, backgroundImage: `url(${image})` } as React.CSSProperties}>
      <div className="hero-overlay" />
      <div className="hero-content container-wide">
        <h1 className={titleAccent ? "accent-title" : ""}>{title}</h1>
        <p>{copy}</p>
        <div className="button-row">
          <Link className="button button-accent" href={primaryHref}>{primaryLabel}</Link>
          <Link className="button button-outline" href={secondaryHref}>{secondaryLabel}</Link>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, children, centered = false }: { eyebrow: string; children: React.ReactNode; centered?: boolean }) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{children}</h2>
      <span className="heading-line" />
    </div>
  );
}

export function BoxIcon() {
  return (
    <Image
      className="value-cube-icon"
      src="/images/figma/icons/value-cube.svg"
      alt=""
      width={48}
      height={48}
      aria-hidden
    />
  );
}

export function AreaIcon() {
  return (
    <Image
      className="area-cube-icon"
      src="/images/figma/icons/area-cube.svg"
      alt=""
      width={30}
      height={30}
      aria-hidden
    />
  );
}

export function CheckIcon({ variant = "skip-2-u" }: { variant?: "skip-2-u" | "h2o-2-u" | "wash-2-u" | "arb-2-u" | "dig-tip-2-u" }) {
  const sources = {
    "skip-2-u": "/images/figma/icons/check.svg",
    "h2o-2-u": "/images/figma/icons/check-water.svg",
    "wash-2-u": "/images/figma/icons/check-wash.svg",
    "arb-2-u": "/images/figma/icons/check-arb.svg",
    "dig-tip-2-u": "/images/figma/icons/check-dig.svg",
  };

  return (
    <Image
      className="check-icon"
      src={sources[variant]}
      alt=""
      width={28}
      height={28}
      aria-hidden
    />
  );
}

export function ArrowIcon() {
  return (
    <Image
      className="arrow-icon"
      src="/images/figma/icons/arrow.svg"
      alt=""
      width={22}
      height={22}
      aria-hidden
    />
  );
}

export function AreasSection({ greater = false, title }: { greater?: boolean; title: string }) {
  const areas = greater ? greaterAreas : northAreas;
  return (
    <section className="areas-section">
      <div className="areas-grid">
        {areas.map((area) => (
          <span key={area}>
            <i aria-hidden><AreaIcon /></i>
            {area}
          </span>
        ))}
      </div>
      <div className="areas-copy">
        <SectionHeading eyebrow="">{title}</SectionHeading>
        <p>Based in Dairy Flat, we service a wide area across Rodney, Hibiscus Coast, North Shore and nearby locations.</p>
      </div>
    </section>
  );
}

export function ArrowButton({ href, children, accent }: { href: string; children: React.ReactNode; accent?: string }) {
  return <Link className="button button-accent" style={accent ? ({ "--accent": accent } as React.CSSProperties) : undefined} href={href}>{children}<ArrowIcon /></Link>;
}
