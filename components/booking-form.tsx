"use client";

import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { formatPrice, services, type ServiceSlug } from "@/lib/services";
import type { PublicInventoryItem } from "@/lib/supabase/database.types";

type BookingFormProps = {
  initialService?: ServiceSlug;
  initialInventory: PublicInventoryItem[];
  calcomUrl?: string;
};

type Details = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sku: string;
  quantity: number;
  address: string;
  suburb: string;
  postcode: string;
  jobDetails: string;
  date: string;
};

const blankDetails: Details = {
  firstName: "", lastName: "", email: "", phone: "", sku: "", quantity: 1, address: "", suburb: "", postcode: "", jobDetails: "", date: "",
};

export function BookingForm({ initialService, initialInventory, calcomUrl }: BookingFormProps) {
  const [serviceSlug, setServiceSlug] = useState<ServiceSlug | undefined>(initialService);
  const [inventory, setInventory] = useState(initialInventory);
  const [inventoryLoading, setInventoryLoading] = useState(initialInventory.length === 0);
  const [step, setStep] = useState(initialService ? 1 : 0);
  const [details, setDetails] = useState<Details>(blankDetails);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const service = services.find((item) => item.slug === serviceSlug);
  const isPayment = service?.bookingMode === "payment";
  const products = useMemo(() => inventory.filter((product) => product.service_slug === serviceSlug), [inventory, serviceSlug]);
  const selectedProduct = inventory.find((product) => product.sku === details.sku);

  useEffect(() => {
    let active = true;

    fetch("/api/inventory", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Inventory could not be loaded.");
        if (active) setInventory(payload.inventory);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setInventoryLoading(false);
      });

    return () => { active = false; };
  }, []);

  function update<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  function chooseService(slug: ServiceSlug) {
    setServiceSlug(slug);
    setDetails(blankDetails);
    setStep(1);
    setError("");
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStep((current) => Math.min(current + 1, 3));
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service) return;

    if (!isPayment) {
      setSubmitted(true);
      return;
    }

    if (!details.sku) {
      setError("Please select an option before continuing.");
      return;
    }
    if (!selectedProduct || selectedProduct.stock_quantity < 1 || !selectedProduct.active) {
      setError("That option has just sold out. Please choose another available option.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, service: service.slug }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Checkout could not be started.");
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout could not be started.");
      setLoading(false);
    }
  }

  if (submitted && service) {
    return (
      <div className="booking-complete" style={{ "--accent": service.color } as React.CSSProperties}>
        <CheckCircle2 size={52} />
        <p className="eyebrow">Enquiry prepared</p>
        <h2>Thanks, {details.firstName}.</h2>
        <p>Your {service.name} request is ready. In production this form can be connected to your chosen enquiry destination.</p>
        {calcomUrl ? (
          <div className="calcom-panel">
            <div><CalendarDays /><span><strong>Choose a time with Cal.com</strong><small>Open the booking calendar to pick an available slot.</small></span></div>
            <a className="button button--black" href={calcomUrl} target="_blank" rel="noreferrer">Open calendar <ExternalLink size={17} /></a>
          </div>
        ) : (
          <p className="integration-note">Add <code>NEXT_PUBLIC_CALCOM_BOOKING_URL</code> when your Cal.com event is ready.</p>
        )}
        <button className="text-button" type="button" onClick={() => { setSubmitted(false); setStep(0); setServiceSlug(undefined); setDetails(blankDetails); }}>Start another booking</button>
      </div>
    );
  }

  return (
    <div className="booking-shell" style={{ "--accent": service?.color ?? "#e52169" } as React.CSSProperties}>
      <div className="booking-progress" aria-label="Booking progress">
        {["Service", "Your details", isPayment ? "Delivery" : "Job details", "Confirm"].map((label, index) => (
          <div className={index <= step ? "active" : ""} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>
        ))}
      </div>

      {step === 0 && (
        <section className="booking-step">
          <p className="eyebrow">Book it. We’ll sort it.</p>
          <h1>What do you need?</h1>
          <p className="lede">Choose a service to begin. Fixed-price services continue to secure Stripe checkout; quote-based work can hand off to Cal.com.</p>
          <div className="booking-service-grid">
            {services.map((item) => (
              <button type="button" key={item.slug} onClick={() => chooseService(item.slug)} style={{ "--card-accent": item.color } as React.CSSProperties}>
                <span>{item.cardName}</span><small>{item.bookingMode === "payment" ? "Book & pay" : "Request a quote"}</small><ArrowRight size={19} />
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && service && (
        <form className="booking-step" onSubmit={next}>
          <p className="eyebrow">{isPayment ? "Book it. Pay it." : "Book it. We quote it."}</p>
          <h1>Book your {service.name}</h1>
          <p className="lede">{isPayment ? `Choose your ${service.name}, select your option, enter your date details and pay online.` : "Enter your date details and get a quote."}</p>
          <div className="field-grid">
            <label>First name<input value={details.firstName} onChange={(event) => update("firstName", event.target.value)} required autoComplete="given-name" /></label>
            <label>Last name<input value={details.lastName} onChange={(event) => update("lastName", event.target.value)} required autoComplete="family-name" /></label>
            <label>Email<input type="email" value={details.email} onChange={(event) => update("email", event.target.value)} required autoComplete="email" /></label>
            <label>Phone number<input type="tel" value={details.phone} onChange={(event) => update("phone", event.target.value)} required autoComplete="tel" /></label>
          </div>
          {isPayment && (
            <label>Choose an option
              <select value={details.sku} onChange={(event) => setDetails((current) => ({ ...current, sku: event.target.value, quantity: 1 }))} required disabled={inventoryLoading && products.length === 0}>
                <option value="" disabled>{inventoryLoading ? "Checking availability…" : "Select one..."}</option>
                {products.map((product) => (
                  <option value={product.sku} key={product.sku} disabled={!product.active || product.stock_quantity < 1}>
                    {product.name} — {product.detail} — {formatPrice(product.price_cents)} — {product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Sold out"}
                  </option>
                ))}
              </select>
              {!inventoryLoading && products.length === 0 && <small className="stock-warning">No options are currently available for online payment.</small>}
            </label>
          )}
          {isPayment && selectedProduct && selectedProduct.stock_quantity > 0 && (
            <label>Quantity
              <select value={details.quantity} onChange={(event) => update("quantity", Number(event.target.value))}>
                {Array.from({ length: selectedProduct.stock_quantity }, (_, index) => index + 1).map((quantity) => (
                  <option value={quantity} key={quantity}>{quantity}</option>
                ))}
              </select>
              <small className="stock-available">{selectedProduct.stock_quantity} currently available</small>
            </label>
          )}
          <StepActions back={() => { setStep(0); setServiceSlug(undefined); }} />
        </form>
      )}

      {step === 2 && service && (
        <form className="booking-step" onSubmit={next}>
          <p className="eyebrow">{service.name}</p>
          <h1>{isPayment ? "Where should we deliver?" : "Tell us about the job"}</h1>
          <div className="field-icon"><MapPin size={20} /><span>Service address</span></div>
          <label>Street address<input value={details.address} onChange={(event) => update("address", event.target.value)} required autoComplete="street-address" /></label>
          <div className="field-grid">
            <label>Suburb / town<input value={details.suburb} onChange={(event) => update("suburb", event.target.value)} required /></label>
            <label>Postcode<input value={details.postcode} onChange={(event) => update("postcode", event.target.value)} required inputMode="numeric" /></label>
          </div>
          <label>{isPayment ? "Delivery notes" : "Job details"}<textarea rows={5} value={details.jobDetails} onChange={(event) => update("jobDetails", event.target.value)} placeholder={isPayment ? "Access details, tank location or placement notes." : "Describe the work, access and anything we should know."} required={!isPayment} /></label>
          <StepActions back={() => setStep(1)} />
        </form>
      )}

      {step === 3 && service && (
        <form className="booking-step" onSubmit={submitBooking}>
          <p className="eyebrow">Almost sorted</p>
          <h1>{isPayment ? "Confirm and pay securely" : "Choose your preferred date"}</h1>
          <label>Preferred date<input type="date" value={details.date} onChange={(event) => update("date", event.target.value)} required min={new Date().toISOString().split("T")[0]} /></label>
          <div className="booking-summary">
            <div><span>Service</span><strong>{service.name}</strong></div>
            {selectedProduct && <div><span>Option</span><strong>{selectedProduct.name}</strong></div>}
            {selectedProduct && <div><span>Quantity</span><strong>{details.quantity} of {selectedProduct.stock_quantity} available</strong></div>}
            {selectedProduct && <div><span>Total</span><strong>{formatPrice(selectedProduct.price_cents * details.quantity)} NZD</strong></div>}
            <div><span>Address</span><strong>{details.address}, {details.suburb} {details.postcode}</strong></div>
          </div>
          {isPayment && <div className="secure-note"><ShieldCheck size={20} /><span>Payment is completed on Stripe’s hosted checkout. This site never handles your card details.</span></div>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="step-actions">
            <button className="text-button" type="button" onClick={() => setStep(2)}><ArrowLeft size={17} /> Back</button>
            <button className="button" style={{ background: service.color, color: service.slug === "dig-tip-2-u" ? "#111827" : "white" }} type="submit" disabled={loading}>
              {loading ? "Opening checkout…" : isPayment ? "Continue to Stripe" : "Confirm enquiry"} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function StepActions({ back }: { back: () => void }) {
  return (
    <div className="step-actions">
      <button className="text-button" type="button" onClick={back}><ArrowLeft size={17} /> Back</button>
      <button className="button" style={{ background: "var(--accent)", color: "white" }} type="submit">Next <ArrowRight size={18} /></button>
    </div>
  );
}
