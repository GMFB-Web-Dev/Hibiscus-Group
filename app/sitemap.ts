import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { serviceList } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
      images: [absoluteUrl("/images/figma/home-6.png")],
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
      images: [absoluteUrl("/images/figma/about-1.jpg")],
    },
    {
      url: absoluteUrl("/services"),
      changeFrequency: "weekly",
      priority: 0.9,
      images: [absoluteUrl("/images/figma/services-8.png")],
    },
    {
      url: absoluteUrl("/contact"),
      changeFrequency: "monthly",
      priority: 0.7,
      images: [absoluteUrl("/images/figma/contact-1.png")],
    },
    {
      url: absoluteUrl("/book"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const servicePages: MetadataRoute.Sitemap = serviceList.map((service) => ({
    url: absoluteUrl(`/services/${service.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
    images: [absoluteUrl(service.hero)],
  }));

  return [...staticPages, ...servicePages];
}
