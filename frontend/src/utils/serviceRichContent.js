import {
  SITE_URL,
  SITE_NAME,
  LEGAL_NAME,
  PHONE_PRIMARY_E164,
  STREET_ADDRESS,
  ADDRESS_LOCALITY,
  ADDRESS_REGION,
  ADDRESS_COUNTRY,
  GEO,
} from '../data/businessFacts';

/** Quote-based pricing — specific AED bands are unconfirmed and not emitted in schema. */
const CATEGORY_PRICING = {
  'Aluminium Scaffolding': {
    unit: 'tower / set',
    note: 'Daily, weekly, and monthly hire available. Request a free quote for your tower height and duration.',
  },
  Ladders: {
    unit: 'ladder',
    note: 'Aluminium and fiberglass ladders for hire or sale. Bulk hire discounts available on request.',
  },
  'Steel Cuplock Scaffolding': {
    unit: 'bay / component set',
    note: 'Cuplock systems quoted per vertical standard, ledger, and deck area from our Musaffah 37 warehouse.',
  },
  Couplers: {
    unit: 'piece',
    note: 'Couplers and clamps available for rent or sale. Pressed steel variants quoted separately.',
  },
  Services: {
    unit: 'project / visit',
    note: 'Installation, inspection, and training quoted per site visit, tower count, and access complexity.',
  },
};

const INSTALL_SERVICE_IDS = new Set([
  'installation',
  'installation-disassembly',
  'installation-setup',
]);

const hash = (str) => [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0);

export const getServicePricing = (service) => {
  const band =
    CATEGORY_PRICING[service.category] ?? CATEGORY_PRICING['Steel Cuplock Scaffolding'];
  return { ...band, currency: 'AED', quoteBased: true };
};

