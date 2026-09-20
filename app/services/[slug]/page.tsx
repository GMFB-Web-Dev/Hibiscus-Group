import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { serviceList, services, type ServiceSlug } from "@/lib/site-data";

export function generateStaticParams() {
  return serviceList.map((service) => ({ slug: service.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();
  return <ServicePage service={service} />;
}
