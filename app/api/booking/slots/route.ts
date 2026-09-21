import { getAvailableCalSlots } from "@/lib/cal-com";

const MAX_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const start = new Date(url.searchParams.get("start") || "");
    const end = new Date(url.searchParams.get("end") || "");
    const timeZone = (url.searchParams.get("timeZone") || "Pacific/Auckland").slice(0, 100);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return Response.json({ error: "Choose a valid date range." }, { status: 400 });
    }
    if (end <= start || end.getTime() - start.getTime() > MAX_RANGE_MS) {
      return Response.json({ error: "Availability can be checked for up to 31 days." }, { status: 400 });
    }

    const slots = await getAvailableCalSlots({
      start: start.toISOString(),
      end: end.toISOString(),
      timeZone,
    });
    const durationMinutes = Number(process.env.CAL_EVENT_DURATION_MINUTES || "60");

    return Response.json({
      slots: slots.map((slot) => ({
        start: slot.start,
        end: slot.end || new Date(new Date(slot.start).getTime() + durationMinutes * 60_000).toISOString(),
      })),
    });
  } catch (error) {
    console.error("Cal.com slot lookup failed", error instanceof Error ? error.message : "unknown");
    return Response.json({ error: "We could not load booking times. Please try again." }, { status: 502 });
  }
}
