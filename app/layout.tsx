import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://hibgroup.co.nz"),
  title: { default: "Hibiscus Group | Local Services Delivered 2 U", template: "%s | Hibiscus Group" },
  description: "Skip bins, bulk water delivery, water blasting, arborist services, and digger and truck hire across North Auckland.",
  openGraph: { title: "Hibiscus Group", description: "Practical local services, delivered straight to you.", images: [{ url: "/images/hero.png", width: 1914, height: 822 }], locale: "en_NZ", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en-NZ"><body><Header /><main>{children}</main><Footer /></body></html>;
}
