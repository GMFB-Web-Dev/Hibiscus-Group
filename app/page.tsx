import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign } from "lucide-react";

import { ServiceCard } from "@/components/service-card";
import { Testimonials } from "@/components/testimonials";
import { serviceAreas, services } from "@/lib/services";

const trustItems = [
  { image: "/images/trust-family.png", label: "Locally family-owned and operated" },
  { image: "/images/trust-location.png", label: "North Auckland" },
  { image: "/images/trust-experience.png", label: "20+ years’ industry experience" },
] as const;

const cardActions = ["Book a skip", "Book water", "Request a wash", "Get arb help", "Book dig & tip"];

const values = [
  { title: "Going the extra mile", copy: "We put in the extra effort to make sure customers are properly looked after and the job is done right." },
  { title: "Local family service", copy: "As a local, family-operated business, we offer personal service, clear communication and genuine care." },
  { title: "Attention to detail", copy: "We do not believe in “near enough is good enough”. Every job should be completed to a high standard." },
  { title: "Reliable after-sales service", copy: "If something is not right, we want customers to let us know so we can help fix it properly." },
] as const;

const steps = [
  { image: "/images/process-select-figma.png", title: "Choose your service" },
  { image: "/images/process-book-figma.png", title: "Select size, quantity or area" },
  { image: "/images/process-deliver-figma.png", title: "Pay online or book a service" },
] as const;

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <Image src="/images/hero.png" alt="Hibiscus Group trucks and colourful mini skip bins" fill priority sizes="100vw" />
        <div className="home-hero__overlay" />
        <div className="home-shell home-hero__content">
          <h1>Local services, delivered 2 U.</h1>
          <p>Hibiscus Group brings practical property, maintenance, and delivery services straight 2 U. From mini skip bins and water supply to washing, arb work, and dig-and-tip services, we make it easier to get the job sorted without running around.</p>
          <div className="home-actions">
            <Link className="home-button home-button--pink" href="/book">Book a service <ArrowRight /></Link>
            <Link className="home-button home-button--outline" href="#services">Our services <ArrowRight /></Link>
          </div>
        </div>
        <div className="home-trust">
          <div className="home-shell home-trust__inner">
            {trustItems.map((item) => (
              <div className="home-trust__item" key={item.label}>
                <Image src={item.image} alt="" width={50} height={50} />
                <span>{item.label}</span>
              </div>
            ))}
            <div className="home-trust__item">
              <BadgeDollarSign aria-hidden="true" />
              <span>Fixed-price options for skips &amp; water</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-services" id="services">
        <div className="home-shell">
          <div className="home-heading home-heading--center">
            <p className="home-eyebrow">Our services</p>
            <h2>What do you need sorted?</h2>
            <span className="home-rule" />
            <p>Choose the service you need and we’ll guide you through the right next step.</p>
          </div>
          <div className="home-service-grid">
            {services.map((service, index) => <ServiceCard key={service.slug} service={service} ctaLabel={cardActions[index]} home />)}
          </div>
        </div>
      </section>

      <section className="home-process">
        <div className="home-shell">
          <div className="home-heading home-heading--center">
            <p className="home-eyebrow">How it works</p>
            <h2>Pick it, pay online or request a quote</h2>
            <span className="home-rule" />
            <p>Skips 2 U and H2O 2 U have fixed pricing and can be ordered online. ARB 2 U, WASH 2 U and DIG &amp; TIP 2 U are quoted based on your job. Choose your service and we’ll guide you through the right next step.</p>
          </div>
          <Link className="home-button home-button--pink home-process__button" href="/book">Check fixed price services <ArrowRight /></Link>
          <div className="home-process__grid">
            {steps.map((step, index) => (
              <article key={step.title}>
                <div className={`home-process__image home-process__image--${index + 1}`}><Image src={step.image} alt="" fill sizes="416px" /></div>
                <h3>{step.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="home-shell home-about__grid">
          <div className="home-about__copy">
            <p className="home-eyebrow">About us</p>
            <h2>A local family-operated team that goes the extra mile</h2>
            <span className="home-rule" />
            <p>Hibiscus Group is a local, family-operated business helping customers across the North Shore, Rodney, Dairy Flat and the Hibiscus Coast with practical services delivered directly to them.</p>
            <p>Founded by Scotty, the business brings together over 20 years of hands-on industry experience across water delivery, skip bins, arborist works and machinery services. Hibiscus Group is built on practical, reliable service, clear communication and doing the job properly.</p>
            <Link className="home-button home-button--pink" href="/about">About us <ArrowRight /></Link>
          </div>
          <div className="home-about__image"><Image src="/images/about-team.jpg" alt="The local Hibiscus Group team" fill sizes="616px" /></div>
        </div>
      </section>

      <section className="home-values">
        <div className="home-shell home-values__grid">
          <div className="home-values__heading">
            <p className="home-eyebrow">Our values</p>
            <h2>Why locals choose Hibiscus Group</h2>
            <span className="home-rule" />
          </div>
          <div className="home-values__items">
            {values.map(({ title, copy }) => (
              <article key={title}>
                <Image className="home-values__icon" src="/images/value-cube.svg" alt="" width={48} height={48} />
                <div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
            <Link className="home-button home-button--pink" href="/contact">Contact us <Image src="/images/value-arrow.svg" alt="" width={22} height={22} /></Link>
          </div>
        </div>
      </section>

      <section className="home-testimonials">
        <div className="home-shell">
          <div className="home-heading home-heading--center">
            <p className="home-eyebrow">Testimonials</p>
            <h2>Trusted by local customers</h2>
            <span className="home-rule" />
          </div>
          <Testimonials />
        </div>
      </section>

      <section className="home-areas">
        <div className="home-shell home-areas__grid">
          <div className="home-area-list">{serviceAreas.map((area) => <span key={area}><Image src="/images/value-cube.svg" alt="" width={30} height={30} />{area}</span>)}</div>
          <div className="home-areas__copy">
            <h2>Servicing North Shore and Rodney</h2>
            <span className="home-rule" />
            <p>Based in Dairy Flat, we service a wide area across Rodney, Hibiscus Coast, North Shore and nearby locations.</p>
          </div>
        </div>
      </section>
    </>
  );
}
