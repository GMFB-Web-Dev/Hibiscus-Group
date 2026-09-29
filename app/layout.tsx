import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE_NAME,
  title: {
    default: "Hibiscus Group | Local Services Delivered 2 U",
    template: "%s | Hibiscus Group",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "North Auckland property services",
    "mini skip hire",
    "bulk water delivery",
    "water blasting",
    "arborist services",
    "digger hire",
    "truck hire",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NZ",
    url: "/",
    siteName: SITE_NAME,
    title: "Hibiscus Group | Local Services Delivered 2 U",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Hibiscus Group | Local Services Delivered 2 U",
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={inter.variable}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
