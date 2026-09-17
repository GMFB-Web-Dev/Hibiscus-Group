import { getPublicInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inventory = await getPublicInventory();
    return Response.json(
      { inventory },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Live availability is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
