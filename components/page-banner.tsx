import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PageBannerProps = {
  eyebrow: string;
  title: string;
  copy: string;
  action?: { href: string; label: string };
  accent?: string;
};

export function PageBanner({ eyebrow, title, copy, action, accent = "#e52169" }: PageBannerProps) {
  return (
    <section className="figma-banner" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="figma-banner__inner">
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span />
        <p>{copy}</p>
        {action && <Link href={action.href} className="figma-button">{action.label} <ArrowRight /></Link>}
      </div>
    </section>
  );
}
