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

function inventoryType(item: InventoryItem) {
  if (item.service_slug === "skip-2-u") {
    return item.sku.startsWith("skip-hardfill-") ? "Hard fill" : "Rubbish";
  }
  if (item.service_slug === "h2o-2-u") {
    return item.name.split(" to ")[1] || item.name;
  }
  return item.detail || item.name;
}

function inventorySize(item: InventoryItem) {
  if (item.service_slug === "h2o-2-u") {
    return item.name.split(" to ")[0];
  }
  return item.name;
}

type BookingValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
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
  first_name: "", last_name: "", email: "", phone: "",
  street_address: "", address_line_2: "", city: "", postcode: "",
  preferred_date: "", preferred_time: "", slot_start: "", slot_end: "",
  time_zone: "Pacific/Auckland", message: "",
};

type CalSlot = { start: string; end: string };
type CartLine = { id: number; type: string; sku: string; quantity: number };
const emptyCartLine = (id: number): CartLine => ({ id, type: "", sku: "", quantity: 1 });
const LARGE_SKIP_SKU = "skip-rubbish-45";

async function readJson(response: Response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Something went wrong.");
  return body;
}

export function BookingForm({
  initialService,
  inventory,
  inventoryUnavailable = false,
  checkoutCancelled = false,
}: {
  initialService: ServiceSlug | "general";
  inventory: InventoryItem[];
  inventoryUnavailable?: boolean;
  checkoutCancelled?: boolean;
}) {
  const [serviceSlug, setServiceSlug] = useState<ServiceSlug | "general">(initialService);
  const [cart, setCart] = useState<CartLine[]>([emptyCartLine(0)]);
  const [nextCartId, setNextCartId] = useState(1);
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
  const types = [...new Set(items.map(inventoryType))];
  const selectedItems = cart.map((line) => ({
    ...line,
    item: items.find((item) => item.sku === line.sku),
  }));
  const cartTotal = selectedItems.reduce((total, line) =>
    total + (line.item?.price_cents ?? 0) * line.quantity, 0);
  const largeSkipSelected = cart.some((line) => line.sku === LARGE_SKIP_SKU);
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

  function updateCartLine(id: number, patch: Partial<CartLine>) {
    setCart((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));
    setValues((current) => ({ ...current, slot_start: "", slot_end: "" }));
  }

  function addCartLine() {
    setCart((current) => [...current, emptyCartLine(nextCartId)]);
    setNextCartId((current) => current + 1);
    setValues((current) => ({ ...current, slot_start: "", slot_end: "" }));
  }

  function removeCartLine(id: number) {
    setCart((current) => current.filter((line) => line.id !== id));
    setValues((current) => ({ ...current, slot_start: "", slot_end: "" }));
  }

  function validStep() {
    if (step === 1) {
      const skus = cart.map((line) => line.sku);
      const cartValid = cart.length > 0
        && cart.every((line) => {
          const item = items.find((candidate) => candidate.sku === line.sku);
          return Boolean(item && Number.isInteger(line.quantity)
            && line.quantity > 0 && line.quantity <= item.stock_quantity
            && (line.sku !== LARGE_SKIP_SKU || line.quantity === 1));
        })
        && new Set(skus).size === skus.length
        && (!largeSkipSelected || cart.length === 1);
      return values.first_name && values.last_name && values.email && values.phone
        && serviceSlug !== "general" && (!fixed || cartValid);
    }
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
            inventory_items: cart.map(({ sku, quantity }) => ({ sku, quantity })),
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
    <section className={`booking-shell ${step === 1 ? "booking-step-one" : ""}`} style={{ "--accent": accent } as React.CSSProperties}>
      <p className="booking-kicker">{fixed ? "Book it. Pay it." : "BOOK IT. WE QUOTE IT."}</p>
      <h1>{service ? `BOOK YOUR ${service.shortName}` : "BOOK A SERVICE"}</h1>
      <span className="heading-line" />
      <p className="booking-subtitle">
        {step === 1 ? (serviceSlug === "skip-2-u" ? "Choose Your Skip, Select Your Option, Enter Your Details And Pay Online." : serviceSlug === "h2o-2-u" ? "Choose Your Water Delivery, Select Your Load, Enter Your Details And Pay Online." : "Choose your service and enter your contact details.") : step === 2 ? (fixed ? "Enter the service address and choose an available booking time." : "Enter your address, preferred date and job details.") : (fixed ? "Review everything before continuing to secure payment." : "Review your request before sending it to our team.")}
      </p>

      {step === 1 && <div className="booking-fields two-col booking-first-fields">
        <label>First name<input value={values.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="First name" /></label>
        <label>Last name<input value={values.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Last name" /></label>
        <label>Email<input type="email" value={values.email} onChange={(e) => update("email", e.target.value)} placeholder="Email" /></label>
        <label>Phone number<input type="tel" value={values.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+64 (02) 111 111 111" /></label>
        {initialService === "general" && <label className="full booking-select-field">Choose a service<select value={serviceSlug} onChange={(e) => { setServiceSlug(e.target.value as ServiceSlug); setCart([emptyCartLine(0)]); setNextCartId(1); setSlots([]); setValues((current) => ({ ...current, slot_start: "", slot_end: "" })); }}><option value="general" disabled>Select one...</option>{serviceList.map((item) => <option key={item.slug} value={item.slug}>{item.shortName}</option>)}</select></label>}
        {fixed && <>
          {cart.map((line, index) => {
            const sizes = items.filter((item) => inventoryType(item) === line.type);
            const selectedItem = items.find((item) => item.sku === line.sku);
            return <div className="booking-cart-line full" key={line.id}>
              <div className="booking-cart-line-heading">
                <strong>{index === 0 ? "First item" : `Item ${index + 1}`}</strong>
                {cart.length > 1 && <button type="button" onClick={() => removeCartLine(line.id)}>Remove</button>}
              </div>
              <label className="booking-select-field">{serviceSlug === "h2o-2-u" ? "Choose an Area" : "Choose a Type"}
                <select value={line.type} disabled={!types.length} onChange={(event) => updateCartLine(line.id, { type: event.target.value, sku: "", quantity: 1 })}>
                  <option value="">Select one...</option>
                  {types.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="booking-select-field">{serviceSlug === "h2o-2-u" ? "Choose a Load Size" : "Choose a Size"}
                <select value={line.sku} disabled={!line.type} onChange={(event) => updateCartLine(line.id, { sku: event.target.value, quantity: 1 })}>
                  <option value="">Select one...</option>
                  {sizes.map((item) => <option key={item.sku} value={item.sku} disabled={cart.some((other) => other.id !== line.id && other.sku === item.sku) || (item.sku === LARGE_SKIP_SKU && cart.length > 1)}>{inventorySize(item)} — {item.stock_quantity} available · ${(item.price_cents / 100).toFixed(0)} NZD</option>)}
                </select>
              </label>
              {selectedItem && <label className="booking-quantity-field">Quantity
                <select value={line.quantity} onChange={(event) => updateCartLine(line.id, { quantity: Number(event.target.value) })}>
                  {Array.from({ length: Math.min(selectedItem.stock_quantity, selectedItem.sku === LARGE_SKIP_SKU ? 1 : 10) }, (_, quantity) => quantity + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                </select>
              </label>}
            </div>;
          })}
          <div className="booking-cart-actions full">
            <button type="button" disabled={largeSkipSelected || cart.length >= 10 || cart.some((line) => !line.sku)} onClick={addCartLine}>+ ADD ANOTHER ITEM</button>
            {largeSkipSelected && <span>The 4.5m³ Large Mini Skip must be booked on its own, with a quantity of one.</span>}
            {cart.some((line) => line.sku) && <strong>Total: ${(cartTotal / 100).toFixed(2)} NZD</strong>}
          </div>
          {!types.length && <p className="stock-empty full">{inventoryUnavailable ? "Availability could not be loaded. Please try again shortly." : "No stock is currently available for this service."}</p>}
        </>}
      </div>}

      {step === 2 && <div className="booking-fields">
        <label>Street address *<input value={values.street_address} onChange={(e) => update("street_address", e.target.value)} placeholder="House number and street name" /></label>
        <label><span className="visually-hidden">Address line two</span><input value={values.address_line_2} onChange={(e) => update("address_line_2", e.target.value)} placeholder="Apartment, suite, unit, etc. (optional)" /></label>
        <label>Town / City *<input value={values.city} onChange={(e) => update("city", e.target.value)} /></label>
        <label>Post Code *<input value={values.postcode} onChange={(e) => update("postcode", e.target.value)} /></label>
        {fixed ? <div className="cal-slots">
          <div className="cal-slots-heading"><strong>Available times</strong><span>{values.time_zone}</span></div>
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
        {fixed && <>
          <div className="booking-review-items"><span>Items</span><strong>{selectedItems.map((line) => <span key={line.id}>{line.quantity} × {line.item?.name}<br /></span>)}</strong></div>
          <div><span>Total</span><strong>${(cartTotal / 100).toFixed(2)} NZD</strong></div>
        </>}
        <div><span>Name</span><strong>{values.first_name} {values.last_name}</strong></div>
        <div><span>Contact</span><strong>{values.email}<br />{values.phone}</strong></div>
        <div><span>Address</span><strong>{values.street_address}{values.address_line_2 ? `, ${values.address_line_2}` : ""}<br />{values.city} {values.postcode}</strong></div>
        <div><span>{fixed ? "Selected booking time" : "Preferred date"}</span><strong>{fixed && values.slot_start ? new Intl.DateTimeFormat("en-NZ", { timeZone: values.time_zone, dateStyle: "full", timeStyle: "short" }).format(new Date(values.slot_start)) : `${values.preferred_date} ${values.preferred_time}`}</strong></div>
        <label className="checkbox booking-consent"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" />I agree to the terms and conditions</label>
      </div>}

      {error && <p className="form-message error">{error}</p>}
      <div className="booking-actions">
        {step > 1 && <button className="button button-outline-dark" type="button" onClick={() => setStep((current) => current - 1)}>BACK</button>}
        {step < 3 ? <button className="button button-accent" type="button" disabled={!validStep()} onClick={() => setStep((current) => current + 1)}>NEXT <ArrowIcon /></button> : <button className="button button-accent" type="button" disabled={status === "submitting" || !validStep()} onClick={submit}>{status === "submitting" ? (fixed ? "OPENING PAYMENT..." : "SENDING...") : (fixed ? "CONTINUE TO PAYMENT" : "CONFIRM REQUEST")} <ArrowIcon /></button>}
      </div>
    </section>
  );
}
