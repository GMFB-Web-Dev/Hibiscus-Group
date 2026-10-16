import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

type BookingSlotRow = {
  start_at: string;
  end_at: string;
};

export const BOOKING_TIME_ZONE = "Pacific/Auckland";

export async function releaseExpiredBookingHolds() {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.rpc("release_expired_inventory");

  if (error) {
    console.error("Expired booking hold cleanup failed", error.code);
    throw new Error("Expired booking holds could not be refreshed.");
  }
}

export async function getAvailableBookingSlots(input: {
  start: string;
  end: string;
}) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.rpc("get_available_booking_slots", {
    p_start: input.start,
    p_end: input.end,
  });

  if (error) {
    console.error("Supabase slot lookup failed", error.code);
    throw new Error("Booking availability is temporarily unavailable.");
  }

  return ((data ?? []) as BookingSlotRow[]).map((slot) => ({
    start: slot.start_at,
    end: slot.end_at,
  }));
}
