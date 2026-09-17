"use client";

import { Check, Minus, PackageCheck, Plus, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useMemo, useState } from "react";

import { formatPrice } from "@/lib/services";
import type { InventoryItem } from "@/lib/supabase/database.types";

export function AdminInventoryPanel({ initialItems }: { initialItems: InventoryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState("");
  const available = useMemo(() => items.reduce((sum, item) => sum + item.stock_quantity, 0), [items]);

  function changeStock(sku: string, amount: number) {
    setItems((current) => current.map((item) => item.sku === sku
      ? { ...item, stock_quantity: Math.max(0, item.stock_quantity + amount) }
      : item));
    setSaved(null);
  }

  function toggleActive(sku: string) {
    setItems((current) => current.map((item) => item.sku === sku ? { ...item, active: !item.active } : item));
    setSaved(null);
  }

  async function save(item: InventoryItem) {
    setSaving(item.sku);
    setError("");
    const response = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku: item.sku, stockQuantity: item.stock_quantity, active: item.active }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || "Stock could not be updated.");
      setSaving(null);
      return;
    }

    setItems((current) => current.map((entry) => entry.sku === item.sku ? payload.item : entry));
    setSaved(item.sku);
    setSaving(null);
  }

  return (
    <div className="admin-inventory">
      <div className="admin-stats">
        <div><PackageCheck /><span><strong>{items.length}</strong><small>Bookable options</small></span></div>
        <div><span><strong>{available}</strong><small>Total units available</small></span></div>
        <div><span><strong>{items.filter((item) => item.stock_quantity === 0).length}</strong><small>Sold-out options</small></span></div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {(["skip-2-u", "h2o-2-u"] as const).map((service) => (
        <section className="admin-stock-group" key={service}>
          <div className="admin-stock-heading">
            <p className="eyebrow">{service === "skip-2-u" ? "Skip 2 U" : "H2O 2 U"}</p>
            <h2>{service === "skip-2-u" ? "Skip inventory" : "Water delivery inventory"}</h2>
          </div>
          <div className="admin-stock-list">
            {items.filter((item) => item.service_slug === service).map((item) => (
              <article className={!item.active ? "is-inactive" : ""} key={item.sku}>
                <div className="admin-stock-copy">
                  <small>{item.sku}</small>
                  <h3>{item.name}</h3>
                  <p>{item.detail} · {formatPrice(item.price_cents)}</p>
                </div>
                <button className="admin-active-toggle" type="button" onClick={() => toggleActive(item.sku)} aria-pressed={item.active}>
                  {item.active ? <ToggleRight /> : <ToggleLeft />} {item.active ? "Visible" : "Hidden"}
                </button>
                <div className="admin-stock-control" aria-label={`Stock for ${item.name}`}>
                  <button type="button" onClick={() => changeStock(item.sku, -1)} disabled={item.stock_quantity === 0} aria-label="Decrease stock"><Minus /></button>
                  <input type="number" min="0" value={item.stock_quantity} onChange={(event) => {
                    const value = Number.parseInt(event.target.value, 10);
                    setItems((current) => current.map((entry) => entry.sku === item.sku ? { ...entry, stock_quantity: Number.isNaN(value) ? 0 : Math.max(0, value) } : entry));
                  }} />
                  <button type="button" onClick={() => changeStock(item.sku, 1)} aria-label="Increase stock"><Plus /></button>
                </div>
                <button className="button admin-save" type="button" onClick={() => save(item)} disabled={saving === item.sku}>
                  {saved === item.sku ? <><Check size={17} /> Saved</> : <><Save size={17} /> {saving === item.sku ? "Saving…" : "Save"}</>}
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

