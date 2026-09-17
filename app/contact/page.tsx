import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PageBanner } from "@/components/page-banner";

export const metadata: Metadata = { title: "Contact", description: "Contact Hibiscus Group about a service in North Auckland." };

export default function ContactPage() {
  return (
    <>
      <PageBanner eyebrow="Contact us" title="Let’s get your job sorted" copy="Tell us what you need and our local team will help you choose the right service, booking path or next step." />
      <section className="figma-contact-cards">
        <div className="figma-contact-cards__heading"><p>Tell us what you need</p><h2>We’re here to help</h2><span className="figma-rule" /></div>
        <div className="figma-contact-cards__grid">
          <a href="mailto:info@hib.gdn"><i><Mail /></i><h3>Email</h3><p>info@hib.gdn</p></a>
          <a href="tel:+64221831176"><i><Phone /></i><h3>Phone</h3><p>022 183 1176</p></a>
          <div><i><MapPin /></i><h3>Office</h3><p>202 Pine Valley Road, Dairy Flat</p></div>
        </div>
      </section>
      <section className="figma-contact-form"><ContactForm /></section>
    </>
  );
}
