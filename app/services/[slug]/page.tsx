import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { createPageMetadata } from "@/lib/seo";
import { serviceList, services, type ServiceSlug } from "@/lib/site-data";

const serviceMetadata: Record<ServiceSlug, { title: string; description: string; keywords: string[] }> = {
  "skip-2-u": {
    title: "Mini Skip Bin Hire",
    description: "Book practical mini skip bin hire for cleanups, renovations, garden waste, and rubbish removal across North Shore and Rodney.",
    keywords: ["mini skip hire", "skip bins North Shore", "skip hire Rodney"],
  },
  "h2o-2-u": {
    title: "Bulk Water Delivery",
    description: "Book reliable bulk water delivery for tanks, pools, rural properties, construction sites, and landscaping across North Auckland.",
    keywords: ["bulk water delivery", "tank water Auckland", "water delivery Rodney"],
  },
  "wash-2-u": {
    title: "Water Blasting Services",
    description: "Request professional water blasting for homes, buildings, driveways, paths, and outdoor surfaces across greater Auckland.",
    keywords: ["water blasting Auckland", "driveway cleaning", "exterior house washing"],
  },
  "arb-2-u": {
    title: "Arborist & Tree Services",
    description: "Request practical tree pruning, removal, stump grinding, hedge trimming, and property maintenance across greater Auckland.",
    keywords: ["arborist Auckland", "tree removal North Shore", "tree pruning Rodney"],
  },
  "dig-tip-2-u": {
    title: "Digger & Truck Hire",
    description: "Request dry mini digger and truck hire for property cleanups, earthworks, and material removal across North Shore and Rodney.",
    keywords: ["mini digger hire", "truck hire Auckland", "dry digger hire Rodney"],
  },
};

export function generateStaticParams() {
  return serviceList.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();
  const seo = serviceMetadata[service.slug];

  return createPageMetadata({
    ...seo,
    path: `/services/${service.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();
  return <ServicePage service={service} />;
}
