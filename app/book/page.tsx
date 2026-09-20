import { BookingForm, type InventoryItem } from "@/components/forms";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serviceList, type ServiceSlug } from "@/lib/site-data";
import { createPublicSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const valid = serviceList.some((item) => item.slug === service);
  const initialService = valid ? service as ServiceSlug : "general";
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.from("inventory_items").select("sku,service_slug,name,detail,price_cents,stock_quantity").eq("active", true).gt("stock_quantity", 0).order("price_cents");
  return <><SiteHeader /><main className="book-page"><BookingForm initialService={initialService} inventory={(data || []) as InventoryItem[]} /></main><SiteFooter /></>;
}
