const CATEGORY_PRICING = {
  'Aluminium Scaffolding': {
    daily: [35, 60],
    weekly: [200, 350],
    monthly: [600, 1100],
    unit: 'tower / set',
    note: 'Rates vary by tower height, width, and rental duration. Delivery within Abu Dhabi and Musaffah typically AED 150–350.',
  },
  Ladders: {
    daily: [25, 45],
    weekly: [120, 250],
    monthly: [350, 650],
    unit: 'ladder',
    note: 'Fiberglass ladders for electrical work may carry a premium. Bulk hire discounts available.',
  },
  'Steel Cuplock Scaffolding': {
    daily: [40, 75],
    weekly: [250, 450],
    monthly: [800, 1400],
    unit: 'bay / component set',
    note: 'Cuplock systems priced per vertical standard, ledger, and deck area. Musaffah delivery same-day on stock items.',
  },
  Couplers: {
    daily: [3, 15],
    weekly: [15, 60],
    monthly: [40, 180],
    unit: 'piece',
    note: 'Couplers and clamps rented per unit or sold outright. Pressed steel variants priced separately.',
  },
  Services: {
    daily: [500, 2500],
    weekly: null,
    monthly: null,
    unit: 'project / visit',
    note: 'Installation, inspection, and training quoted per site visit, tower count, and access complexity.',
  },
};

const INSTALL_SERVICE_IDS = new Set([
  'installation',
  'installation-disassembly',
  'installation-setup',
]);

const hash = (str) =>
  [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);

export const getServicePricing = (service) => {
  const band =
    CATEGORY_PRICING[service.category] ?? CATEGORY_PRICING['Steel Cuplock Scaffolding'];
  return { ...band, currency: 'AED' };
};

