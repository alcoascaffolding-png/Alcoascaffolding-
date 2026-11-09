import {
  PHONE_PRIMARY,
  STREET_ADDRESS_SHORT,
  ISO_CERT,
  OPENING_HOURS_SUMMARY,
  EMAIL_SALES,
} from './businessFacts';

/**
 * Single source of title / description / H1 / primary keyword for static routes.
 * Read by page components (SEOHead) and by scripts/inject-prerender-meta.mjs.
 * `primaryKeyword` must appear in title, H1 and description and be unique across pages.
 */

/**
 * Project gallery and detail pages still use sample copy (unverified awards / venues).
 * Kept out of the index and sitemap until real project details replace them.
 */
export const PROJECT_DETAILS_NOINDEX = true;

export const HOME_FAQ = [
  {
    q: 'Who supplies aluminium scaffolding in Abu Dhabi?',
    a: `Alcoa Aluminium Scaffolding L.L.C - S.P.C supplies aluminium scaffolding from ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi. Call ${PHONE_PRIMARY} for rental or purchase quotes.`,
  },
  {
    q: 'Where can I rent aluminium scaffolding in Abu Dhabi?',
    a: `Rent aluminium towers and access equipment from our Musaffah 37 warehouse, or request delivery across Abu Dhabi. See our scaffolding rental page or call ${PHONE_PRIMARY}.`,
  },
  {
    q: 'Do you also supply steel cuplock scaffolding?',
    a: 'Yes. Alcoa supplies steel cuplock standards, ledgers, transoms, jacks and planks for rent or sale, alongside aluminium towers, for heavier industrial and high-rise access.',
  },
  {
    q: 'Do you install and dismantle scaffolding?',
    a: 'Yes. Our crews erect and dismantle aluminium towers and cuplock systems on Abu Dhabi and UAE sites. Installation and dismantling are quoted per site based on height, area and duration.',
  },
  {
    q: 'How much does scaffolding rental cost in Abu Dhabi?',
    a: `Scaffolding rental is quoted per equipment type, height, quantity, and hire duration (daily, weekly, or monthly). Contact Alcoa at ${PHONE_PRIMARY} for a free site-specific AED quote.`,
  },
  {
    q: 'Where is Alcoa Scaffolding located?',
    a: `Alcoa Aluminium Scaffolding LLC is based at ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi, UAE. It is our only office and warehouse; we deliver to Dubai and the rest of the UAE from here (pickup ${OPENING_HOURS_SUMMARY}).`,
  },
];

export const ABOUT_FAQ = [
  {
    q: 'What is Alcoa Aluminium Scaffolding?',
    a: `Alcoa Aluminium Scaffolding L.L.C - S.P.C is a scaffolding company in Musaffah 37, Abu Dhabi. It manufactures, supplies, rents, erects, dismantles and maintains aluminium and steel scaffolding and ladders under ${ISO_CERT.standard} (certificate ${ISO_CERT.number}).`,
  },
  {
    q: 'What is the address and phone number of Alcoa Scaffolding?',
    a: `${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi, UAE. Phone / WhatsApp ${PHONE_PRIMARY}, email ${EMAIL_SALES}.`,
  },
  {
    q: 'Which areas does Alcoa serve?',
    a: 'Abu Dhabi (including Musaffah, KIZAD, Yas Island, Saadiyat and Reem), Dubai and the other emirates, with delivery from the Musaffah 37 warehouse.',
  },
];

export const CONTACT_FAQ = [
  {
    q: 'How do I get a scaffolding quote from Alcoa?',
    a: `Call or WhatsApp ${PHONE_PRIMARY}, email ${EMAIL_SALES}, or use the contact form. Share site location, equipment type, height, quantity and hire duration.`,
  },
  {
    q: 'Can I visit the Alcoa warehouse in Musaffah?',
    a: `Yes. The warehouse and office are at ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi. Opening hours: ${OPENING_HOURS_SUMMARY}.`,
  },
];