const SERVICE_UNIQUE_INTROS = {
  'single-width-scaffolding': `Single width scaffolding from Alcoa is a practical access solution for narrow internal corridors, residential fit-outs, and light facade work across Abu Dhabi, United Arab Emirates. Our single-width aluminium mobile towers are significantly lighter than steel equivalents, assemble without specialised tools, and follow EN 1004 manufacturer guidelines. Ideal for painting, MEP access, and short-duration maintenance contracts. Delivery and pickup available from our Musaffah 37 warehouse covering Abu Dhabi, Yas Island, and KIZAD.`,
  'double-width-scaffolding': `Double width scaffolding offers a wider working platform — essential for facade work, external cladding, and tasks requiring two workers side-by-side on Abu Dhabi construction sites. Alcoa's double-width aluminium towers can reach heights suited for mid-rise works when combined with outrigger stabilisers. Our Musaffah 37 warehouse maintains ready stock for delivery across Abu Dhabi, Yas Island, and KIZAD. Ask for weekly and monthly hire packages on multi-day projects.`,
  'scaffolding-delivery': `Alcoa Aluminium Scaffolding delivers scaffolding across Abu Dhabi, United Arab Emirates — covering Musaffah 37, Yas Island, Saadiyat, Reem Island, KIZAD, and Abu Dhabi mainland. Our warehouse dispatches aluminium towers, steel cuplock sets, ladders, and couplers with confirmed orders. Delivery charges are quoted upfront in AED. Musaffah pickup is available during business hours. Weekend dispatches can be arranged on request.`,
  'aluminium-scaffolding': `Alcoa Aluminium Scaffolding supplies aluminium scaffolding in Abu Dhabi, United Arab Emirates. Our aluminium mobile towers cover single-width, double-width, stairway, folding, and bridgeway configurations — suitable for construction, MEP, facade access, and industrial maintenance. Towers follow EN 1004 standards and include outrigger stabilisers and wheel locks where specified. Hire or buy outright; weekly and monthly rates available on request. Delivery to KIZAD, Yas Island, Musaffah 37, and Abu Dhabi zones.`,
  'cantilever-scaffolding': `Cantilever scaffolding from Alcoa supports projects where ground-bearing standards cannot sit directly beneath the working platform — common on Abu Dhabi and Dubai facade works, atrium access, and obstructed industrial floors. We supply cantilever configurations for rent and sale with certified components from Musaffah 37. Request a free quote for span, load, and erection crew options.`,
  'stairway-scaffolding': `Stairway scaffolding provides safe vertical access for multi-level UAE construction and maintenance. Alcoa stocks stairway tower systems for hire across Abu Dhabi and Dubai with delivery from Musaffah 37. Combine with aluminium platforms and guardrails for compliant site access. Contact us for height requirements and erection support.`,
  'aluminium-rolling-platform': `Aluminium rolling platforms offer mobile elevated access for painting, fit-out, and facility maintenance across Abu Dhabi and Dubai. Lightweight, lockable castors, and certified decks make them ideal for indoor and outdoor short-duration work. Available for rental and sale from Alcoa Musaffah 37 — ask for daily or monthly hire terms.`,
  'folding-tower': `Folding scaffolding towers and mobile scaffold towers from Alcoa suit contractors who need compact transport and fast setup in UAE sites. Hire folding towers for villa work, MEP, and building maintenance with delivery from Musaffah 37 to Abu Dhabi and Dubai. Request a quote for height and platform size.`,
  'cuplock-standard': `Cuplock standards (vertical tubes) are the backbone of steel cuplock scaffolding systems in Abu Dhabi, United Arab Emirates. Alcoa stocks cuplock standards in common lengths with welded cups for tool-free ledger locking. Used on high-rise perimeter scaffolding, industrial turnarounds, KIZAD construction sites, and large residential developments. Rent or buy from our Musaffah 37 warehouse.`,
  'intermediate-transom': `Intermediate transom scaffolding components from Alcoa support bay decks and load distribution on cuplock and frame systems across the UAE. Available for rental and sale with fast supply from Musaffah 37, Abu Dhabi. Contact our sales team for bay sizes and project quantities.`,
  'prop-jacks': `Prop jacks and base jacks from Alcoa adjust scaffold height and level on uneven UAE site conditions. We supply prop jacks for hire and sale with related cuplock and frame components from Musaffah 37. Request pricing for project quantities.`,
  'swivel-coupler-pressed': `Pressed swivel couplers connect tubes at variable angles for bracing and custom access structures. Alcoa supplies scaffolding clamps and couplers for contractors across Abu Dhabi and Dubai — rent or buy from Musaffah 37.`,
  'right-angle-coupler': `Right-angle (double) couplers are the standard fixed connection for tube-and-coupler scaffolding in the UAE. Alcoa stocks load-rated couplers for industrial and commercial sites with warehouse collection or delivery.`,
  'universal-clamp': `Universal clamps and specialty scaffolding fittings from Alcoa support mixed-system builds across Abu Dhabi projects. Available alongside our full coupler range from the Musaffah 37 warehouse.`,
  'wooden-planks': `Wooden scaffolding planks for Dubai and Abu Dhabi sites — hire or purchase deck boards that pair with cuplock and tube systems. Stocked at Alcoa Musaffah 37 with delivery options across the UAE.`,
  'steel-planks': `Steel scaffolding planks provide durable working platforms for industrial UAE projects. Alcoa supplies steel decks for rent and sale with cuplock and frame systems from Musaffah 37.`,
  'lattice-beam': `Lattice beams support bridging and heavy-duty spanning applications in UAE scaffolding designs. Available from Alcoa for project hire with engineering coordination on request.`,
  'bridge-scaffolding': `Bridge scaffolding and bridgeway mobile towers from Alcoa create safe crossing access between structures on Abu Dhabi and Dubai sites. Rent configurations suited to span and load — quote on request.`,
  inspections: `Alcoa offers scaffolding inspection services in Abu Dhabi, United Arab Emirates — covering pre-use inspections, post-alteration checks, and periodic inspections aligned with UAE scaffolding safety expectations and Abu Dhabi EHSMS practice. Written inspection reports support contractor HSE records.`,
  'safety-inspections': `Certified scaffolding inspection support for Abu Dhabi contractors — structural integrity, guardrails, toe boards, base plates, and platform standards. Reports issued for site HSE files. See also our dedicated inspection landing page.`,
  manpower: `Scaffolding manpower supply in Abu Dhabi — erection and dismantling crews for aluminium and cuplock systems. Teams familiar with industrial and commercial site requirements. Request crew size and duration via WhatsApp or contact form.`,
  installation: `Alcoa's scaffolding installation service provides erection crews to install, inspect, and dismantle scaffolding on site across Abu Dhabi, United Arab Emirates. Installation is quoted per site visit based on tower height, deck area, access complexity, and duration.`,
  'installation-disassembly': `Full-lifecycle scaffolding erection and dismantling across Abu Dhabi — erection, mid-project modification, and pack-down with handover documentation. Used by facility managers and industrial clients at KIZAD, Musaffah, and Yas Island.`,
  training: `Scaffolding training programmes in Abu Dhabi covering safe erection, dismantling, inspection, and use of aluminium mobile towers and steel cuplock systems. Delivered on-site or at Musaffah 37 where arranged.`,
  rental: `Flexible scaffolding rental across the UAE from Alcoa Aluminium Scaffolding — aluminium towers, steel cuplock, ladders, and accessories. Daily, weekly, and monthly hire terms with delivery from Musaffah 37, Abu Dhabi. Request a free quote for your project.`,
  'a-type-ladder': `Alcoa's A-type ladders are widely used across Abu Dhabi for contractor and facility access. Aluminium dual-purpose ladders are lightweight and corrosion-resistant. Fiberglass variants available for electrical environments. Hire or buy from Musaffah 37.`,
  'fiberglass-ladder': `Fiberglass ladders from Alcoa suit electrical work and MEP access near live equipment in Abu Dhabi where non-conductivity is required. A-type and straight options available for rent and sale with delivery from Musaffah 37.`,
};