const SERVICE_UNIQUE_INTROS = {
  'single-width-scaffolding': `Single width scaffolding from Alcoa is the go-to access solution for narrow internal corridors, residential fit-outs, and light facade work across Abu Dhabi, United Arab Emirates. Our single-width aluminium mobile towers are 3–4× lighter than steel equivalents, require no tools to assemble, and comply with EN 1004 manufacturer guidelines. Hire starts from AED 35 per day with weekly rates from AED 200 — ideal for painting, MEP access, and short-duration maintenance contracts. Delivery to Abu Dhabi, Musaffah M-40/M-45, Yas Island, and KIZAD from our Musaffah warehouse.`,
  'double-width-scaffolding': `Double width scaffolding offers a wider working platform — essential for facade work, external cladding, and tasks requiring two workers side-by-side on Abu Dhabi construction sites. Alcoa's double-width aluminium towers are available from AED 45 per day and can reach heights suited for mid-rise works when combined with outrigger stabilisers. Our Musaffah warehouse maintains ready stock for same-day delivery across Abu Dhabi, Yas Island, and KIZAD. Weekly packages from AED 280 reduce costs on projects running 5+ days.`,
  'scaffolding-delivery': `Alcoa Aluminium Scaffolding offers same-day scaffolding delivery across Abu Dhabi, United Arab Emirates — covering Musaffah M-40/M-45, Yas Island, Saadiyat, Reem Island, KIZAD, and Abu Dhabi mainland. Our Musaffah warehouse dispatches aluminium towers, steel cuplock sets, ladders, and couplers with confirmed orders before 2 PM. Delivery charges are transparent and quoted upfront in AED — no hidden fees. Musaffah pickup is free. Emergency and weekend dispatches are available on request.`,
  'aluminium-scaffolding': `Alcoa Aluminium Scaffolding is the leading aluminium scaffolding supplier in Abu Dhabi, United Arab Emirates. Our aluminium mobile towers cover single-width, double-width, stairway, folding, and bridgeway configurations — suitable for construction, MEP, facade access, and industrial maintenance. All towers comply with EN 1004 standards and include outrigger stabilisers and wheel locks. Hire from AED 35/day or buy outright; weekly and monthly rates reduce the daily equivalent by up to 30%. Delivery to KIZAD, Yas Island, Musaffah, and all Abu Dhabi zones.`,
  'installation': `Alcoa's scaffolding installation service provides certified erection crews to install, inspect, and dismantle scaffolding on site across Abu Dhabi, United Arab Emirates. Our erectors are trained in cuplock and aluminium tower assembly, hold relevant competency documentation, and are familiar with Abu Dhabi municipality and ADNOC HSEMS requirements. Installation is quoted per site visit based on tower height, deck area, access complexity, and duration. Full HSE handover documentation included. Ideal for contractors who require proof of competent erection for site approval.`,
  'installation-disassembly': `Our scaffolding installation and disassembly service covers the full lifecycle of your access requirement — erection, mid-project inspection, modification, and final dismantling — across Abu Dhabi, United Arab Emirates. Certified crews work to Abu Dhabi safety regulations with handover documentation at each stage. This service is widely used by facility managers, MEP contractors, and industrial clients at KIZAD, Musaffah, and Yas Island who need a single-supplier solution from setup to pack-down.`,
  'safety-inspections': `Alcoa offers scaffolding safety inspection services in Abu Dhabi, United Arab Emirates — covering pre-use inspections, post-alteration checks, and periodic inspections as required by UAE scaffolding safety standards and Abu Dhabi EHSMS regulations. Our inspectors assess structural integrity, guardrail and toe board compliance, base plate condition, and working platform standards. Written inspection reports are issued for site HSE records. This service supports contractors seeking ADNOC-zone or Abu Dhabi municipality scaffolding compliance.`,
  'training': `Our scaffolding training programmes in Abu Dhabi, United Arab Emirates cover safe erection, dismantling, inspection, and use of aluminium mobile towers and steel cuplock systems. Training is delivered on-site or at our Musaffah facility, tailored to your crew's equipment and site conditions. Certificates of competency are issued on completion — supporting site access requirements for ADNOC, KIZAD, and Abu Dhabi municipality projects. Course content aligns with AS/NZS 1576 and international scaffold safety standards.`,
  'a-type-ladder': `Alcoa's A-type ladders are the most widely rented ladder in Abu Dhabi, United Arab Emirates — used by contractors, facility teams, and homeowners for access up to standard working height. Our aluminium A-type (dual purpose) ladders are lightweight, corrosion-resistant, and suitable for indoor and outdoor use. Hire from AED 25/day or buy outright. Musaffah warehouse pickup is free; delivery to Abu Dhabi, Yas Island, and Musaffah same-day. Fiberglass variants available for electrical and near-power-line environments.`,
  'fiberglass-ladder': `Fiberglass ladders from Alcoa are essential for electrical work, MEP access near live equipment, and any environment where non-conductivity is a safety requirement in Abu Dhabi, United Arab Emirates. Our fiberglass A-type and straight ladders are rated for electrical environments and comply with international safety standards for non-conductive access. Hire from AED 30/day; bulk hire discounts available. Delivery to KIZAD, Musaffah, Yas Island, and Abu Dhabi mainland from our M-40 warehouse.`,
  'cuplock-standard': `Cuplock standards (vertical tubes) are the backbone of any steel cuplock scaffolding system in Abu Dhabi, United Arab Emirates. Alcoa stocks cuplock standards in 1.5m, 2m, and 3m lengths with welded cups at regular intervals for tool-free ledger locking. Widely used on high-rise perimeter scaffolding, industrial turnarounds at ADNOC facilities, KIZAD construction sites, and large residential developments. Individual standards from AED 8/day or buy outright. Musaffah warehouse same-day dispatch.`,
  'cuplock-ledger': `Cuplock ledgers are the horizontal members that lock into the cups of standards without nuts and bolts — enabling fast, modular scaffolding assembly on Abu Dhabi construction and industrial sites. Alcoa stocks ledgers in 0.9m to 2.4m spans for flexible bay configurations. Hire from AED 5/ledger/day; full bay set rental available. Used extensively in KIZAD, Musaffah industrial areas, and Yas Island projects where modular, heavy-duty access is required. Musaffah pickup free; same-day delivery to Abu Dhabi zones.`,
  'double-coupler': `Double couplers (fixed/right-angle couplers) are the standard connection fitting for tube-and-coupler scaffolding in Abu Dhabi, United Arab Emirates. Alcoa's double couplers are pressed steel or drop-forged, with load ratings suitable for UAE construction standards. Hire from AED 3/piece/day or purchase outright. Used alongside GI pipe, MS pipe, and cuplock systems to build access structures on industrial, commercial, and residential sites across Musaffah, KIZAD, and Abu Dhabi. Musaffah warehouse walk-in collection available.`,
  'gi-pipe': `GI (galvanised iron) pipe is the primary tube used in tube-and-coupler scaffolding systems across Abu Dhabi, United Arab Emirates. Alcoa supplies hot-dip galvanised GI scaffolding pipe in standard 6m lengths — corrosion-resistant for coastal and high-humidity environments common in Abu Dhabi. GI pipe is used for standards, ledgers, bracing, and handrails in heavy-duty scaffolding structures on ADNOC, KIZAD, and Musaffah industrial sites. Rental and sale available from our Musaffah M-40 warehouse with same-day delivery.`,
  'ms-pipe': `MS (mild steel) pipe from Alcoa is used in heavy-duty scaffolding and construction support systems across Abu Dhabi, United Arab Emirates. Supplied in standard scaffolding diameters and lengths, MS pipe is combined with double, swivel, and putlog couplers to build tube-and-coupler access structures for industrial projects, bridge scaffolding, and custom access solutions. Available for rent and sale from our Musaffah warehouse with same-day delivery to KIZAD, Musaffah M-40/M-45, and Abu Dhabi mainland sites.`,
};

