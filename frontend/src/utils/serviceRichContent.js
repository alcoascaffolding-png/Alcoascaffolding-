const CATEGORY_PRICING = {
  'Aluminium Scaffolding': {
    daily: [35, 60],
    weekly: [200, 350],
    monthly: [600, 1100],
    unit: 'tower / set',
    note: 'Rates vary by tower height, width, and rental duration. Delivery within Dubai metro typically AED 150–350.',
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

export const getServiceIntro = (serviceId, service) => {
  const specs = Object.entries(service.quickDetails)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
  const highlight = service.highlights[0] ?? 'certified UAE scaffolding';
  const variant = hash(serviceId) % 3;

  const intros = [
    `${service.title} from Alcoa Aluminium Scaffolding is built for UAE construction, maintenance, and industrial access. ${service.description} Typical specifications include ${specs}. Key advantage: ${highlight.toLowerCase()}. We deliver across Dubai, Abu Dhabi, Musaffah, and Sharjah with same-day dispatch on in-stock ${service.category.toLowerCase()} equipment.`,
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
      q: `How much does ${title.toLowerCase()} cost in Dubai?`,
      a: `Typical ${cat.toLowerCase()} rental for ${title.toLowerCase()} ranges from AED ${pricing.daily[0]}–${pricing.daily[1]} per ${pricing.unit} per day. Weekly and monthly rates reduce the daily equivalent. Contact us for a site-specific quote including delivery to your Dubai location.`,
    },
    {
      q: `Do you deliver ${title.toLowerCase()} to Abu Dhabi and Musaffah?`,
      a: `Yes. We deliver ${title.toLowerCase()} across Dubai, Abu Dhabi, Musaffah Industrial Area, Sharjah, and Al Ain. Musaffah customers can collect from our warehouse or schedule delivery. Emergency and weekend dispatch is available on request.`,
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
    url: 'https://alcoascaffolding.com',
    telephone: '+971581375601',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Musaffah',
      addressRegion: 'Abu Dhabi',
      addressCountry: 'AE',
    },
  },
  areaServed: [
    { '@type': 'City', name: 'Dubai' },
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
  description: `Step-by-step process for hiring ${service.title.toLowerCase()} from Alcoa Scaffolding in Dubai and Abu Dhabi.`,
  step: getHowToSteps(service),
  url: `https://alcoascaffolding.com/services/${serviceId}`,
});