export const getServiceIntro = (serviceId, service) => {
  if (SERVICE_UNIQUE_INTROS[serviceId]) {
    return SERVICE_UNIQUE_INTROS[serviceId];
  }

  const specs = Object.entries(service.quickDetails || {})
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
  const highlight = service.highlights?.[0] ?? 'certified UAE scaffolding';
  const variant = hash(serviceId) % 3;

  const intros = [
    `${service.title} from ${SITE_NAME} is built for UAE construction, maintenance, and industrial access. ${service.description} Typical specifications include ${specs}. Key advantage: ${highlight.toLowerCase()}. We deliver across Abu Dhabi and Musaffah 37 with dispatch on in-stock ${service.category.toLowerCase()} equipment.`,
    `When your project needs reliable ${service.title.toLowerCase()}, Alcoa supplies rental and sale options with documented safety compliance. ${service.description} Our ${service.category.toLowerCase()} inventory covers ${specs}. Clients choose us for ${highlight.toLowerCase()} plus WhatsApp quotes and Musaffah 37 warehouse pickup.`,
    `${SITE_NAME} stocks ${service.title.toLowerCase()} for contractors, facility managers, and MEP teams across the UAE. ${service.description} Equipment details: ${specs}. Every order includes ${highlight.toLowerCase()}, optional erection crews, and flexible daily, weekly, or monthly hire terms.`,
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
      a: `${cat} pricing for ${title.toLowerCase()} is quoted per ${pricing.unit} based on quantity, duration, and delivery zone. Share your site details for a free AED quote from our Musaffah 37 team.`,
    },
    {
      q: `Do you deliver ${title.toLowerCase()} to Abu Dhabi and Musaffah?`,
      a: `Yes. We deliver ${title.toLowerCase()} across Abu Dhabi and Musaffah 37. Customers can also collect from our warehouse during business hours. Weekend dispatch can be arranged on request.`,
    },
    {
      q: `Can I rent and buy ${title.toLowerCase()} from Alcoa?`,
      a: `Both options are available. Short-term projects usually hire ${title.toLowerCase()}; long-term or repeat-use clients often purchase. We provide guidance on hire-versus-buy for your project duration.`,
    },
    {
      q: `Is ${title.toLowerCase()} suitable for UAE construction sites?`,
      a: `Our ${cat.toLowerCase()} equipment is supplied for UAE construction and maintenance use. Documentation is available on request for contractor approval and HSE audits. Alcoa is ISO 9001:2015 certified.`,
    },
    {
      q: `What is the minimum rental period for ${title.toLowerCase()}?`,
      a: `Minimum hire is typically one day for ${title.toLowerCase()}, subject to availability. Weekly and monthly packages are available — confirm terms when you request a quote.`,
    },
    {
      q: `Do you provide installation for ${title.toLowerCase()}?`,
      a: `Yes. Our erection teams can install, inspect, and dismantle ${title.toLowerCase()} on site. Installation is quoted separately based on height, access, and duration.`,
    },
    {
      q: `How fast can I get a quote for ${title.toLowerCase()}?`,
      a: `WhatsApp or phone quotes are usually returned quickly during business hours (Mon–Sat 8am–6pm). Share height, quantity, location, and rental duration for accurate pricing.`,
    },
  ];
};

export const getServiceProcess = (service) => {
  if (service.process?.length) return service.process;

  return [
    `Share project location, required ${service.title.toLowerCase()} quantity, and access constraints via phone or contact form.`,
    'Receive a written quote with hire options in AED plus delivery timeline.',
    'Confirm hire or purchase; we reserve stock from our Musaffah 37 warehouse.',
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

export const buildProductSchema = (serviceId, service) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: service.title,
  description: service.description,
  category: service.category,
  brand: { '@type': 'Brand', name: SITE_NAME },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'AED',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/contact-us`,
    description: 'Request a free quote for rental or sale pricing',
    seller: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  },
  url: `${SITE_URL}/services/${serviceId}`,
});

export const buildEnhancedServiceSchema = (serviceId, service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.description,
  provider: {
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    telephone: PHONE_PRIMARY_E164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STREET_ADDRESS,
      addressLocality: ADDRESS_LOCALITY,
      addressRegion: ADDRESS_REGION,
      addressCountry: ADDRESS_COUNTRY,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
  },
  areaServed: [
    { '@type': 'City', name: 'Abu Dhabi' },
    { '@type': 'Place', name: 'Musaffah' },
    { '@type': 'City', name: 'Dubai' },
    { '@type': 'Country', name: 'United Arab Emirates' },
  ],
  serviceType: service.category,
  url: `${SITE_URL}/services/${serviceId}`,
});

export const buildHowToSchema = (serviceId, service) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: `How to order and install ${service.title} in UAE`,
  description: `Step-by-step process for hiring ${service.title.toLowerCase()} from Alcoa Scaffolding in Abu Dhabi, United Arab Emirates.`,
  step: getHowToSteps(service),
  url: `${SITE_URL}/services/${serviceId}`,
});
