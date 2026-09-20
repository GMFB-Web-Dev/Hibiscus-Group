"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowIcon } from "@/components/site-chrome";
import { serviceList, services, type ServiceSlug } from "@/lib/site-data";

type FormStatus = "idle" | "submitting" | "success" | "error";

async function sendRequest(payload: Record<string, unknown>) {
  const response = await fetch("/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Unable to submit your request.");
  return body;
}

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;
    setStatus("submitting");
    setMessage("");
    try {
      await sendRequest({
        request_kind: "enquiry",
        service_slug: data.get("service") || "general",
        first_name: data.get("first_name"),
        last_name: data.get("last_name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
        consent_terms: data.get("consent") === "on",
      });
      setStatus("success");
      setMessage("Thanks — your request has been sent. We’ll be in touch soon.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form className={`contact-form ${compact ? "compact" : ""}`} onSubmit={onSubmit}>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
      <label>First name<input required name="first_name" placeholder="First name" maxLength={80} /></label>
      <label>Last name<input required name="last_name" placeholder="Last name" maxLength={80} /></label>
      <label>Email<input required name="email" type="email" placeholder="Email" maxLength={254} /></label>
      <label>Phone number<input required name="phone" type="tel" placeholder="+64 (02) 111 111 111" maxLength={40} /></label>
      <label className="full">Choose a service
        <select name="service" defaultValue="">
          <option value="">Select one...</option>
          {serviceList.map((service) => <option key={service.slug} value={service.slug}>{service.shortName}</option>)}
        </select>
      </label>
      <label className="full">Message<textarea required name="message" placeholder="Type your message here..." maxLength={5000} /></label>
      <label className="checkbox full"><input required name="consent" type="checkbox" />I agree to the terms and conditions</label>
      <div className="full form-submit-row">
        <button className="button button-pink" disabled={status === "submitting"} type="submit">
          {status === "submitting" ? "SENDING..." : "SUBMIT"}<ArrowIcon />
        </button>
        {message && <p className={`form-message ${status}`}>{message}</p>}
      </div>
    </form>
  );
}

export type InventoryItem = {
  sku: string;
  service_slug: string;
  name: string;
  detail: string;
  price_cents: number;
  stock_quantity: number;
};

type BookingValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sku: string;
  street_address: string;
  address_line_2: string;
  city: string;
  postcode: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
};

const emptyValues: BookingValues = {
  first_name: "", last_name: "", email: "", phone: "", sku: "",
  street_address: "", address_line_2: "", city: "", postcode: "",
  preferred_date: "", preferred_time: "", message: "",
};

