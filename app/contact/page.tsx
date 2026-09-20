import Image from "next/image";
import { ContactForm } from "@/components/forms";
import { Hero, SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function ContactPage() {
  return <>
    <SiteHeader />
    <main className="contact-page">
      <Hero image="/images/figma/contact-1.png" title="NEED A SERVICE DELIVERED 2 U?" copy="Whether you need water delivery, a mini skip bin, water blasting, arborist services or digger and truck hire, get in touch with the Hibiscus Group team and we’ll help point you in the right direction." />
      <section className="contact-cards">
        <div className="contact-heading">
          <p>Tell Us What You Need</p>
          <h2>WE’RE HERE TO HELP</h2>
          <Image src="/images/figma/contact/underline.svg" alt="" width={233} height={8} />
        </div>
        <div className="contact-card-grid">
          <article>
            <Image src="/images/figma/contact/email.svg" alt="" width={56} height={56} />
            <h3>EMAIL</h3>
            <a href="mailto:info@hib.gdn">info@hib.gdn</a>
          </article>
          <article>
            <Image src="/images/figma/contact/phone.svg" alt="" width={56} height={56} />
            <h3>PHONE</h3>
            <a href="tel:+64221831176">022 183 1176</a>
          </article>
          <article>
            <Image src="/images/figma/contact/pin.svg" alt="" width={56} height={56} />
            <h3>OFFICE</h3>
            <p>202 Pine Valley Road, Dairy Flat</p>
          </article>
        </div>
      </section>
      <section className="contact-form-section"><ContactForm /></section>
    </main>
    <SiteFooter />
  </>;
}
