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
  cal_booking_uid: string | null;
  stripe_checkout_session_id: string | null;
  payment_status: string;
  status: string;
  message: string | null;
  created_at: string;
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
    const rawPage = new URL(request.url).searchParams.get("page") ?? "0";
    const page = /^\d{1,3}$/.test(rawPage) ? Number(rawPage) : NaN;

    if (!Number.isInteger(page) || page < 0 || page > 999) {
      return Response.json({ error: "Choose a valid page." }, { status: 400 });
    }

    const start = page * PAGE_SIZE;
    const { data, error, count } = await supabase
      .from("customer_requests")
      .select("id, request_kind, service_slug, first_name, last_name, email, phone, street_address, address_line_2, city, postcode, preferred_date, preferred_time, cal_start_at, cal_time_zone, cal_booking_uid, stripe_checkout_session_id, payment_status, status, message, created_at", { count: "exact" })
      .eq("request_kind", "booking")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error) throw error;
    const bookings = (data ?? []) as BookingRow[];
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
        items: byRequest.get(booking.id) ?? [],
      })),
      page,
      total: count ?? 0,
      has_more: start + PAGE_SIZE < (count ?? 0),
    }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    if (error instanceof AdminAccessError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Admin bookings lookup failed", error);
    return Response.json({ error: "Bookings could not be loaded." }, { status: 500 });
  }
}
