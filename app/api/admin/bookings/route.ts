import { AdminAccessError, requireAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type BookingRow = {
  id: string;
  request_kind: string;
  service_slug: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string | null;
  address_line_2: string | null;
  city: string | null;
  postcode: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  cal_start_at: string | null;
  cal_time_zone: string | null;
  payment_status: string;
  status: string;
  message: string | null;
  created_at: string;
  total_count: number;
};

type ReservationRow = {
  customer_request_id: string;
  sku: string;
  quantity: number;
  amount_cents: number | null;
};

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdmin(request);
    const url = new URL(request.url);
    const rawPage = url.searchParams.get("page") ?? "0";
    const page = /^\d{1,3}$/.test(rawPage) ? Number(rawPage) : NaN;
    const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
    const deliveryOnly = url.searchParams.get("view") === "deliveries";

    if (!Number.isInteger(page) || page < 0 || page > 999) {
      return Response.json({ error: "Choose a valid page." }, { status: 400 });
    }

    const start = page * PAGE_SIZE;
    const { data, error } = await supabase.rpc("search_admin_bookings", {
      p_query: search,
      p_delivery_only: deliveryOnly,
      p_limit: PAGE_SIZE,
      p_offset: start,
    });

    if (error) throw error;
    const bookings = (data ?? []) as BookingRow[];
    const total = Number(bookings[0]?.total_count ?? 0);
    const ids = bookings.map((booking) => booking.id);
    let reservations: ReservationRow[] = [];

    if (ids.length) {
      const result = await supabase
        .from("stock_reservations")
        .select("customer_request_id, sku, quantity, amount_cents")
        .in("customer_request_id", ids);
      if (result.error) throw result.error;
      reservations = (result.data ?? []) as ReservationRow[];
    }

    const byRequest = new Map<string, ReservationRow[]>();
    for (const reservation of reservations) {
      byRequest.set(reservation.customer_request_id, [
        ...(byRequest.get(reservation.customer_request_id) ?? []),
        reservation,
      ]);
    }

    return Response.json({
      bookings: bookings.map((booking) => ({
        ...booking,
        total_count: undefined,
        items: byRequest.get(booking.id) ?? [],
      })),
      page,
      total,
      has_more: start + PAGE_SIZE < total,
      search,
      view: deliveryOnly ? "deliveries" : "bookings",
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Admin bookings lookup failed", error);
    return Response.json({ error: "Bookings could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAdmin(request);
    const body = await request.json() as { id?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return Response.json({ error: "Choose a valid delivery order." }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("admin_complete_delivery", {
      p_request_id: id,
      p_admin_user_id: user.id,
    });

    if (error) throw error;
    if (data !== true) {
      return Response.json({ error: "That order is no longer awaiting delivery." }, { status: 409 });
    }

    return Response.json({ delivered: true }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Admin delivery update failed", error);
    return Response.json({ error: "The delivery could not be updated." }, { status: 500 });
  }
}
