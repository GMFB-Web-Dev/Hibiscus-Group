import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { bookableProducts } from "@/lib/services";
import { getPublicSupabaseConfig, hasPublicSupabaseConfig } from "@/lib/supabase/config";
import type { Database, PublicInventoryItem } from "@/lib/supabase/database.types";

export type { PublicInventoryItem } from "@/lib/supabase/database.types";

export async function getPublicInventory(): Promise<PublicInventoryItem[]> {
  if (!hasPublicSupabaseConfig()) return [];

  const { url, key } = getPublicSupabaseConfig();
  const supabase = createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("inventory_items")
    .select("sku, service_slug, name, detail, price_cents, stock_quantity, active")
    .eq("active", true)
    .order("service_slug")
    .order("name");

  if (error) throw new Error(`Inventory could not be loaded: ${error.message}`);
  return data;
}

export function getFallbackInventory(): PublicInventoryItem[] {
  return bookableProducts.map((product) => ({
    sku: product.sku,
    service_slug: product.service,
    name: product.name,
    detail: product.detail,
    price_cents: product.priceCents,
    stock_quantity: 0,
    active: false,
  }));
}
