import type { Metadata } from "next";

import { BookingForm } from "@/components/booking-form";
import { getPublicInventory } from "@/lib/inventory";
import { services, type ServiceSlug } from "@/lib/services";

export const metadata: Metadata = { title: "Book a service", description: "Book or request a Hibiscus Group service." };

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const query = await searchParams;
  const requested = typeof query.service === "string" ? query.service : undefined;
  const initialService = services.some((service) => service.slug === requested) ? requested as ServiceSlug : undefined;
  const inventory = await getPublicInventory().catch(() => []);

  return (
    <section className="booking-page">
      <BookingForm
        initialService={initialService}
        initialInventory={inventory}
        calcomUrl={process.env.NEXT_PUBLIC_CALCOM_BOOKING_URL}
      />
    </section>
  );
}
