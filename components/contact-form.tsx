"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";

import { services } from "@/lib/services";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={42} />
        <h3>Your enquiry is ready.</h3>
        <p>This frontend preview has captured the form state. Connect your preferred form endpoint when the site is prepared for production.</p>
        <button className="button button--black" type="button" onClick={() => setSent(false)}>Send another</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label>First name *<input name="firstName" placeholder="First name" required /></label>
        <label>Last name *<input name="lastName" placeholder="Last name" required /></label>
        <label>Email *<input name="email" type="email" placeholder="Email" required /></label>
        <label>Phone number *<input name="phone" type="tel" placeholder="+64 (02) 111 111 1111" required /></label>
      </div>
      <label>Choose a service *
        <select name="service" defaultValue="" required>
          <option value="" disabled>Select one...</option>
          {services.map((service) => <option key={service.slug} value={service.slug}>{service.name}</option>)}
        </select>
      </label>
      <label>Message *<textarea name="message" rows={6} placeholder="Type your message here..." required /></label>
      <label className="checkbox-field"><input type="checkbox" required /> <span>I agree to the terms and conditions</span></label>
      <button className="button button--pink" type="submit">Submit <ArrowRight size={18} /></button>
    </form>
  );
}
