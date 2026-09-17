"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";
import { getPublicSupabaseConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url, key } = getPublicSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}

