import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import type { Service } from "@/lib/site-data";
import { createPublicSupabaseClient } from "@/lib/supabase";
import { AreasSection, ArrowButton, CheckIcon, Hero, SectionHeading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { WaterPriceTable, type WaterPriceArea } from "@/components/water-price-table";

const skipRows = [
  ["RUBBISH", "2m³ Cubic Mini Skip", "450kg weight limit", "$235"],
  ["", "3m³ Standard Mini Skip", "600kg weight limit", "$285"],
  ["", "4.5m³ Large Mini Skip", "700kg weight limit", "$335"],
  ["HARD FILL", "2m³ Cubic Mini Skip", "For concrete, bricks, soil", "$235"],
  ["", "3m³ Standard Mini Skip", "Clean fill only", "$285"],
];

async function loadWaterPrices() {
  const { data, error } = await createPublicSupabaseClient()
    .from("inventory_items")
    .select("name, price_cents")
    .eq("service_slug", "h2o-2-u")
    .eq("active", true);

  if (error) throw error;

  const areas = new Map<string, WaterPriceArea>();
  const volumes = new Set<number>();
  for (const item of data) {
    // Water inventory names use the same "5,000 litres to Albany" format as booking.
    const match = /^([\d,]+) litres to (.+)$/.exec(item.name);
    if (!match) continue;

    const litres = Number(match[1].replaceAll(",", ""));
    const name = match[2];
    const area = areas.get(name) ?? { name, prices: {} };
    area.prices[litres] = item.price_cents;
    areas.set(name, area);
    volumes.add(litres);
  }

  return {
    areas: [...areas.values()].sort((a, b) => a.name.localeCompare(b.name, "en-NZ")),
    volumes: [...volumes].sort((a, b) => a - b),
  };
}

async function WaterPricing({ service }: { service: Service }) {
  await connection();
  const prices = await loadWaterPrices().catch((error: unknown) => {
    console.error("Unable to load water pricing", error);
    return null;
  });

  return (
    <section className="pricing-section" style={{ "--accent": service.accent } as React.CSSProperties}>
      <SectionHeading eyebrow="PICK YOUR AMOUNT, CHOOSE YOUR DATE AND WE'LL BRING THE WATER TO YOU." centered>H2O 2 U PRICING</SectionHeading>
      {prices?.areas.length ? (
        <WaterPriceTable areas={prices.areas} volumes={prices.volumes} />
      ) : (
        <p className="water-price-note">Please <Link href="/contact">contact us for water delivery pricing</Link>.</p>
      )}
    </section>
  );
}

function Pricing({ service }: { service: Service }) {
  if (service.slug === "skip-2-u") {
    return <section className="pricing-section" style={{ "--accent": service.accent } as React.CSSProperties}>
      <SectionHeading eyebrow="CLEAR SKIP BIN RATES WITH SIMPLE OPTIONS FOR RUBBISH AND HARD FILL" centered>SKIP 2 U PRICING</SectionHeading>
      <div className="price-table skip-table">
        <div className="table-head"><span>SIZE</span><span>DESCRIPTION</span><span>PRICE</span></div>
        {skipRows.map((row, index) => <div key={`${row[1]}-${index}`}>
          {row[0] && <h3>{row[0]}</h3>}
          <div className="table-row"><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span></div>
        </div>)}
      </div>
    </section>;
  }
  if (service.slug === "h2o-2-u") {
    return <WaterPricing service={service} />;
  }
  return null;
}

export function ServicePage({ service }: { service: Service }) {
  const quote = !service.fixedPrice;
  const bookHref = `/book?service=${service.slug}`;
  return <>
    <SiteHeader />
    <main className="service-page" style={{ "--accent": service.accent } as React.CSSProperties}>
      <Hero image={service.hero} title={service.heroTitle} copy={service.heroCopy} accent={service.accent} titleAccent={false} primaryLabel="SERVICES" primaryHref="/services" secondaryLabel="CONTACT US" secondaryHref="/contact" />

      <section className="service-intro split-section accent-wash">
        <div className="split-image"><Image src={service.introImage} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="split-copy">
          <SectionHeading eyebrow={service.eyebrow}>{service.name}</SectionHeading>
          {service.introCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <ArrowButton href={bookHref} accent={service.accent}>{quote ? `BOOK ${service.shortName.replace(" 2 U", "")}` : service.slug === "h2o-2-u" ? "BOOK H2O" : "BOOK SKIP"}</ArrowButton>
        </div>
      </section>

      <Pricing service={service} />

      {service.helpHeading && <section className="service-help split-section reverse accent-edge">
        <div className="split-copy">
          <SectionHeading eyebrow={service.eyebrow}>{service.helpHeading}</SectionHeading>
          {service.helpCopy?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <h4>Services May Include:</h4>
          <ul>{service.helpItems?.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="split-image"><Image src={service.detailImage} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
      </section>}

      <section className="why-service split-section muted">
        <div className="split-copy">
          <SectionHeading eyebrow={service.whyEyebrow}>WHY CHOOSE {service.shortName}?</SectionHeading>
          <ul className="check-list">{service.whyItems.map((item) => <li key={item}><span aria-hidden><CheckIcon variant={service.slug} /></span>{item}</li>)}</ul>
          <div className="button-row"><ArrowButton href={bookHref} accent={service.accent}>BOOK {service.shortName}</ArrowButton><ArrowButton href="/contact" accent={service.accent}>CONTACT US</ArrowButton></div>
        </div>
        <div className="split-image"><Image src={service.finalImage} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
      </section>

      <AreasSection greater={service.coverageTitle.includes("GREATER")} title={service.coverageTitle} />
    </main>
    <SiteFooter />
  </>;
}
