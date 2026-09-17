"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AdminSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return <button className="text-button admin-sign-out" type="button" onClick={signOut} disabled={loading}><LogOut size={17} /> {loading ? "Signing out…" : "Sign out"}</button>;
}
