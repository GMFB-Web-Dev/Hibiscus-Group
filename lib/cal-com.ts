import "server-only";

const CAL_API_URL = "https://api.cal.com/v2";
const CAL_SLOTS_API_VERSION = "2024-09-04";
const CAL_BOOKINGS_API_VERSION = "2026-02-25";

type CalSlotResponse = {
  status?: string;
  data?: Record<string, Array<{ start?: string; end?: string; time?: string }>> | {
    slots: Record<string, Array<{ start?: string; end?: string; time?: string }>>;
  };
};

type CalBookingResponse = {
  status?: string;
  data?: { uid?: string; id?: number; start?: string; end?: string } | Array<{ uid?: string; id?: number; start?: string; end?: string }>;
  error?: { message?: string };
};

async function calRequest(path: string, apiVersion: string, init?: RequestInit) {
  return fetch(`${CAL_API_URL}${path}`, {
    ...init,
    headers: {
      "cal-api-version": apiVersion,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
}

export async function getAvailableCalSlots(input: {
  start: string;
  end: string;
  timeZone: string;
}) {
  const eventTypeId = process.env.CAL_EVENT_TYPE_ID;
  if (!eventTypeId || !/^\d+$/.test(eventTypeId)) {
    throw new Error("CAL_EVENT_TYPE_ID is not configured.");
  }

  const query = new URLSearchParams({
    eventTypeId,
    start: input.start,
    end: input.end,
    timeZone: input.timeZone,
    format: "range",
  });
  const response = await calRequest(`/slots?${query}`, CAL_SLOTS_API_VERSION);
  const body = await response.json() as CalSlotResponse;
  const slotMap = body.data && "slots" in body.data ? body.data.slots : body.data;

  if (!response.ok || body.status !== "success" || !slotMap) {
    throw new Error("Cal.com availability is temporarily unavailable.");
  }

  return Object.values(slotMap)
    .flat()
    .map((slot) => ({
      start: slot.start ?? slot.time ?? "",
      end: slot.end ?? "",
    }))
    .filter((slot) => slot.start)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export async function createCalBooking(input: {
  start: string;
  timeZone: string;
}) {
  const eventTypeId = Number(process.env.CAL_EVENT_TYPE_ID);
  const holdAttendeeEmail = process.env.COMPANY_NOTIFICATION_EMAIL?.trim();
  if (!Number.isInteger(eventTypeId) || eventTypeId <= 0) {
    throw new Error("CAL_EVENT_TYPE_ID is not configured.");
  }
  if (!holdAttendeeEmail || !holdAttendeeEmail.includes("@")) {
    throw new Error("COMPANY_NOTIFICATION_EMAIL is not configured.");
  }

  const response = await calRequest("/bookings", CAL_BOOKINGS_API_VERSION, {
    method: "POST",
    body: JSON.stringify({
      eventTypeId,
      start: input.start,
      attendee: {
        name: "Website booking hold",
        email: holdAttendeeEmail,
        timeZone: input.timeZone,
        language: "en",
      },
    }),
  });
  const body = await response.json() as CalBookingResponse;
  const booking = Array.isArray(body.data) ? body.data[0] : body.data;

  if (!response.ok || body.status !== "success" || !booking?.uid) {
    throw new Error(body.error?.message || "That Cal.com time slot is no longer available.");
  }

  return booking;
}

export async function cancelCalBooking(bookingUid: string, reason: string) {
  const response = await calRequest(`/bookings/${encodeURIComponent(bookingUid)}/cancel`, CAL_BOOKINGS_API_VERSION, {
    method: "POST",
    body: JSON.stringify({ cancellationReason: reason }),
  });

  if (!response.ok) {
    console.error("Cal.com cancellation failed", response.status);
    return false;
  }

  return true;
}
