import type { Metadata } from "next";
import AdminDashboard from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Stock Administration | Hibiscus Group",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
