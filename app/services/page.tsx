import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AreasBand } from "@/components/areas-band";
import { PageBanner } from "@/components/page-banner";
import { getService } from "@/lib/services";

export const metadata: Metadata = { title: "Services", description: "Explore Hibiscus Group's five practical local service lines." };

const serviceOrder = ["h2o-2-u", "arb-2-u", "skip-2-u", "dig-tip-2-u", "wash-2-u"] as const;
const serviceImages = {
  "h2o-2-u": "/images/services-h2o.jpg",
  "arb-2-u": "/images/services-arb.jpg",
  "skip-2-u": "/images/services-skip.jpg",
  "dig-tip-2-u": "/images/services-dig.jpg",
  "wash-2-u": "/images/services-wash.jpg",
} as const;

export default function ServicesPage() {
  return (
    <>
      <PageBanner eyebrow="Our services" title="What do you need sorted?" copy="From skip bins and water delivery to washing, arborist work and digger hire, choose the practical local service you need and we’ll guide you through the right next step." action={{ href: "/book", label: "Book a service" }} />
      <div className="figma-service-showcase">
        {serviceOrder.map((slug, index) => {
          const service = getService(slug)!;
          const imageLeft = index > 1;
          return (
            <section className={`figma-service-row${imageLeft ? " figma-service-row--image-left" : ""}${slug === "skip-2-u" ? " figma-service-row--tall" : ""}`} style={{ "--accent": service.color, "--soft": service.colorSoft } as React.CSSProperties} key={slug}>
              <div className="figma-service-row__copy">
                <p className="figma-kicker">{service.eyebrow}</p>
                <h2>{service.name}</h2>
                <span className="figma-rule" />
                <p>{service.summary}</p>
                <Link className="figma-button" href={`/services/${service.slug}`}>Learn more <ArrowRight /></Link>
              </div>
              <div className="figma-service-row__image"><Image src={serviceImages[slug]} alt={`${service.name} service`} fill sizes="(max-width: 850px) 100vw, 50vw" /></div>
            </section>
          );
        })}
      </div>
      <AreasBand />
    </>
  );
}
