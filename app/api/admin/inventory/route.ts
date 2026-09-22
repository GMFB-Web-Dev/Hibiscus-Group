import { AdminAccessError, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InventoryRow = {
  sku: string;
  service_slug: string;
  name: string;
  detail: string | null;
  price_cents: number;
  stock_quantity: number;
  active: boolean;
};

type ReservationRow = {
  sku: string;
  quantity: number;
};

function noStore(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      ...init?.headers,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

function accessError(error: unknown) {
  if (error instanceof AdminAccessError) {
    return noStore({ error: error.message }, { status: error.status });
  }

  console.error("Unexpected admin API error", error);
  return noStore({ error: "The admin service is temporarily unavailable." }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const { supabase, user, admin } = await requireAdmin(request);
    const now = new Date().toISOString();

    const [inventoryResult, reservationsResult] = await Promise.all([
      supabase
        .from("inventory_items")
        .select("sku, service_slug, name, detail, price_cents, stock_quantity, active")
        .order("service_slug")
        .order("price_cents"),
      supabase
        .from("stock_reservations")
        .select("sku, quantity")
        .eq("status", "pending")
        .gt("expires_at", now),
    ]);

    if (inventoryResult.error) {
      throw inventoryResult.error;
    }

    if (reservationsResult.error) {
      throw reservationsResult.error;
    }

    const reservedBySku = new Map<string, number>();
    for (const reservation of (reservationsResult.data ?? []) as ReservationRow[]) {
      reservedBySku.set(
        reservation.sku,
        (reservedBySku.get(reservation.sku) ?? 0) + reservation.quantity,
      );
    }

    const items = ((inventoryResult.data ?? []) as InventoryRow[]).map((item) => {
      const reservedQuantity = reservedBySku.get(item.sku) ?? 0;

      return {
        ...item,
        reserved_quantity: reservedQuantity,
        available_quantity: Math.max(item.stock_quantity - reservedQuantity, 0),
      };
    });

    return noStore({
      admin: {
        display_name: admin.display_name,
        email: user.email,
      },
      items,
    });
  } catch (error) {
    return accessError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const body = (await request.json()) as { sku?: unknown; stock_quantity?: unknown };
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";
    const stockQuantity = body.stock_quantity;

    if (!sku || sku.length > 100) {
      return noStore({ error: "Choose a valid inventory item." }, { status: 400 });
    }

    if (
      typeof stockQuantity !== "number" ||
      !Number.isSafeInteger(stockQuantity) ||
      stockQuantity < 0 ||
      stockQuantity > 100_000
    ) {
      return noStore(
        { error: "Stock must be a whole number between 0 and 100,000." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .rpc("admin_set_inventory_stock", {
        p_sku: sku,
        p_stock_quantity: stockQuantity,
        p_admin_user_id: user.id,
      })
      .single();

    if (error) {
      if (error.message.includes("INVENTORY_ITEM_NOT_FOUND")) {
        return noStore({ error: "That inventory item no longer exists." }, { status: 404 });
      }

      throw error;
    }

    return noStore({ item: data });
  } catch (error) {
    return accessError(error);
  }
}
