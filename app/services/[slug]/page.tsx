import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { AreasBand } from "@/components/areas-band";
import { PageBanner } from "@/components/page-banner";
import { formatPrice, getService, services, skipProducts, waterAreas, waterLitres } from "@/lib/services";

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return service ? { title: service.name, description: service.summary } : {};
}

const serviceContent = {
  "skip-2-u": {
    intro: [
      "SKIP 2 U provides reliable mini skip bin hire for homes, worksites, renovations, cleanouts, garden waste and general rubbish removal.",
      "Our mini skip bins are a practical option for tight access areas, smaller driveways and residential sites where larger bins are not suitable. With simple online booking, clear pricing and seven-day availability, SKIP 2 U makes waste removal easy from start to finish.",
      "Choose the bin size you need, book online, pay upfront, and we will deliver the skip bin to you.",
    ],
    benefitKicker: "Simple, local and built for tight access.",
    benefitImage: "/images/skip-detail.jpg",
  },
  "h2o-2-u": {
    intro: ["H2O 2 U provides reliable bulk water delivery across Rodney, Hibiscus Coast, North Shore and surrounding areas. Choose the water amount you need, select your delivery area, book online and pay upfront."],
    benefitKicker: "Local water delivery made simple.",
    benefitImage: "/images/h2o-detail.jpg",
  },
  "arb-2-u": {
    intro: [
      "ARB 2 U provides arborist services for residential, rural and commercial properties across the Hibiscus Coast, Rodney, North Shore and surrounding areas.",
      "From tree pruning and removal through to stump grinding, hedge trimming, site clearing and maintenance, ARB 2 U helps keep your property safe, tidy and controlled.",
      "This service is quote-based, so customers can book a preferred date, provide job details, and the team will review the work before confirming the final price.",
    ],
    detailKicker: "Practical tree & outdoor care",
    detailCopy: [
      "ARB 2 U helps with practical tree and outdoor maintenance work for homes, lifestyle blocks, rural properties and commercial sites. Whether you need overgrown branches cut back, unsafe trees looked at, storm damage cleared, or general section maintenance, the team can review the job and provide the right advice before work begins.",
      "Every job is quote-based because tree work can vary depending on access, size, safety requirements and the equipment needed.",
    ],
    detailImage: "/images/arb-detail.jpg",
    benefitKicker: "Local tree care made simple.",
    benefitImage: "/images/arb-benefits.jpg",
  },
  "dig-tip-2-u": {
    intro: [
      "DIG & TIP 2 U provides practical dry digger and truck hire for property work, site cleanups, small earthworks and material removal.",
      "This is a self-operated hire service, giving you the equipment needed to complete the work yourself. A valid Class 2 licence is required to operate the truck, and the DIG & TIP 2 U team can assist with arranging delivery of the equipment to your site.",
      "This is a quote-based service, as every hire can vary depending on access, site conditions, hire duration, delivery distance, equipment required and the type of work being completed.",
    ],
    introImage: "/images/dig-main.jpg",
    detailKicker: "Practical digger and truck support, delivered to you.",
    detailCopy: ["DIG & TIP 2 U is designed for customers who need equipment to complete digging, loading, tipping and site work themselves. It is a practical hire option for homeowners, builders, contractors, rural properties and small commercial sites needing flexible machinery."],
    detailImage: "/images/dig-hero.jpg",
    benefitKicker: "Local machinery support without the hassle.",
    benefitImage: "/images/dig-detail.jpg",
  },
  "wash-2-u": {
    intro: [
      "WASH 2 U provides reliable water blasting services for homes, businesses, outdoor areas and property maintenance jobs. Whether you need a driveway cleaned, a building washed, paths cleared, or outdoor surfaces brought back to life, the team can review the job and provide a quote based on the work required.",
      "Every property is different, so WASH 2 U is a quote-based service.",
      "Customers can send through their details, choose a preferred date, and the team will confirm the best approach and pricing before the job goes ahead.",
    ],
    detailKicker: "Clean, tidy and ready to use again.",
    detailCopy: ["WASH 2 U helps remove dirt, grime, mould, moss and general build-up from outdoor surfaces. It is a practical service for keeping properties looking sharp, improving safety around slippery areas, and maintaining homes, commercial spaces and shared outdoor areas."],
    detailImage: "/images/wash-feature.jpg",
    benefitKicker: "Reliable washing, done properly.",
    benefitImage: "/images/wash-detail.jpg",
  },
} as const;

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const content = serviceContent[service.slug];
  const detail = "detailCopy" in content;
  const buttonInk = service.slug === "dig-tip-2-u" ? "#111827" : "#fff";

  return (
    <>
      <PageBanner eyebrow={service.eyebrow} title={service.name} copy={service.summary} accent={service.color} action={{ href: `/book?service=${service.slug}`, label: service.bookingLabel }} />
      <section className={`figma-product-intro figma-product-intro--${service.slug}`} style={{ "--accent": service.color, "--soft": service.colorSoft, "--button-ink": buttonInk } as React.CSSProperties}>
        <div className="figma-product-intro__image"><Image src={("introImage" in content && content.introImage) || service.image} alt={`${service.name} service`} fill priority sizes="(max-width: 850px) 100vw, 50vw" /></div>
        <div className="figma-product-intro__copy">
          <p className="figma-kicker">{service.eyebrow}</p><h2>{service.name}</h2><span className="figma-rule" />
          {content.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <Link className="figma-button" href={`/book?service=${service.slug}`}>{service.bookingLabel} <ArrowRight /></Link>
        </div>
      </section>

      {detail && (
        <section className={`figma-product-detail figma-product-detail--${service.slug}`} style={{ "--accent": service.color, "--soft": service.colorSoft } as React.CSSProperties}>
          <div className="figma-product-detail__copy">
            <p className="figma-kicker">{content.detailKicker}</p><h2>What we can help with</h2><span className="figma-rule" />
            {content.detailCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <strong>{service.slug === "dig-tip-2-u" ? "Hire options may include:" : "Services may include:"}</strong>
            <ul>{service.services.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="figma-product-detail__image"><Image src={content.detailImage} alt={`${service.name} work`} fill sizes="(max-width: 850px) 100vw, 50vw" /></div>
        </section>
      )}

      {service.slug === "skip-2-u" && <SkipPricing />}
      {service.slug === "h2o-2-u" && <WaterPricing />}

      <section className="figma-benefits" style={{ "--accent": service.color, "--button-ink": buttonInk } as React.CSSProperties}>
        <div className="figma-benefits__copy">
          <p className="figma-kicker">{content.benefitKicker}</p><h2>Why choose {service.name}?</h2><span className="figma-rule" />
          <div className="figma-benefits__list">{service.benefits.map((item) => <span key={item}><i><Check /></i>{item}</span>)}</div>
          <div className="figma-benefits__actions"><Link className="figma-button" href={`/book?service=${service.slug}`}>{service.bookingLabel} <ArrowRight /></Link><Link className="figma-button" href="/contact">Contact us <ArrowRight /></Link></div>
        </div>
        <div className="figma-benefits__image"><Image src={content.benefitImage} alt={`${service.name} local service`} fill sizes="(max-width: 850px) 100vw, 50vw" /></div>
      </section>
      <AreasBand dark greaterAuckland={service.slug === "h2o-2-u"} />
    </>
  );
}

function SkipPricing() {
  const rubbish = skipProducts.slice(0, 3);
  const hardFill = skipProducts.slice(3);
  return (
    <section className="figma-pricing figma-pricing--skip">
      <div className="figma-pricing__heading"><p>Clear skip bin rates with simple options for rubbish and hard fill</p><h2>Skip 2 U pricing</h2><span className="figma-rule" /></div>
      <div className="figma-price-table">
        <h3>Rubbish</h3><div className="figma-price-table__header"><b>Size</b><b>Description</b><b>Price</b></div>
        {rubbish.map((product) => <div className="figma-price-table__row" key={product.sku}><span>{product.name}</span><span>{product.detail.split(" · ")[1]}</span><span>{formatPrice(product.priceCents)}</span></div>)}
        <h3>Hard fill</h3>
        {hardFill.map((product) => <div className="figma-price-table__row" key={product.sku}><span>{product.name}</span><span>{product.detail.split(" · ")[1]}</span><span>{formatPrice(product.priceCents)}</span></div>)}
      </div>
    </section>
  );
}

function WaterPricing() {
  return (
    <section className="figma-pricing figma-pricing--water">
      <div className="figma-pricing__heading"><p>Pick your amount, choose your date and we’ll bring the water to you.</p><h2>H2O 2 U pricing</h2><span className="figma-rule" /></div>
      <div className="figma-water-table-wrap"><table><thead><tr><th>Area</th>{waterLitres.map((litres) => <th key={litres}>{litres.toLocaleString("en-NZ")} litres</th>)}</tr></thead><tbody>{waterAreas.map(({ area, prices }) => <tr key={area}><th>{area}</th>{prices.map((price, index) => <td key={`${area}-${waterLitres[index]}`}>${price}</td>)}</tr>)}</tbody></table></div>
    </section>
  );
}
