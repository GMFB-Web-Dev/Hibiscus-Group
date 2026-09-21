"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  slot_start: string;
  slot_end: string;
  time_zone: string;
  message: string;
};

const emptyValues: BookingValues = {
  first_name: "", last_name: "", email: "", phone: "", sku: "",
  street_address: "", address_line_2: "", city: "", postcode: "",
  preferred_date: "", preferred_time: "", slot_start: "", slot_end: "",
  time_zone: "Pacific/Auckland", message: "",
};

type CalSlot = { start: string; end: string };

async function readJson(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

export function BookingForm({
  initialService,
  inventory,
  checkoutCancelled = false,
}: {
  initialService: ServiceSlug | "general";
  inventory: InventoryItem[];
  checkoutCancelled?: boolean;
}) {
  const [serviceSlug, setServiceSlug] = useState<ServiceSlug | "general">(initialService);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(emptyValues);
  const [consent, setConsent] = useState(false);
  const [slots, setSlots] = useState<CalSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState(checkoutCancelled ? "Payment was cancelled. Your stock hold will be released automatically; choose a time to try again." : "");

  const service = serviceSlug === "general" ? null : services[serviceSlug];
  const accent = service?.accent || "#e91e63";
  const items = inventory.filter((item) => item.service_slug === serviceSlug);
  const selected = items.find((item) => item.sku === values.sku);
  const fixed = service?.fixedPrice ?? false;

  useEffect(() => {
    if (step !== 2 || !fixed) return;
    const controller = new AbortController();
    const start = new Date();
    const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

    Promise.resolve()
      .then(() => {
        setSlotsLoading(true);
        setError("");
        return fetch(`/api/booking/slots?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}&timeZone=${encodeURIComponent(values.time_zone)}`, {
          signal: controller.signal,
        });
      })
      .then(readJson)
      .then((body) => setSlots(body.slots || []))
      .catch((slotError) => {
        if (slotError instanceof DOMException && slotError.name === "AbortError") return;
        setError(slotError instanceof Error ? slotError.message : "Unable to load booking times.");
      })
      .finally(() => setSlotsLoading(false));

    return () => controller.abort();
  }, [fixed, step, values.time_zone]);

  const slotsByDay = useMemo(() => slots.reduce<Record<string, CalSlot[]>>((groups, slot) => {
    const day = new Intl.DateTimeFormat("en-NZ", {
      timeZone: values.time_zone,
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(slot.start));
    (groups[day] ||= []).push(slot);
    return groups;
  }, {}), [slots, values.time_zone]);

  function update(name: keyof BookingValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function validStep() {
    if (step === 1) return values.first_name && values.last_name && values.email && values.phone && serviceSlug !== "general" && (!fixed || values.sku);
    if (step === 2) return values.street_address && values.city && values.postcode && (fixed ? values.slot_start : values.preferred_date);
    return consent;
  }

  async function submit() {
    setStatus("submitting");
    setError("");
    try {
      if (fixed) {
        const response = await fetch("/api/booking/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_slug: serviceSlug,
            inventory_sku: values.sku,
            ...values,
            consent_terms: consent,
          }),
        });
        const body = await readJson(response);
        window.location.assign(body.url);
        return;
      }

      await sendRequest({
        request_kind: "quote",
        service_slug: serviceSlug,
        inventory_sku: null,
        ...values,
        consent_terms: consent,
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
        <p className="booking-kicker">QUOTE REQUEST SENT.</p>
        <h1>WE’LL BE IN TOUCH</h1><span className="heading-line" />
        <p className="booking-subtitle">Thanks {values.first_name}. The Hibiscus Group team will review the job and contact you shortly.</p>
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
        {step === 1 ? "Choose your service, see live stock, and enter your contact details." : step === 2 ? (fixed ? "Enter the service address and choose a live Cal.com time." : "Enter your address, preferred date and job details.") : (fixed ? "Review everything before continuing to secure Stripe payment." : "Review your request before sending it to our team.")}
      </p>

      {step === 1 && <div className="booking-fields two-col">
        <label>First name<input value={values.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="First name" /></label>
        <label>Last name<input value={values.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Last name" /></label>
        <label>Email<input type="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" /></label>
        <label>Phone number<input type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+64 (02) 111 111 111" /></label>
        <label className="full">Choose a service<select value={serviceSlug} onChange={(e) => { setServiceSlug(e.target.value as ServiceSlug); setSlots([]); setValues((current) => ({ ...current, sku: "", slot_start: "", slot_end: "" })); }}><option value="general" disabled>Select one...</option>{serviceList.map((item) => <option key={item.slug} value={item.slug}>{item.shortName}</option>)}</select></label>
        {fixed && <div className="full inventory-choice" role="radiogroup" aria-label="Choose an available option">
          {items.length ? items.map((item) => <button
            className={`inventory-card ${values.sku === item.sku ? "selected" : ""}`}
            key={item.sku}
            type="button"
            role="radio"
            aria-checked={values.sku === item.sku}
            onClick={() => update("sku", item.sku)}
          >
            <span className="stock-badge">{item.stock_quantity === 1 ? "1 LEFT" : `${item.stock_quantity} AVAILABLE`}</span>
            <strong>{item.name}</strong>
            <small>{item.detail}</small>
            <b>${(item.price_cents / 100).toFixed(0)} NZD</b>
          </button>) : <p className="stock-empty">No stock is currently available for this service.</p>}
        </div>}
      </div>}

      {step === 2 && <div className="booking-fields">
        <label>Street address *<input value={values.street_address} onChange={(e) => update("street_address", e.target.value)} placeholder="House number and street name" /></label>
        <label><span className="visually-hidden">Address line two</span><input value={values.address_line_2} onChange={(e) => update("address_line_2", e.target.value)} placeholder="Apartment, suite, unit, etc. (optional)" /></label>
        <label>Town / City *<input value={values.city} onChange={(e) => update("city", e.target.value)} /></label>
        <label>Post Code *<input value={values.postcode} onChange={(e) => update("postcode", e.target.value)} /></label>
        {fixed ? <div className="cal-slots">
          <div className="cal-slots-heading"><strong>Available times</strong><span>Powered by Cal.com · {values.time_zone}</span></div>
          {slotsLoading && <p>Loading live availability…</p>}
          {!slotsLoading && !slots.length && <p>No times are available in the next 14 days. Please call 022 183 1176.</p>}
          {Object.entries(slotsByDay).map(([day, daySlots]) => <div className="slot-day" key={day}>
            <strong>{day}</strong>
            <div>{daySlots.map((slot) => <button
              type="button"
              key={slot.start}
              className={values.slot_start === slot.start ? "selected" : ""}
              aria-pressed={values.slot_start === slot.start}
              onClick={() => setValues((current) => ({ ...current, slot_start: slot.start, slot_end: slot.end }))}
            >{new Intl.DateTimeFormat("en-NZ", { timeZone: values.time_zone, hour: "numeric", minute: "2-digit" }).format(new Date(slot.start))}</button>)}</div>
          </div>)}
        </div> : <div className="two-col">
          <label>Preferred date *<input type="date" value={values.preferred_date} onChange={(e) => update("preferred_date", e.target.value)} /></label>
          <label>Preferred time<select value={values.preferred_time} onChange={(e) => update("preferred_time", e.target.value)}><option value="">Select one...</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>
        </div>}
        <label>Job notes<textarea value={values.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us anything useful about access, timing or the job..." /></label>
      </div>}

      {step === 3 && <div className="booking-review">
        <div><span>Service</span><strong>{service?.shortName}</strong></div>
        {selected && <><div><span>Option</span><strong>{selected.name}</strong></div><div><span>Price</span><strong>${(selected.price_cents / 100).toFixed(0)} NZD</strong></div></>}
        <div><span>Name</span><strong>{values.first_name} {values.last_name}</strong></div>
        <div><span>Contact</span><strong>{values.email}<br />{values.phone}</strong></div>
        <div><span>Address</span><strong>{values.street_address}{values.address_line_2 ? `, ${values.address_line_2}` : ""}<br />{values.city} {values.postcode}</strong></div>
        <div><span>{fixed ? "Cal.com time" : "Preferred date"}</span><strong>{fixed && values.slot_start ? new Intl.DateTimeFormat("en-NZ", { timeZone: values.time_zone, dateStyle: "full", timeStyle: "short" }).format(new Date(values.slot_start)) : `${values.preferred_date} ${values.preferred_time}`}</strong></div>
        {fixed && <p className="payment-note">Next, you’ll go to Stripe’s secure sandbox Checkout. Your Cal.com time and selected stock are held while payment is open; stock is deducted only after payment succeeds.</p>}
        <label className="checkbox booking-consent"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />I agree to the terms and conditions</label>
      </div>}

      {error && <p className="form-message error">{error}</p>}
      <div className="booking-actions">
        {step > 1 && <button className="button button-outline-dark" type="button" onClick={() => setStep((current) => current - 1)}>BACK</button>}
        {step < 3 ? <button className="button button-accent" type="button" disabled={!validStep()} onClick={() => setStep((current) => current + 1)}>NEXT <ArrowIcon /></button> : <button className="button button-accent" type="button" disabled={status === "submitting" || !validStep()} onClick={submit}>{status === "submitting" ? (fixed ? "OPENING STRIPE..." : "SENDING...") : (fixed ? "CONTINUE TO PAYMENT" : "CONFIRM REQUEST")} <ArrowIcon /></button>}
      </div>
    </section>
  );
}
