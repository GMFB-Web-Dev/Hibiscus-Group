import Image from "next/image";
import Link from "next/link";
import { AreasSection, ArrowIcon, BoxIcon, Hero, SectionHeading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { serviceList } from "@/lib/site-data";

const cardImages = ["/images/figma/home-8.png", "/images/figma/services-7.png", "/images/figma/services-9.png", "/images/figma/home-7.png", "/images/figma/home-10.png"];
const cardAccents = ["#e52169", "#3989d3", "#f36f07", "#2d8a32", "#f8c919"];
const cardCopy = [
  "Mini skip bins for tight access, clean-ups, waste removal and more.",
  "Water delivery for tanks, rural properties and household supply.",
  "Exterior washing for homes, buildings, driveways and property maintenance.",
  "Tree and arb services for properties needing practical outdoor support.",
  "Digging, tipping and clean-up support for jobs that need a reliable local team.",
];

export default function Home() {
  return <>
    <SiteHeader />
    <main>
      <Hero large image="/images/figma/home-6.png" title="LOCAL SERVICES, DELIVERED 2 U." copy="Hibiscus Group brings practical property, maintenance, and delivery services straight 2 U. From mini skip bins and water supply to washing, arb work, and dig-and-tip services, we make it easier to get the job sorted without running around." />
      <section className="trust-strip">
        <div><Image src="/images/figma/icons/trust-family.png" alt="" width={56} height={60} aria-hidden /><strong>LOCALLY FAMILY-<br />OWNED AND OPERATED</strong></div>
        <div><Image src="/images/figma/icons/trust-location.png" alt="" width={54} height={58} aria-hidden /><strong>North Auckland</strong></div>
        <div><Image src="/images/figma/icons/trust-experience.png" alt="" width={57} height={59} aria-hidden /><strong>20+ YEARS&apos;<br />INDUSTRY EXPERIENCE</strong></div>
        <div><Image src="/images/figma/icons/trust-price.png" alt="" width={50} height={53} aria-hidden /><strong>FIXED-PRICE OPTIONS<br />FOR SKIPS & WATER</strong></div>
      </section>
      <section className="home-services">
        <SectionHeading eyebrow="OUR SERVICES" centered>WHAT DO YOU NEED SORTED?</SectionHeading>
        <p className="section-intro">Choose the service you need and we&apos;ll get you to the right place quickly.</p>
        <div className="service-card-grid">
          {serviceList.map((service, index) => <article className="service-card" key={service.slug} style={{ "--accent": cardAccents[index] } as React.CSSProperties}>
            <div className="service-card-image"><Image src={cardImages[index]} alt="" fill sizes="(max-width: 640px) 90vw, 20vw" /></div>
            <h3>{service.shortName}</h3><p>{cardCopy[index]}</p>
            <Link href={`/services/${service.slug}`}>{service.fixedPrice ? service.slug === "h2o-2-u" ? "ORDER WATER" : "BOOK A SKIP" : service.slug === "arb-2-u" ? "GET ARB HELP" : service.slug === "dig-tip-2-u" ? "BOOK DIG OR TIP" : "REQUEST A WASH"}<ArrowIcon /></Link>
          </article>)}
        </div>
      </section>
      <section className="how-section">
        <div className="how-heading">
          <SectionHeading eyebrow="HOW IT WORKS" centered>PICK IT, PAY ONLINE OR REQUEST A QUOTE</SectionHeading>
          <p>Skips 2 U and H2O 2 U have fixed pricing and can be ordered online. ARB 2 U, WASH 2 U and DIG & TIP 2 U are quoted based on your job. Choose your service and we&apos;ll guide you through the right next step.</p>
        </div>
        <Link className="button button-pink" href="/services">CHECK FIXED PRICE SERVICES <ArrowIcon /></Link>
        <div className="steps">
          <article className="process-step">
            <div className="process-step-image"><Image src="/images/process/step-1.png" alt="" width={1312} height={570} /></div>
            <strong>CHOOSE YOUR SERVICE</strong>
          </article>
          <article className="process-step">
            <div className="process-step-image"><Image src="/images/process/step-2.png" alt="" width={1312} height={570} /></div>
            <strong>SELECT SIZE, QUANTITY OR AREA</strong>
          </article>
          <article className="process-step">
            <div className="process-step-image"><Image src="/images/process/step-3.png" alt="" width={1312} height={570} /></div>
            <strong>PAY ONLINE OR BOOK A SERVICE</strong>
          </article>
        </div>
      </section>
      <section className="split-section home-about"><div className="split-copy"><SectionHeading eyebrow="ABOUT US">A LOCAL FAMILY-OPERATED TEAM THAT GOES THE EXTRA MILE</SectionHeading><p>Hibiscus Group is a local, family-operated business helping customers across the North Shore, Rodney, Dairy Flat and the Hibiscus Coast with practical property services delivered directly to them.</p><p>Founded by Scotty, the business brings together over 20 years of hands-on industry experience across water delivery, skip bins, water blasting, arborist services and digger/truck hire.</p><Link className="button button-pink" href="/about">ABOUT US <ArrowIcon /></Link></div><div className="split-image"><Image src="/images/figma/about-2.jpg" alt="Hibiscus Group team" fill sizes="(max-width: 800px) 100vw, 50vw" /></div></section>
      <section className="values-section"><SectionHeading eyebrow="OUR VALUES">WHY LOCALS CHOOSE HIBISCUS GROUP</SectionHeading><div className="values-grid">{[['GOING THE EXTRA MILE','We put in the extra effort to make sure customers are properly looked after and the job is done right.'],['LOCAL FAMILY SERVICE','As a local, family-operated business, we offer personal service, clear communication and genuine care.'],['ATTENTION TO DETAIL','We do not believe in “near enough is good enough”. Every job should be completed to a high standard.'],['RELIABLE AFTER-SALES SERVICE','If something is not right, we want customers to let us know so we can help fix it properly.']].map(([title,copy]) => <article key={title}><span aria-hidden><BoxIcon /></span><h3>{title}</h3><p>{copy}</p></article>)}<Link className="button button-pink" href="/contact">CONTACT US <ArrowIcon /></Link></div></section>
      <TestimonialsCarousel />
      <AreasSection title="SERVICING NORTH SHORE AND RODNEY" />
    </main>
    <SiteFooter />
  </>;
}