export const INDUSTRIAL_FAQ = [
  {
    q: 'Which scaffolding is used for industrial projects in Abu Dhabi?',
    a: 'Heavy decks, plant shutdowns and high-rise perimeters usually use steel cuplock scaffolding; aluminium mobile towers suit lighter MEP and maintenance access. Alcoa supplies both from Musaffah 37.',
  },
  {
    q: 'Do you provide scaffolding installation and dismantling crews?',
    a: 'Yes. Erection, modification and dismantling crews can be supplied with equipment hire for Abu Dhabi and UAE sites. Crew size and duration are quoted per project.',
  },
  {
    q: 'Can you deliver industrial scaffolding to KIZAD and Musaffah sites?',
    a: 'Yes. KIZAD, ICAD and Musaffah industrial areas are served directly from our Musaffah 37 warehouse. Share gate-pass and unloading requirements when you book.',
  },
];

export const ROUTE_META = {
  '/': {
    title: 'Aluminium Scaffolding Abu Dhabi | Supplier & Rental | Alcoa',
    description:
      'Aluminium scaffolding Abu Dhabi — scaffolding supplier and rental company in Musaffah 37 for towers, cuplock and ladders. ISO 9001:2015. Call +971 58 137 5601.',
    h1: 'Aluminium Scaffolding Abu Dhabi & United Arab Emirates',
    primaryKeyword: 'Aluminium Scaffolding Abu Dhabi',
    money: true,
    quickAnswer: `Alcoa Aluminium Scaffolding supplies, rents and installs aluminium scaffolding in Abu Dhabi from its warehouse at ${STREET_ADDRESS_SHORT}, Musaffah. The range covers mobile scaffold towers, ladders, steel cuplock and accessories, delivered across the UAE. ${ISO_CERT.standard} certified. Call ${PHONE_PRIMARY} for a free quote.`,
    faq: HOME_FAQ,
    alternates: { ar: '/ar' },
    sections: [
      {
        h2: 'Aluminium scaffolding in Abu Dhabi — supplier, rental & towers',
        paragraphs: [
          'Alcoa Aluminium Scaffolding L.L.C - S.P.C provides aluminium scaffolding in Abu Dhabi from our warehouse in Musaffah 37. Contractors hire or buy mobile towers, ladders and access equipment for construction, building maintenance, industrial sites and facility work across Abu Dhabi and the UAE.',
          'We quote by tower type, height, quantity and duration — daily, weekly or monthly. ISO 9001:2015 processes cover manufacturing, supply, erection, dismantling, rental and maintenance.',
        ],
        links: [
          { label: 'Aluminium scaffold towers Abu Dhabi', path: '/products/aluminium-scaffolding' },
          { label: 'Aluminium scaffolding rental Abu Dhabi', path: '/services/rental' },
          { label: 'Aluminium scaffolding supplier Abu Dhabi', path: '/aluminium-scaffolding-supplier-abu-dhabi' },
          { label: 'Aluminium scaffolding UAE', path: '/scaffolding-rental-uae' },
          { label: 'Mobile scaffolding towers', path: '/services/folding-tower' },
          { label: 'Steel cuplock scaffolding UAE', path: '/products/steel-cuplock-scaffolding' },
          { label: 'Aluminium ladder supplier', path: '/products/ladders' },
          { label: 'Scaffolding rental Abu Dhabi', path: '/scaffolding-rental-abu-dhabi' },
          { label: 'Scaffolding installation Abu Dhabi', path: '/services/installation' },
          { label: 'Scaffolding dismantling UAE', path: '/services/installation-disassembly' },
          { label: 'Industrial scaffolding Abu Dhabi', path: '/construction-scaffolding-uae' },
          { label: 'Aluminium scaffolding Musaffah', path: '/scaffolding-rental-musaffah' },
          { label: 'Scaffolding company Abu Dhabi', path: '/about-us' },
        ],
      },
    ],
  },

  '/about-us': {
    title: 'Scaffolding Company Abu Dhabi | Alcoa Aluminium',
    description:
      'Alcoa Aluminium Scaffolding LLC — ISO 9001:2015 scaffolding company Abu Dhabi, based in Musaffah 37. Manufacturer, supplier, rental & erection across the UAE.',
    h1: 'Scaffolding Company Abu Dhabi — Alcoa Aluminium Scaffolding',
    primaryKeyword: 'Scaffolding Company Abu Dhabi',
    money: true,
    quickAnswer: `Alcoa Aluminium Scaffolding L.L.C - S.P.C is a scaffolding company in Abu Dhabi, based at ${STREET_ADDRESS_SHORT}, Musaffah. It manufactures, supplies, rents, erects and dismantles aluminium and steel scaffolding and ladders under ${ISO_CERT.standard} (certificate ${ISO_CERT.number}), serving Abu Dhabi, Dubai and the wider UAE.`,
    faq: ABOUT_FAQ,
    sections: [
      {
        h2: 'What Alcoa does',
        bullets: [
          'Aluminium scaffolding and mobile scaffold towers — rent or buy',
          'Steel cuplock scaffolding systems and components',
          'Aluminium and fiberglass ladders',
          'Scaffolding installation, dismantling, inspection and manpower',
        ],
      },
    ],
  },

  '/contact-us': {
    title: 'Contact Alcoa Scaffolding | Abu Dhabi +971 58 137 5601',
    description:
      'Contact Alcoa Scaffolding in Musaffah 37, Abu Dhabi UAE. Call, WhatsApp, or visit our warehouse for a free scaffolding quote during business hours.',
    h1: 'Contact Alcoa Scaffolding — Musaffah, Abu Dhabi',
    quickAnswer: `Call or WhatsApp ${PHONE_PRIMARY}, email ${EMAIL_SALES}, or visit ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi (${OPENING_HOURS_SUMMARY}). Share your site location, equipment, height and hire duration for a free quote.`,
    faq: CONTACT_FAQ,
    alternates: { ar: '/ar/contact-us' },
  },

  '/construction-scaffolding-uae': {
    title: 'Industrial Scaffolding Abu Dhabi | Construction UAE | Alcoa',
    description:
      'Industrial scaffolding Abu Dhabi & construction scaffolding UAE — cuplock, aluminium towers, installation and dismantling crews from Musaffah 37. Free quote.',
    h1: 'Industrial Scaffolding Abu Dhabi & Construction Scaffolding UAE',
    primaryKeyword: 'Industrial Scaffolding Abu Dhabi',
    money: true,
    quickAnswer:
      'Alcoa supplies industrial and construction scaffolding in Abu Dhabi and the UAE: steel cuplock for heavy decks and plant shutdowns, aluminium mobile towers for MEP and maintenance, plus installation and dismantling crews and inspection support — all dispatched from Musaffah 37.',
    faq: INDUSTRIAL_FAQ,
    alternates: { ar: '/ar/services' },
    sections: [
      {
        h2: 'Industrial scaffolding in Abu Dhabi',
        paragraphs: [
          'Industrial sites in Musaffah, KIZAD, ICAD and plant areas need scaffolding that carries documented loads, is erected by competent crews and is inspected before use. Steel cuplock is the usual choice for heavy working decks, pipe racks and shutdown access, while aluminium towers cover lighter maintenance work.',
          'Alcoa combines equipment supply with erection, modification and dismantling crews and written inspection notes for your HSE file. Share the site, load class, height and duration for a project quote.',
        ],
        links: [
          { label: 'Steel cuplock scaffolding UAE', path: '/products/steel-cuplock-scaffolding' },
          { label: 'Scaffolding installation Abu Dhabi', path: '/services/installation' },
          { label: 'Scaffolding dismantling UAE', path: '/services/installation-disassembly' },
          { label: 'Scaffolding manpower supply', path: '/scaffolding-manpower-supply' },
          { label: 'Scaffolding rental KIZAD', path: '/scaffolding-rental-kizad' },
          { label: 'Oil & gas scaffolding guide', path: '/blog/industrial-scaffolding-oil-gas-abu-dhabi' },
        ],
      },
      {
        h2: 'Construction scaffolding services across the UAE',
        bullets: [
          'Scaffolding rental — daily, weekly and monthly',
          'Scaffolding for sale — aluminium and steel systems',
          'Installation, modification and dismantling',
          'Inspection visits with written reports',
          'Delivery from Musaffah 37 to Abu Dhabi, Dubai and other emirates',
        ],
      },
    ],
  },

  '/aluminum-scaffolding-abu-dhabi': {
    title: 'Scaffolding Products UAE | Towers, Ladders & Cuplock | Alcoa',
    description:
      'Scaffolding products UAE from Alcoa Musaffah 37 — aluminium towers, ladders, steel cuplock, couplers and scaffolding parts for rent or sale.',
    h1: 'Scaffolding Products UAE',
    primaryKeyword: 'Scaffolding Products UAE',
    quickAnswer:
      'Alcoa rents and sells four scaffolding product ranges from Musaffah 37, Abu Dhabi: aluminium scaffold towers, steel cuplock scaffolding, aluminium and fiberglass ladders, and couplers and clamps — delivered across the UAE.',
    alternates: { ar: '/ar/products' },
    sections: [
      {
        h2: 'Product categories',
        links: [
          { label: 'Aluminium scaffold towers', path: '/products/aluminium-scaffolding' },
          { label: 'Aluminium ladders', path: '/products/ladders' },
          { label: 'Steel cuplock scaffolding', path: '/products/steel-cuplock-scaffolding' },
          { label: 'Couplers & clamps', path: '/products/couplers' },
        ],
      },
    ],
  },

  '/projects': {
    title: 'Scaffolding Projects UAE | Project Gallery | Alcoa',
    description:
      'Scaffolding projects in Abu Dhabi and the UAE — commercial, residential, industrial and heritage access work supported by Alcoa from Musaffah 37.',
    h1: 'Scaffolding Project Gallery',
    noindex: PROJECT_DETAILS_NOINDEX,
  },

  '/safety': {
    title: 'Scaffolding Safety Standards UAE | Alcoa',
    description:
      'Alcoa scaffolding safety standards in the UAE — inspections, erection practice, training and ISO 9001:2015 processes for Abu Dhabi and Musaffah sites.',
    h1: 'Scaffolding Safety Standards',
    quickAnswer:
      'Alcoa supports safe scaffolding in the UAE with maintained equipment, trained erection and dismantling crews, inspections before use and after alterations, and ISO 9001:2015 certified processes. Site rules follow OSHAD (Abu Dhabi) and the manufacturer instructions.',
  },

  '/branches': {
    title: 'Alcoa Scaffolding Location & Service Areas UAE',
    description:
      'Alcoa Scaffolding location: one warehouse and office in Musaffah 37, Abu Dhabi, delivering to Dubai, Sharjah and all emirates. Walk-in Mon–Sat 8am–6pm.',
    h1: 'Our Location & Service Areas',
    quickAnswer: `Alcoa Aluminium Scaffolding has one office and warehouse: ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi (${OPENING_HOURS_SUMMARY}). It has no branches in other emirates and delivers to Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Al Ain from Musaffah.`,
  },

  '/blog': {
    title: 'Scaffolding Blog UAE | Guides, Pricing & Safety | Alcoa',
    description:
      'Scaffolding guides for Abu Dhabi and UAE contractors — rental pricing factors, aluminium vs steel, safety, installation and choosing the right system.',
    h1: 'Scaffolding Guides & Resources',
    quickAnswer:
      'Practical guides for UAE contractors from Alcoa Aluminium Scaffolding: aluminium vs steel, mobile tower benefits and setup, rental vs purchase, scaffolding types, safety guidelines, installation and dismantling, and rental pricing factors.',
  },
};

export const PROJECT_TITLES = {
  1: 'Abu Dhabi Marina Tower Restoration',
  2: 'Abu Dhabi Financial Center',
  3: 'Abu Dhabi Residential Tower',
  4: 'Abu Dhabi Refinery Maintenance',
  5: 'Abu Dhabi Heritage Mosque',
  6: 'Abu Dhabi Industrial Complex',
};

export const getProjectMeta = (id, projectTitle = PROJECT_TITLES[id]) => ({
  title: `${projectTitle} | Alcoa Project`,
  description: `${projectTitle} — scaffolding access delivered by Alcoa Aluminium Scaffolding in Abu Dhabi, UAE. Contact us for similar project scaffolding.`,
  h1: projectTitle,
});

export const getRouteMeta = (path) => ROUTE_META[path] || null;