export const getServiceIntro = (serviceId, service) => {
  if (SERVICE_UNIQUE_INTROS[serviceId]) {
    return SERVICE_UNIQUE_INTROS[serviceId];
  }

  const specs = Object.entries(service.quickDetails)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
  const highlight = service.highlights[0] ?? 'certified UAE scaffolding';
  const variant = hash(serviceId) % 3;

  const intros = [
    `${service.title} from Alcoa Aluminium Scaffolding is built for UAE construction, maintenance, and industrial access. ${service.description} Typical specifications include ${specs}. Key advantage: ${highlight.toLowerCase()}. We deliver across Abu Dhabi, United Arab Emirates and Musaffah with same-day dispatch on in-stock ${service.category.toLowerCase()} equipment.`,
    `When your project needs reliable ${service.title.toLowerCase()}, Alcoa supplies rental and sale options with documented safety compliance. ${service.description} Our ${service.category.toLowerCase()} inventory covers ${specs}. Clients choose us for ${highlight.toLowerCase()} plus 24/7 WhatsApp quotes and Musaffah warehouse pickup.`,
    `Alcoa Aluminium Scaffolding stocks ${service.title.toLowerCase()} for contractors, facility managers, and MEP teams across the UAE. ${service.description} Equipment details: ${specs}. Every order includes ${highlight.toLowerCase()}, optional erection crews, and flexible daily, weekly, or monthly hire terms.`,
  ];

  return intros[variant];
};

export const getServiceFaq = (serviceId, service) => {
  const pricing = getServicePricing(service);
  const title = service.title;
  const cat = service.category;

  return [
    {
      q: `How much does ${title.toLowerCase()} cost in Abu Dhabi?`,
      a: `Typical ${cat.toLowerCase()} rental for ${title.toLowerCase()} ranges from AED ${pricing.daily[0]}–${pricing.daily[1]} per ${pricing.unit} per day. Weekly and monthly rates reduce the daily equivalent. Contact us for a site-specific quote including delivery to your Abu Dhabi, United Arab Emirates location.`,
    },
    {
      q: `Do you deliver ${title.toLowerCase()} to Abu Dhabi and Musaffah?`,
      a: `Yes. We deliver ${title.toLowerCase()} across Abu Dhabi, United Arab Emirates and Musaffah Industrial Area. Musaffah customers can collect from our warehouse or schedule delivery. Emergency and weekend dispatch is available on request.`,
    },
    {
      q: `Can I rent and buy ${title.toLowerCase()} from Alcoa?`,
      a: `Both options are available. Short-term projects usually hire ${title.toLowerCase()}; long-term or repeat use clients often purchase. We provide buy-back guidance and fleet maintenance for owned equipment.`,
    },
    {
      q: `Is ${title.toLowerCase()} certified for UAE construction sites?`,
      a: `Our ${cat.toLowerCase()} equipment meets applicable international standards and UAE site safety requirements. Documentation is available on request for contractor approval and HSE audits.`,
    },
    {
      q: `What is the minimum rental period for ${title.toLowerCase()}?`,
      a: `Minimum hire is typically one day for ${title.toLowerCase()}. Weekly packages start at AED ${pricing.weekly?.[0] ?? pricing.daily[0] * 5} and monthly from AED ${pricing.monthly?.[0] ?? pricing.daily[0] * 20}. Extended hires receive discounted rates.`,
    },
    {
      q: `Do you provide installation for ${title.toLowerCase()}?`,
      a: `Yes. Our certified erection teams can install, inspect, and dismantle ${title.toLowerCase()} on site. Installation is quoted separately based on height, access, and duration.`,
    },
    {
      q: `How fast can I get a quote for ${title.toLowerCase()}?`,
      a: `WhatsApp or phone quotes are usually returned within 30 minutes during business hours. Share tower height, quantity, location, and rental duration for the fastest accurate pricing.`,
    },
  ];
};

