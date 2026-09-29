import Image from "next/image";
import Link from "next/link";
import { greaterAreas, northAreas } from "@/lib/site-data";
export { Logo, SiteFooter, SiteHeader } from "@/components/site-navigation";

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
    <svg
      className="arrow-icon"
      width={22}
      height={22}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path d="M5 11H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 5L17 11L11 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
