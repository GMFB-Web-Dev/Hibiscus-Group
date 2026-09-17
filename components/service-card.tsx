import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Service } from "@/lib/services";

export function ServiceCard({ service, ctaLabel = "Learn more", home = false }: { service: Service; ctaLabel?: string; home?: boolean }) {
  return (
    <article className={`service-card${home ? " service-card--home" : ""}`} style={{ "--accent": service.color } as React.CSSProperties}>
      <Link href={`/services/${service.slug}`} className="service-card__image" aria-label={`Learn about ${service.name}`}>
        <Image src={service.cardImage} alt={`${service.name} local service`} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 20vw" />
      </Link>
      <div className="service-card__content">
        <h3>{service.cardName}</h3>
        <p>{service.summary}</p>
        <Link href={home && service.bookingMode === "payment" ? `/book?service=${service.slug}` : `/services/${service.slug}`} className="button button--black">{ctaLabel} <ArrowRight size={18} /></Link>
      </div>
    </article>
  );
}
