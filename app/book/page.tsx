import { BookingForm, type InventoryItem } from "@/components/forms";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { serviceList, type ServiceSlug } from "@/lib/site-data";
import { createPublicSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; cancelled?: string }> }) {
  const { service, cancelled } = await searchParams;
  const valid = serviceList.some((item) => item.slug === service);
  const initialService = valid ? service as ServiceSlug : "general";
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase.rpc("get_available_inventory");
  return <><SiteHeader /><main className="book-page"><BookingForm initialService={initialService} inventory={(data || []) as InventoryItem[]} checkoutCancelled={cancelled === "1"} /></main><SiteFooter /></>;
}
