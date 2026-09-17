export type ServiceSlug = "skip-2-u" | "h2o-2-u" | "wash-2-u" | "arb-2-u" | "dig-tip-2-u";

export type Service = {
  slug: ServiceSlug;
  name: string;
  cardName: string;
  eyebrow: string;
  color: string;
  colorSoft: string;
  cardImage: string;
  image: string;
  detailImage: string;
  summary: string;
  description: string[];
  services: string[];
  benefits: string[];
  bookingMode: "payment" | "quote";
  bookingLabel: string;
};

export type BookableProduct = {
  sku: string;
  service: Extract<ServiceSlug, "skip-2-u" | "h2o-2-u">;
  name: string;
  detail: string;
  priceCents: number;
};

export const services: Service[] = [
  {
    slug: "skip-2-u",
    name: "Skip 2 U",
    cardName: "SKIP 2 U",
    eyebrow: "Easy skip bin hire",
    color: "#e52169",
    colorSoft: "#fff0f6",
    cardImage: "/images/card-skip.jpg",
    image: "/images/skip-hero.jpg",
    detailImage: "/images/skip-detail.jpg",
    summary: "Mini skip bins for tight access, clean-ups, renovations, garden waste and general rubbish removal.",
    description: [
      "Skip 2 U provides reliable mini skip bin hire for homes, worksites, renovations, cleanouts, garden waste and general rubbish removal.",
      "Our bins are designed for smaller driveways and tight access areas where larger bins are not suitable. Choose your size, book online and we will deliver directly to your property.",
    ],
    services: ["2m³, 3m³ and 4.5m³ mini skips", "Rubbish and garden waste", "Construction waste", "Clean hard fill", "Flexible hire periods"],
    benefits: ["Mini skip bins suited to tight access", "Available seven days", "Flexible hire periods", "Prompt delivery and pickup", "Suitable for rubbish, garden waste, construction waste and hard fill"],
    bookingMode: "payment",
    bookingLabel: "Book skip 2 U",
  },
  {
    slug: "h2o-2-u",
    name: "H2O 2 U",
    cardName: "H2O 2 U",
    eyebrow: "Reliable water delivery",
    color: "#3b82f6",
    colorSoft: "#eff6ff",
    cardImage: "/images/card-h2o.jpg",
    image: "/images/h2o-main.jpg",
    detailImage: "/images/h2o-detail.jpg",
    summary: "Bulk water delivery for tanks, rural properties, homes and commercial sites across North Auckland.",
    description: [
      "H2O 2 U provides reliable bulk water delivery across Rodney, the Hibiscus Coast, North Shore and surrounding areas.",
      "Choose the amount you need, select your delivery area, book online and pay upfront. We bring the water directly to your tank without the hassle of organising multiple steps.",
    ],
    services: ["6,000 to 20,000 litre deliveries", "Domestic water tanks", "Rural and lifestyle properties", "Commercial and site supply", "Flexible delivery times"],
    benefits: ["Bulk water delivery direct to your property", "Fixed pricing based on area and litres", "Available seven days", "Early morning, late afternoon and evening options", "Suitable for residential, rural and commercial needs"],
    bookingMode: "payment",
    bookingLabel: "Book H2O",
  },
  {
    slug: "wash-2-u",
    name: "Wash 2 U",
    cardName: "WASH 2 U",
    eyebrow: "Professional water blasting",
    color: "#f36707",
    colorSoft: "#fff5eb",
    cardImage: "/images/card-wash.jpg",
    image: "/images/wash-hero.jpg",
    detailImage: "/images/wash-detail.jpg",
    summary: "Exterior washing for homes, buildings, driveways and outdoor property maintenance.",
    description: [
      "Wash 2 U provides reliable water blasting for homes, businesses, outdoor areas and property maintenance jobs.",
      "Every property is different, so the service is quote-based. Send through your details, choose a preferred date, and our team will confirm the best approach and pricing before work begins.",
    ],
    services: ["Driveway cleaning", "Pathway cleaning", "Building washing", "Outdoor surface cleaning", "Concrete cleaning", "Patio and deck area cleaning", "Moss and grime removal", "General property washing", "Commercial exterior cleaning", "Council and maintenance work"],
    benefits: ["Quote-based service", "Suitable for residential and commercial properties", "Good for slippery, dirty or weathered surfaces", "Helpful for outdoor maintenance and presentation", "Reliable communication before work begins"],
    bookingMode: "quote",
    bookingLabel: "Book wash",
  },
  {
    slug: "arb-2-u",
    name: "Arb 2 U",
    cardName: "ARB 2 U",
    eyebrow: "Practical tree & outdoor care",
    color: "#2d8a32",
    colorSoft: "#eef8ef",
    cardImage: "/images/card-arb.jpg",
    image: "/images/arb-main.jpg",
    detailImage: "/images/arb-detail.jpg",
    summary: "Arborist and outdoor services for residential, rural and commercial properties.",
    description: [
      "Arb 2 U provides arborist services across the Hibiscus Coast, Rodney, North Shore and surrounding areas.",
      "From pruning and removals to stump grinding, hedge trimming and site clearing, our practical team helps keep your property safe, tidy and controlled.",
    ],
    services: ["Tree trimming", "Tree pruning", "Tree removal", "Section clearing", "Branch removal", "Storm-related tree cleanup", "Property maintenance", "Rural and residential tree work", "Stump grinding", "Hedge trimming"],
    benefits: ["Quote-based arborist services", "Practical advice before work begins", "Available for residential, rural and commercial jobs", "Reliable communication", "Focused on safe, tidy work"],
    bookingMode: "quote",
    bookingLabel: "Book arb",
  },
  {
    slug: "dig-tip-2-u",
    name: "Dig & Tip 2 U",
    cardName: "DIG & TIP 2 U",
    eyebrow: "Digger & truck hire made simple",
    color: "#f8c919",
    colorSoft: "#fffbe8",
    cardImage: "/images/card-dig.jpg",
    image: "/images/dig-hero.jpg",
    detailImage: "/images/dig-detail.jpg",
    summary: "Dry digger and truck hire for site clean-ups, small earthworks and material movement.",
    description: [
      "Dig & Tip 2 U provides practical dry digger and truck hire for property work, site clean-ups, small earthworks and material removal.",
      "This self-operated hire service is quote-based because every job varies by access, site conditions, hire duration, delivery distance and equipment required.",
    ],
    services: ["Dry mini digger", "Small truck hire", "Digger and truck packages", "One-day hire", "Two-day hire", "Three-day hire", "Short-term hire", "Delivery assistance if required", "Flexible collection", "Equipment for property clean-ups", "Equipment for small earthworks"],
    benefits: ["Quote-based service", "Useful for tight or practical site work", "Digger and truck support in one service", "Helpful for cleanups, prep work and material removal", "Suitable for residential, rural and commercial jobs"],
    bookingMode: "quote",
    bookingLabel: "Book dig & tip",
  },
];

