export type ServiceSlug =
  | "skip-2-u"
  | "h2o-2-u"
  | "wash-2-u"
  | "arb-2-u"
  | "dig-tip-2-u";

export type Service = {
  slug: ServiceSlug;
  shortName: string;
  name: string;
  eyebrow: string;
  accent: string;
  hero: string;
  introImage: string;
  detailImage: string;
  finalImage: string;
  heroTitle: string;
  heroCopy: string;
  introCopy: string[];
  helpHeading?: string;
  helpCopy?: string[];
  helpItems?: string[];
  whyEyebrow: string;
  whyItems: string[];
  fixedPrice: boolean;
  coverageTitle: string;
};

export const services: Record<ServiceSlug, Service> = {
  "skip-2-u": {
    slug: "skip-2-u",
    shortName: "SKIP 2 U",
    name: "SKIP 2 U",
    eyebrow: "EASY SKIP BIN HIRE",
    accent: "#e52169",
    hero: "/images/figma/skip-1.png",
    introImage: "/images/figma/skip-4.png",
    detailImage: "/images/figma/skip-4.png",
    finalImage: "/images/figma/skip-5.png",
    heroTitle: "SKIP 2 U - MINI SKIP BIN HIRE",
    heroCopy:
      "Reliable mini skip bin hire for cleanups, renovations, garden waste, construction rubbish and general waste removal across the North Shore, Hibiscus Coast and Rodney areas. SKIP 2 U makes waste removal simple. Choose your bin size, book online, pay upfront, and we deliver the mini skip to you.",
    introCopy: [
      "SKIP 2 U provides reliable mini skip bin hire for homes, worksites, renovations, cleanouts, garden waste and general rubbish removal.",
      "Our mini skip bins are a practical option for tight access areas, smaller driveways and residential sites where larger bins are not suitable. With simple online booking, clear pricing and seven-day availability, SKIP 2 U makes waste removal easy from start to finish.",
      "Choose the bin size you need, book online, pay upfront, and we will deliver the skip bin to you.",
    ],
    whyEyebrow: "SIMPLE, LOCAL AND BUILT FOR TIGHT ACCESS.",
    whyItems: [
      "Mini skip bins suited to tight access",
      "Available seven days",
      "Flexible hire periods",
      "Prompt delivery and pickup",
      "Suitable for rubbish, garden waste, construction waste and hard fill",
    ],
    fixedPrice: true,
    coverageTitle: "SERVICING NORTH SHORE AND RODNEY",
  },
  "h2o-2-u": {
    slug: "h2o-2-u",
    shortName: "H2O 2 U",
    name: "H2O 2 U",
    eyebrow: "RELIABLE WATER DELIVERY WHEN YOU NEED IT",
    accent: "#3b82f6",
    hero: "/images/figma/water-1.png",
    introImage: "/images/figma/water-3.png",
    detailImage: "/images/figma/water-3.png",
    finalImage: "/images/figma/water-5.png",
    heroTitle: "H2O 2 U - BULK WATER DELIVERY",
    heroCopy:
      "Reliable fast bulk water delivery for tanks, pools, construction sites, landscaping projects and general water needs across the North Shore, Hibiscus Coast and Rodney areas. H2O 2 U makes water delivery simple. Choose your water load, book online, pay upfront, and we deliver water to you.",
    introCopy: [
      "H2O 2 U provides reliable bulk water delivery across Rodney, Hibiscus Coast, North Shore and surrounding areas. Choose the water amount you need, select your delivery area, book online and pay upfront.",
    ],
    whyEyebrow: "LOCAL WATER DELIVERY MADE SIMPLE.",
    whyItems: [
      "Bulk water delivery direct to your property",
      "Fixed pricing based on area and litres",
      "Available seven days",
      "Early morning, late afternoon and evening options",
      "Suitable for residential, rural and commercial needs",
    ],
    fixedPrice: true,
    coverageTitle: "SERVICING NORTH SHORE AND RODNEY",
  },
  "wash-2-u": {
    slug: "wash-2-u",
    shortName: "WASH 2 U",
    name: "WASH 2 U",
    eyebrow: "PROFESSIONAL WATER BLASTING SERVICES",
    accent: "#f36f07",
    hero: "/images/figma/wash-1.png",
    introImage: "/images/figma/wash-2.png",
    detailImage: "/images/figma/wash-6.png",
    finalImage: "/images/figma/wash-7.png",
    heroTitle: "WASH 2 U - WATER BLASTING",
    heroCopy: "Exterior washing for homes, buildings, driveways and property maintenance.",
    introCopy: [
      "WASH 2 U provides reliable water blasting services for homes, businesses, outdoor areas and property maintenance jobs. Whether you need a driveway cleaned, a building washed, paths cleared, or outdoor surfaces brought back to life, the team can review the job and provide a quote based on the work required.",
      "Every property is different, so WASH 2 U is a quote-based service.",
      "Customers can send through their details, choose a preferred date, and the team will confirm the best approach and pricing before the job goes ahead.",
    ],
    helpHeading: "WHAT WE CAN HELP WITH",
    helpCopy: [
      "WASH 2 U helps remove dirt, grime, mould, moss and general build-up from outdoor surfaces. It is a practical service for keeping properties looking sharp, improving safety around slippery areas, and maintaining homes, commercial spaces and shared outdoor areas.",
    ],
    helpItems: [
      "Driveway cleaning",
      "Pathway cleaning",
      "Building washing",
      "Outdoor surface cleaning",
      "Concrete cleaning",
      "Patio and deck area cleaning",
      "Moss and grime removal",
      "General property washing",
      "Commercial exterior cleaning",
      "Council and maintenance work",
    ],
    whyEyebrow: "RELIABLE WASHING, DONE PROPERLY.",
    whyItems: [
      "Quote-based service",
      "Suitable for residential and commercial properties",
      "Good for slippery, dirty or weathered surfaces",
      "Helpful for outdoor maintenance and presentation",
      "Reliable communication before work begins",
    ],
    fixedPrice: false,
    coverageTitle: "SERVICING GREATER AUCKLAND",
  },
  "arb-2-u": {
    slug: "arb-2-u",
    shortName: "ARB 2 U",
    name: "ARB 2 U",
    eyebrow: "PRACTICAL TREE & OUTDOOR CARE",
    accent: "#2d8a32",
    hero: "/images/figma/arb-1.png",
    introImage: "/images/figma/arb-3.png",
    detailImage: "/images/figma/arb-4.png",
    finalImage: "/images/figma/arb-8.png",
    heroTitle: "ARB 2 U - ARBORIST SERVICES",
    heroCopy: "Tree and arb services for properties needing practical outdoor support.",
    introCopy: [
      "ARB 2 U provides arborist services for residential, rural and commercial properties across the Hibiscus Coast, Rodney, North Shore and surrounding areas.",
      "From tree pruning and removal through to stump grinding, hedge trimming, site clearing and maintenance, ARB 2 U helps keep your property safe, tidy and controlled.",
      "This service is quote-based, so customers can book a preferred date, provide job details, and the team will review the work before confirming the final price.",
    ],
    helpHeading: "WHAT WE CAN HELP WITH",
    helpCopy: [
      "ARB 2 U helps with practical tree and outdoor maintenance work for homes, lifestyle blocks, rural properties and commercial sites. Whether you need overgrown branches cut back, unsafe trees looked at, storm damage cleared, or general section maintenance, the team can review the job and provide the right advice before work begins.",
      "Every job is quote-based because tree work can vary depending on access, size, safety requirements and the equipment needed.",
    ],
    helpItems: [
      "Tree trimming",
      "Tree pruning",
      "Tree removal",
      "Section clearing",
      "Branch removal",
      "Storm-related tree cleanup",
      "Property maintenance",
      "Rural and residential tree work",
      "Stump grinding",
      "Hedge trimming",
    ],
    whyEyebrow: "LOCAL TREE SERVICES, DONE PROPERLY.",
    whyItems: [
      "Quote-based arborist services",
      "Practical advice before work begins",
      "Available for residential, rural and commercial jobs",
      "Reliable communication",
      "Focused on safe, tidy work",
    ],
    fixedPrice: false,
    coverageTitle: "SERVICING GREATER AUCKLAND",
  },
  "dig-tip-2-u": {
    slug: "dig-tip-2-u",
    shortName: "DIG & TIP 2 U",
    name: "DIG & TIP 2 U",
    eyebrow: "PRACTICAL DIGGER AND TRUCK SUPPORT, DELIVERED TO YOU.",
    accent: "#f8c919",
    hero: "/images/figma/dig-1.png",
    introImage: "/images/figma/dig-2.png",
    detailImage: "/images/figma/dig-4.png",
    finalImage: "/images/figma/dig-7.png",
    heroTitle: "DIG & TIP 2 U - DIGGER & TRUCK HIRE",
    heroCopy: "Digging, tipping and clean-up support for jobs that need a reliable local team.",
    introCopy: [
      "DIG & TIP 2 U provides practical dry digger and truck hire for property work, site cleanups, small earthworks and material removal.",
      "This is a self-operated hire service, giving you the equipment needed to complete the work yourself. A valid Class 2 licence is required to operate the truck, and the DIG & TIP 2 U team can assist with arranging delivery of the equipment to your site.",
      "This is a quote-based service, as every hire can vary depending on access, site conditions, hire duration, delivery distance, equipment required and the type of work being completed.",
    ],
    helpHeading: "WHAT WE CAN HELP WITH",
    helpCopy: [
      "DIG & TIP 2 U is designed for customers who need equipment to complete digging, loading, tipping and site work themselves. It is a practical hire option for homeowners, builders, contractors, rural properties and small commercial sites needing flexible machinery.",
    ],
    helpItems: [
      "Dry mini digger",
      "Small truck hire",
      "Digger and truck packages",
      "One-day hire",
      "Two-day hire",
      "Three-day hire",
      "Short-term hire",
      "Delivery assistance if required",
      "Flexible collection",
      "Equipment for property clean-ups",
      "Equipment for small earthworks",
    ],
    whyEyebrow: "LOCAL MACHINERY SUPPORT WITHOUT THE HASSLE.",
    whyItems: [
      "Quote-based service",
      "Useful for tight or practical site work",
      "Digger and truck support in one service",
      "Helpful for cleanups, prep work and material removal",
      "Suitable for residential, rural and commercial jobs",
    ],
    fixedPrice: false,
    coverageTitle: "SERVICING NORTH SHORE AND RODNEY",
  },
};

export const serviceList = Object.values(services);

export const northAreas = [
  "Dairy Flat",
  "Hibiscus Coast",
  "Orewa",
  "Whangaparāoa",
  "Stanmore Bay",
  "Army Bay",
  "Gulf Harbour",
  "Puhoi",
  "Mahurangi",
  "Omaha",
  "Snells Beach",
  "Kaipara",
  "Helensville",
  "Kumeū",
  "Glenfield",
  "Birkdale",
  "Devonport",
  "Long Bay",
  "North Shore",
  "Rodney",
  "Albany",
];

export const greaterAreas = [
  ...northAreas,
  "West Auckland",
  "East Auckland",
  "Auckland City",
  "Birkenhead",
  "Silverdale",
  "Kaukapakapa",
  "All The Bays",
  "South Auckland",
];
