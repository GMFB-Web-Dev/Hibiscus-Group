import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminInventoryPanel } from "@/components/admin-inventory-panel";
import { AdminSignOut } from "@/components/admin-sign-out";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stock admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("display_name, email, active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (!admin) {
    return (
      <section className="admin-denied">
        <p className="eyebrow">Access denied</p>
        <h1>This account is not an active admin.</h1>
        <p>Ask a database owner to add this Auth user to <code>public.admin_users</code>.</p>
        <AdminSignOut />
      </section>
    );
  }

  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("service_slug")
    .order("name");

  if (error) throw new Error(`Admin inventory could not be loaded: ${error.message}`);

  return (
    <section className="admin-page">
      <div className="admin-hero">
        <div className="shell">
          <div><p className="eyebrow">Hibiscus Group control room</p><h1>Stock, properly sorted.</h1><p>Update live availability before customers reach Stripe checkout.</p></div>
          <div className="admin-identity"><span>Signed in as</span><strong>{admin.display_name}</strong><small>{admin.email}</small><AdminSignOut /></div>
        </div>
      </div>
      <div className="shell admin-content"><AdminInventoryPanel initialItems={items ?? []} /></div>
    </section>
  );
}