export function BookingForm({ initialService, inventory }: { initialService: ServiceSlug | "general"; inventory: InventoryItem[] }) {
  const [serviceSlug, setServiceSlug] = useState<ServiceSlug | "general">(initialService);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(emptyValues);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  const service = serviceSlug === "general" ? null : services[serviceSlug];
  const accent = service?.accent || "#e91e63";
  const items = inventory.filter((item) => item.service_slug === serviceSlug);
  const selected = items.find((item) => item.sku === values.sku);
  const fixed = service?.fixedPrice ?? false;

  const selectionGroups = useMemo(() => {
    if (!fixed) return [];
    return items.map((item) => ({ value: item.sku, label: `${item.name} — ${item.detail} — $${(item.price_cents / 100).toFixed(0)}` }));
  }, [fixed, items]);

  function update(name: keyof BookingValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function validStep() {
    if (step === 1) return values.first_name && values.last_name && values.email && values.phone && serviceSlug !== "general" && (!fixed || values.sku);
    if (step === 2) return values.street_address && values.city && values.postcode && values.preferred_date;
    return true;
  }

  async function submit() {
    setStatus("submitting");
    setError("");
    try {
      await sendRequest({
        request_kind: fixed ? "booking" : "quote",
        service_slug: serviceSlug,
        inventory_sku: values.sku || null,
        ...values,
        consent_terms: true,
        details: selected ? { item_name: selected.name, item_detail: selected.detail } : {},
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to submit your booking.");
    }
  }

  if (status === "success") {
    return (
      <section className="booking-shell" style={{ "--accent": accent } as React.CSSProperties}>
        <p className="booking-kicker">BOOK IT. WE’LL CONFIRM IT.</p>
        <h1>REQUEST RECEIVED</h1><span className="heading-line" />
        <p className="booking-subtitle">Thanks {values.first_name}. The Hibiscus Group team will confirm the details with you shortly.</p>
        <Link className="button button-accent" href="/">BACK TO HOME <ArrowIcon /></Link>
      </section>
    );
  }

  return (
    <section className="booking-shell" style={{ "--accent": accent } as React.CSSProperties}>
      <p className="booking-kicker">{fixed ? "Book it. Pay it." : "BOOK IT. WE QUOTE IT."}</p>
      <h1>{service ? `BOOK YOUR ${service.shortName}` : "BOOK A SERVICE"}</h1>
      <span className="heading-line" />
      <p className="booking-subtitle">
        {step === 1 ? "Choose your service and enter your contact details." : step === 2 ? "Enter your address, preferred date and job details." : "Review your request before sending it to our team."}
      </p>

      {step === 1 && <div className="booking-fields two-col">
        <label>First name<input value={values.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="First name" /></label>
        <label>Last name<input value={values.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Last name" /></label>
        <label>Email<input type="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" /></label>
        <label>Phone number<input type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+64 (02) 111 111 111" /></label>
        <label className="full">Choose a service<select value={serviceSlug} onChange={(e) => { setServiceSlug(e.target.value as ServiceSlug); update("sku", ""); }}><option value="general" disabled>Select one...</option>{serviceList.map((item) => <option key={item.slug} value={item.slug}>{item.shortName}</option>)}</select></label>
        {fixed && <label className="full">Choose an option<select value={values.sku} onChange={(e) => update("sku", e.target.value)}><option value="">Select one...</option>{selectionGroups.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
      </div>}

      {step === 2 && <div className="booking-fields">
        <label>Street address *<input value={values.street_address} onChange={(e) => update("street_address", e.target.value)} placeholder="House number and street name" /></label>
        <label><span className="visually-hidden">Address line two</span><input value={values.address_line_2} onChange={(e) => update("address_line_2", e.target.value)} placeholder="Apartment, suite, unit, etc. (optional)" /></label>
        <label>Town / City *<input value={values.city} onChange={(e) => update("city", e.target.value)} /></label>
        <label>Post Code *<input value={values.postcode} onChange={(e) => update("postcode", e.target.value)} /></label>
        <div className="two-col">
          <label>Date *<input type="date" value={values.preferred_date} onChange={(e) => update("preferred_date", e.target.value)} /></label>
          <label>Time<select value={values.preferred_time} onChange={(e) => update("preferred_time", e.target.value)}><option value="">Select one...</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
        </div>
        <label>Job notes<textarea value={values.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us anything useful about access, timing or the job..." /></label>
      </div>}

      {step === 3 && <div className="booking-review">
        <div><span>Service</span><strong>{service?.shortName}</strong></div>
        {selected && <><div><span>Option</span><strong>{selected.name}</strong></div><div><span>Price</span><strong>${(selected.price_cents / 100).toFixed(0)} NZD</strong></div></>}
        <div><span>Name</span><strong>{values.first_name} {values.last_name}</strong></div>
        <div><span>Contact</span><strong>{values.email}<br />{values.phone}</strong></div>
        <div><span>Address</span><strong>{values.street_address}{values.address_line_2 ? `, ${values.address_line_2}` : ""}<br />{values.city} {values.postcode}</strong></div>
        <div><span>Preferred date</span><strong>{values.preferred_date} {values.preferred_time}</strong></div>
        {fixed && <p className="payment-note">Your booking request will be confirmed by the team. Secure payment checkout can be added once a payment provider is connected; no card details are collected here.</p>}
      </div>}

      {error && <p className="form-message error">{error}</p>}
      <div className="booking-actions">
        {step > 1 && <button className="button button-outline-dark" type="button" onClick={() => setStep((current) => current - 1)}>BACK</button>}
        {step < 3 ? <button className="button button-accent" type="button" disabled={!validStep()} onClick={() => setStep((current) => current + 1)}>NEXT <ArrowIcon /></button> : <button className="button button-accent" type="button" disabled={status === "submitting"} onClick={submit}>{status === "submitting" ? "SENDING..." : "CONFIRM REQUEST"} <ArrowIcon /></button>}
      </div>
    </section>
  );
}
