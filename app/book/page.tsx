import { BookingForm, type InventoryItem } from "@/components/forms";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { createPageMetadata } from "@/lib/seo";
import { serviceList, type ServiceSlug } from "@/lib/site-data";
import { createPublicSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Book a Service",
  description: "Book mini skip hire or water delivery online, or request a quote for washing, arborist, and digger and truck services.",
  path: "/book",
  keywords: ["book skip hire", "order bulk water", "North Auckland service booking"],
});

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; cancelled?: string }> }) {
  const { service, cancelled } = await searchParams;
  const valid = serviceList.some((item) => item.slug === service);
  const initialService = valid ? service as ServiceSlug : "general";
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.rpc("get_available_inventory");
  return <><SiteHeader /><main className="book-page"><BookingForm initialService={initialService} inventory={(data || []) as InventoryItem[]} inventoryUnavailable={Boolean(error)} checkoutCancelled={cancelled === "1"} /></main><SiteFooter /></>;
}