export const getServiceProcess = (service) => {
  if (service.process?.length) return service.process;

  return [
    `Share project location, required ${service.title.toLowerCase()} quantity, and access constraints via phone or contact form.`,
    'Receive a written quote with daily, weekly, or monthly rates in AED plus delivery timeline.',
    'Confirm hire or purchase; we reserve stock from our Musaffah warehouse.',
    'Delivery or customer pickup scheduled with load lists and safety documentation.',
    'Optional certified erection, inspection, and handover on site.',
    'Return, extension, or purchase conversion handled at project completion.',
  ];
};

export const isHowToService = (serviceId) => INSTALL_SERVICE_IDS.has(serviceId);

export const getHowToSteps = (service) =>
  getServiceProcess(service).map((text, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: `Step ${i + 1}`,
    text,
  }));

export const buildFaqSchema = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

export const buildProductSchema = (serviceId, service, pricing) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: service.title,
  description: service.description,
  category: service.category,
  brand: { '@type': 'Brand', name: 'Alcoa Aluminium Scaffolding' },
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: pricing.currency,
    lowPrice: String(pricing.daily[0]),
    highPrice: String(pricing.daily[1]),
    offerCount: '3',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: 'Alcoa Aluminium Scaffolding',
    },
  },
  url: `https://alcoascaffolding.com/services/${serviceId}`,
});

export const buildEnhancedServiceSchema = (serviceId, service, pricing) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.description,
  provider: {
    '@type': 'LocalBusiness',
    name: 'Alcoa Aluminium Scaffolding',
    legalName: 'Alcoa Aluminium Scaffolding L.L.C - S.P.C',
    url: 'https://alcoascaffolding.com',
    telephone: '+971581375601',
    address: {
      '@type': 'PostalAddress',
      streetAddress: "Ar Rahmah 4 St., Musaffah 37, Al Mantaqah As Sinai'yah 1 Street, Office 11, 1st Floor",
      addressLocality: 'Musaffah',
      addressRegion: 'Abu Dhabi',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.3570,
      longitude: 54.5080,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      reviewCount: '5',
      bestRating: '5',
    },
  },
  areaServed: [
    { '@type': 'City', name: 'Abu Dhabi' },
    { '@type': 'Place', name: 'Musaffah' },
    { '@type': 'Country', name: 'United Arab Emirates' },
  ],
  serviceType: service.category,
  offers: {
    '@type': 'Offer',
    priceCurrency: pricing.currency,
    price: String(pricing.daily[0]),
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: `${pricing.daily[0]}-${pricing.daily[1]}`,
      priceCurrency: pricing.currency,
      unitText: `per ${pricing.unit} per day`,
    },
  },
  url: `https://alcoascaffolding.com/services/${serviceId}`,
});

export const buildHowToSchema = (serviceId, service) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: `How to order and install ${service.title} in UAE`,
  description: `Step-by-step process for hiring ${service.title.toLowerCase()} from Alcoa Scaffolding in Abu Dhabi, United Arab Emirates.`,
  step: getHowToSteps(service),
  url: `https://alcoascaffolding.com/services/${serviceId}`,
});
