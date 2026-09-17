import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PageBanner } from "@/components/page-banner";
import { ValuesSection } from "@/components/values-section";

export const metadata: Metadata = { title: "About", description: "Meet the local family team behind Hibiscus Group." };

export default function AboutPage() {
  return (
    <>
      <PageBanner eyebrow="About Hibiscus Group" title="Local people. Practical services." copy="A hands-on, family-operated team helping local customers get everyday property and maintenance jobs sorted properly." />
      <section className="figma-about-row figma-about-row--story">
        <div className="figma-about-row__image"><Image src="/images/about-team.jpg" alt="The Hibiscus Group team" fill priority sizes="(max-width: 850px) 100vw, 50vw" /></div>
        <div className="figma-about-row__copy">
          <p className="figma-kicker">About us</p>
          <h2>A local team with a practical approach</h2><span className="figma-rule" />
          <p>Hibiscus Group was founded by Scotty after years of working hands-on with customers, properties and practical service jobs. Over time, Scott saw how frustrating it can be for people to organise different providers for different tasks, especially when they just want someone reliable to show up, communicate clearly and get the job done properly.</p>
          <p>That is what shaped Hibiscus Group into a local, family-operated business built around making life easier for customers. From mini skip bins and water delivery to maintenance and outdoor services, the goal is to bring useful solutions directly to the customer, so they do not have to run around or deal with multiple companies. With a strong focus on quality service, attention to detail and going the extra mile, the team takes pride in helping people keep their properties looking good, working well and properly looked after.</p>
        </div>
      </section>
      <section className="figma-about-row figma-about-row--team">
        <div className="figma-about-row__copy">
          <p className="figma-kicker">Our team</p>
          <h2>More than a business, it’s a team working together</h2><span className="figma-rule" />
          <p>Hibiscus Group is a small, hands-on team with family at the heart of the business. Scotty works alongside his son and son-in-law, with everyone contributing as part of the same team rather than through formal titles or hierarchy. As the business grows, the goal is to keep that same personal, team-focused approach while continuing to provide practical, reliable service customers can count on.</p>
        </div>
        <div className="figma-about-row__image"><Image src="/images/about-family.jpg" alt="Hibiscus Group working together" fill sizes="(max-width: 850px) 100vw, 50vw" /></div>
      </section>
      <ValuesSection />
      <section className="figma-about-cta"><div><p>Practical local help, delivered 2 U</p><h2>Ready to get your next job sorted?</h2></div><Link className="figma-button" href="/services">Explore our services <ArrowRight /></Link></section>
      <section className="figma-about-contact">
        <div className="figma-about-contact__copy"><p className="figma-kicker">Need a job sorted?</p><h2>Get practical local services delivered 2 U</h2><span className="figma-rule" /><p>Whether you need a mini skip bin, water delivery, water blasting, arborist work or digger and truck hire, Hibiscus Group is here to make the process simple.</p></div>
        <ContactForm />
      </section>
    </>
  );
}
