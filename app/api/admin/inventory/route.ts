import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid stock update." }, { status: 400 }); }

  const sku = typeof body.sku === "string" ? body.sku.trim().slice(0, 120) : "";
  const stockQuantity = typeof body.stockQuantity === "number" && Number.isInteger(body.stockQuantity) ? body.stockQuantity : -1;
  const active = typeof body.active === "boolean" ? body.active : null;
  if (!sku || stockQuantity < 0 || stockQuantity > 10000 || active === null) {
    return Response.json({ error: "Stock must be a whole number between 0 and 10,000." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return Response.json({ error: "Sign in is required." }, { status: 401 });

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();
  if (!admin) return Response.json({ error: "Admin access is required." }, { status: 403 });

  const { data: item, error } = await supabase
    .from("inventory_items")
    .update({ stock_quantity: stockQuantity, active, updated_by: userId })
    .eq("sku", sku)
    .select("*")
    .single();

  if (error) return Response.json({ error: "Stock could not be updated." }, { status: 500 });
  return Response.json({ item }, { headers: { "Cache-Control": "no-store" } });
}

