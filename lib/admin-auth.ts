import "server-only";

import type { User } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export class AdminAccessError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminAccessError";
  }
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";

  if (!accessToken) {
    throw new AdminAccessError("Sign in is required.", 401);
  }

  const supabase = createAdminSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    throw new AdminAccessError("Your session has expired. Please sign in again.", 401);
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id, display_name")
    .eq("user_id", userData.user.id)
    .eq("active", true)
    .maybeSingle();

  if (adminError) {
    console.error("Admin access lookup failed", adminError);
    throw new AdminAccessError("Admin access could not be verified.", 503);
  }

  if (!admin) {
    throw new AdminAccessError("This account does not have admin access.", 403);
  }

  return {
    supabase,
    user: userData.user as User,
    admin,
  };
}
