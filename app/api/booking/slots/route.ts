import {
  BOOKING_TIME_ZONE,
  getAvailableBookingSlots,
  releaseExpiredBookingHolds,
} from "@/lib/booking-slots";

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const start = new Date(url.searchParams.get("start") || "");
    const end = new Date(url.searchParams.get("end") || "");
    const timeZone = (url.searchParams.get("timeZone") || BOOKING_TIME_ZONE).slice(0, 100);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return Response.json({ error: "Choose a valid date range." }, { status: 400 });
    }
    if (end <= start || end.getTime() - start.getTime() > MAX_RANGE_MS) {
      return Response.json({ error: "Availability can be checked for up to 31 days." }, { status: 400 });
    }
    if (timeZone !== BOOKING_TIME_ZONE) {
      return Response.json({ error: "Booking times use Pacific/Auckland." }, { status: 400 });
    }

    await releaseExpiredBookingHolds();
    const slots = await getAvailableBookingSlots({
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return Response.json({ slots }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Supabase slot lookup failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "We could not load booking times. Please try again." }, { status: 502 });
  }
}
