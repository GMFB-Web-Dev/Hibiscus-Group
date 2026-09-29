import type { Metadata } from "next";

export const SITE_NAME = "Hibiscus Group";
export const SITE_URL = new URL(
  (process.env.NEXT_PUBLIC_SITE_URL || "https://hib.gdn").replace(/\/+$/, ""),
);

export const DEFAULT_DESCRIPTION =
  "Mini skip hire, bulk water delivery, water blasting, arborist services, and digger and truck hire across North Auckland.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const socialTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: title.includes(SITE_NAME) ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_NZ",
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Hibiscus Group — local services delivered 2 U",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        {
          url: "/twitter-image",
          width: 1200,
          height: 630,
          alt: "Hibiscus Group — local services delivered 2 U",
        },
      ],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          noarchive: true,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
