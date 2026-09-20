import Image from "next/image";
import Link from "next/link";
import { ContactForm } from "@/components/forms";
import { ArrowIcon, BoxIcon, Hero, SectionHeading, SiteFooter, SiteHeader } from "@/components/site-chrome";

const values = [
  ["GOING THE EXTRA MILE", "We put in the extra effort to make sure customers are properly looked after and the job is done right."],
  ["LOCAL FAMILY SERVICE", "As a local, family-operated business, we offer personal service, clear communication and genuine care."],
  ["ATTENTION TO DETAIL", "We do not believe in “near enough is good enough”. Every job should be completed to a high standard."],
  ["RELIABLE AFTER-SALES SERVICE", "If something is not right, we want customers to let us know so we can help fix it properly."],
];

export default function AboutPage() {
  return <>
    <SiteHeader />
    <main>
      <Hero image="/images/figma/about-1.jpg" title="A HANDS-ON TEAM DELIVERING PRACTICAL SERVICES 2 U" copy="Hibiscus Group brings practical property, maintenance, and delivery services straight 2 U. From mini skip bins and water supply to washing, arb work, and dig-and-tip services, we make it easier to get the job sorted without running around." />
      <section className="split-section about-intro"><div className="split-image"><Image src="/images/figma/about-2.jpg" alt="Three members of the Hibiscus Group team" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="split-copy"><SectionHeading eyebrow="ABOUT US">A LOCAL TEAM WITH A PRACTICAL APPROACH</SectionHeading><p>Hibiscus Group was founded by Scotty after years of working hands-on with customers, properties and practical service jobs. Over time, Scott saw how frustrating it can be for people to organise different providers for different tasks, especially when they just want someone reliable to show up, communicate clearly and get the job done properly.</p><p>That is what shaped Hibiscus Group into a local, family-operated business built around making life easier for customers. From mini skip bins and water delivery to maintenance and outdoor services, the goal is to bring useful solutions directly to the customer, so they do not have to run around or deal with multiple companies.</p></div></section>
      <section className="values-section about-values"><SectionHeading eyebrow="OUR VALUES">WHY LOCALS CHOOSE HIBISCUS GROUP</SectionHeading><div className="values-grid">{values.map(([title,copy]) => <article key={title}><span aria-hidden><BoxIcon /></span><h3>{title}</h3><p>{copy}</p></article>)}<Link className="button button-pink" href="/contact">CONTACT US <ArrowIcon /></Link></div></section>
      <section className="split-section team-section"><div className="split-copy"><SectionHeading eyebrow="OUR TEAM">MORE THAN A BUSINESS, IT’S A TEAM WORKING TOGETHER</SectionHeading><p>Hibiscus Group is a small, hands-on team with family at the heart of the business. Scotty works alongside his son and son-in-law, with everyone contributing as part of the same team rather than through formal titles or hierarchy. As the business grows, the goal is to keep that same personal, team-focused approach while continuing to provide practical, reliable service customers can count on.</p></div><div className="split-image"><Image src="/images/figma/about-2.jpg" alt="Hibiscus Group team" fill sizes="(max-width: 800px) 100vw, 50vw" /></div></section>
      <section className="mission-section"><h2>MAKING LIFE EASIER<br />FOR LOCAL<br />CUSTOMERS</h2><div><p>Hibiscus Group&apos;s mission is to make property and maintenance services easier for local customers by bringing practical solutions directly to them. Instead of dealing with multiple providers or running around to organise different jobs, customers can rely on one local, family-operated team to help get things sorted.</p><Link className="button button-pink" href="/book">BOOK SERVICE <ArrowIcon /></Link></div></section>
      <section className="about-contact"><div><SectionHeading eyebrow="Need A Job Sorted?">GET PRACTICAL LOCAL SERVICES DELIVERED 2 U</SectionHeading><p>Whether you need a mini skip bin, water delivery, water blasting, arborist work or digger and truck hire, Hibiscus Group is here to make the process simple.</p><ul><li><Image src="/images/figma/icons/contact-email.svg" alt="" width={32} height={32} aria-hidden /><a href="mailto:info@hib.gdn">info@hib.gdn</a></li><li><Image src="/images/figma/icons/contact-phone.svg" alt="" width={32} height={32} aria-hidden /><a href="tel:+64221831176">022 183 1176</a></li><li><Image src="/images/figma/icons/contact-pin.svg" alt="" width={32} height={32} aria-hidden /><span>202 Pine Valley Road, Dairy Flat</span></li></ul></div><ContactForm compact /></section>
    </main>
    <SiteFooter />
  </>;
}
