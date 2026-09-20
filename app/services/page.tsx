import Image from "next/image";
import { AreasSection, ArrowIcon, Hero, SectionHeading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serviceList } from "@/lib/site-data";

const servicesCopy = {
  "skip-2-u": "SKIP 2 U offers mini skip bins designed for smaller jobs, tight access areas and practical waste removal. With 2m³, 3m³ and 4.5m³ skip options, customers can choose the size they need, pay upfront online, and have the bin delivered straight to their property.",
  "h2o-2-u": "H2O 2 U provides water delivery for local homes, properties and sites, with flexible delivery options based on quantity and location. Customers can choose the amount of water they need, confirm their area, pay online, and have it delivered directly to them.",
  "wash-2-u": "WASH 2 U helps keep properties clean, tidy and well maintained with experienced water blasting services. Backed by years of hands-on experience, the team focuses on doing the job properly, paying attention to the details and making sure the final result meets a high standard.",
  "arb-2-u": "ARB 2 U provides arborist services for customers who need help managing trees and outdoor areas. Whether it is part of general property maintenance or a specific outdoor job, the team brings a practical, hands-on approach with a focus on reliable service and proper workmanship.",
  "dig-tip-2-u": "DIG AND TIP 2 U supports customers who need dry digger and truck hire for practical property work, clean-ups and material movement. As this service depends on the job, customers can make an enquiry and the team will review what is needed before providing the right next step.",
};

const listImages = ["/images/figma/services-1.png", "/images/figma/services-7.png", "/images/figma/services-9.png", "/images/figma/services-2.png", "/images/figma/services-6.png"];

export default function ServicesPage() {
  return <>
    <SiteHeader />
    <main>
      <Hero image="/images/figma/services-8.png" title="SERVICES DELIVERED 2 U" copy="From water delivery and mini skip bins to water blasting, arborist work, and digger/truck hire, Hibiscus Group makes it easier to organise the services you need through one local, family-operated team." primaryLabel="BOOK A SERVICE" primaryHref="/book" secondaryLabel="CONTACT US" secondaryHref="/contact" />
      <div className="services-list">
        {serviceList.map((service, index) => <section className={`service-row ${index % 2 ? "reverse" : ""}`} key={service.slug} style={{ "--accent": service.accent } as React.CSSProperties}>
          <div className="service-row-image"><Image src={listImages[index]} alt="" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
          <div className="service-row-copy">
            <SectionHeading eyebrow={service.eyebrow}>{service.shortName}</SectionHeading>
            <p>{servicesCopy[service.slug]}</p>
            <a className="button button-accent" href={`/services/${service.slug}`}>LEARN MORE <ArrowIcon /></a>
          </div>
        </section>)}
      </div>
      <AreasSection title="SERVICING NORTH SHORE AND RODNEY" />
    </main>
    <SiteFooter />
  </>;
}
