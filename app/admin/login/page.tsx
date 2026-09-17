import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <section className="admin-auth-page"><AdminLoginForm /></section>;
}