export const skipProducts: BookableProduct[] = [
  { sku: "skip-rubbish-2", service: "skip-2-u", name: "2m³ Cubic Mini Skip", detail: "Rubbish · 450kg limit", priceCents: 23500 },
  { sku: "skip-rubbish-3", service: "skip-2-u", name: "3m³ Standard Mini Skip", detail: "Rubbish · 600kg limit", priceCents: 28500 },
  { sku: "skip-rubbish-45", service: "skip-2-u", name: "4.5m³ Large Mini Skip", detail: "Rubbish · 700kg limit", priceCents: 33500 },
  { sku: "skip-hardfill-2", service: "skip-2-u", name: "2m³ Cubic Mini Skip", detail: "Hard fill · concrete, bricks or soil", priceCents: 23500 },
  { sku: "skip-hardfill-3", service: "skip-2-u", name: "3m³ Standard Mini Skip", detail: "Hard fill · clean fill only", priceCents: 28500 },
];

export const waterAreas = [
  { area: "Albany", prices: [240, 240, 340, 440] },
  { area: "Kaukapakapa", prices: [290, 290, 390, 460] },
  { area: "Makarau", prices: [350, 350, 430, 550] },
  { area: "Gulf Harbour", prices: [350, 350, 490, 590] },
  { area: "Puhoi", prices: [290, 290, 360, 480] },
  { area: "Whangaparaoa", prices: [200, 210, 260, 360] },
  { area: "Waiwera", prices: [260, 260, 360, 460] },
  { area: "Stanmore Bay", prices: [260, 260, 360, 460] },
  { area: "Dairy Flat", prices: [260, 260, 360, 460] },
] as const;

export const waterLitres = [6000, 10000, 15000, 20000] as const;

export const waterProducts: BookableProduct[] = waterAreas.flatMap(({ area, prices }) =>
  waterLitres.map((litres, index) => ({
    sku: `h2o-${area.toLowerCase().replace(/\s+/g, "-")}-${litres}`,
    service: "h2o-2-u" as const,
    name: `${litres.toLocaleString("en-NZ")} litres to ${area}`,
    detail: "Bulk water delivery",
    priceCents: prices[index] * 100,
  })),
);

export const bookableProducts = [...skipProducts, ...waterProducts];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getBookableProduct(sku: string) {
  return bookableProducts.find((product) => product.sku === sku);
}

export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(priceCents / 100);
}

export const serviceAreas = [
  "Dairy Flat", "Hibiscus Coast", "Orewa", "Whangaparaoa", "Stanmore Bay", "Army Bay",
  "Gulf Harbour", "Puhoi", "Mahurangi", "Omaha", "Snells Beach", "Kaipara",
  "Helensville", "Kumeu", "Glenfield", "Birkdale", "Devonport", "Long Bay", "North Shore", "Rodney", "Albany",
];
