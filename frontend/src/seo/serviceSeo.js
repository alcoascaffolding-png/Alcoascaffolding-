import { PHONE_PRIMARY, STREET_ADDRESS_SHORT, OPENING_HOURS_SUMMARY } from '../data/businessFacts';

/**
 * Per-service title / description / H1 / primary keyword.
 * Services not listed here fall back to a generic template in getServiceSeo().
 */
export const SERVICE_SEO = {
  rental: {
    title: 'Aluminium Scaffolding Rental Abu Dhabi | Alcoa',
    description:
      'Aluminium scaffolding rental Abu Dhabi — daily, weekly & monthly hire from Musaffah 37. Towers, cuplock & ladders with delivery. Free quote.',
    h1: 'Aluminium Scaffolding Rental Abu Dhabi',
    primaryKeyword: 'Aluminium Scaffolding Rental Abu Dhabi',
    money: true,
  },
  'folding-tower': {
    title: 'Mobile Scaffolding Tower Abu Dhabi & UAE | Alcoa',
    description:
      'Mobile scaffolding tower Abu Dhabi & UAE — folding aluminium towers for rent and sale from Musaffah 37, delivered across the emirates. Free quote.',
    h1: 'Mobile Scaffolding Tower Abu Dhabi & UAE',
    primaryKeyword: 'Mobile Scaffolding Tower',
    money: true,
  },
  'single-width-scaffolding': {
    title: 'Single Width Mobile Scaffold Tower Abu Dhabi | Alcoa',
    description:
      'Single width mobile scaffold tower for narrow corridors and fit-out in Abu Dhabi. Aluminium, wheeled, with outriggers. Rent or buy from Musaffah 37.',
    h1: 'Single Width Mobile Scaffold Tower Abu Dhabi',
    primaryKeyword: 'Single Width Mobile Scaffold Tower',
  },
  'double-width-scaffolding': {
    title: 'Double Width Mobile Scaffold Tower Abu Dhabi | Alcoa',
    description:
      'Double width mobile scaffold tower with a wider platform for facade and two-person work in Abu Dhabi. Rent or buy aluminium towers from Musaffah 37.',
    h1: 'Double Width Mobile Scaffold Tower Abu Dhabi',
    primaryKeyword: 'Double Width Mobile Scaffold Tower',
  },
  'stairway-scaffolding': {
    title: 'Stairway Scaffolding Abu Dhabi | Alcoa UAE',
    description:
      'Stairway scaffolding Abu Dhabi — aluminium stairway towers for hire & sale. Delivery from Musaffah 37 across UAE. Free quote.',
    h1: 'Stairway Scaffolding Abu Dhabi',
    primaryKeyword: 'Stairway Scaffolding Abu Dhabi',
    money: true,
  },
  'cantilever-scaffolding': {
    title: 'Cantilever Scaffolding Abu Dhabi | Alcoa UAE',
    description:
      'Cantilever scaffolding Abu Dhabi — platforms that project over obstructions where standards cannot stand below. Rent or buy from Musaffah 37.',
    h1: 'Cantilever Scaffolding Abu Dhabi',
    primaryKeyword: 'Cantilever Scaffolding Abu Dhabi',
    money: true,
  },
  'aluminium-rolling-platform': {
    title: 'Aluminium Rolling Platform Abu Dhabi | Alcoa',
    description:
      'Aluminium rolling platform Abu Dhabi — lightweight mobile platforms for rent & sale. UAE delivery from Musaffah 37.',
    h1: 'Aluminium Rolling Platform Abu Dhabi',
    primaryKeyword: 'Aluminium Rolling Platform Abu Dhabi',
    money: true,
  },
  'intermediate-transom': {
    title: 'Transom Scaffolding | Intermediate Transoms UAE | Alcoa',
    description:
      'Transom scaffolding components — intermediate transoms that support deck boards on cuplock bays. Rent or buy in Abu Dhabi and the UAE from Musaffah 37.',
    h1: 'Transom Scaffolding — Intermediate Transoms UAE',
    primaryKeyword: 'Transom Scaffolding',
  },
  'fiberglass-ladder': {
    title: 'Fiberglass Ladder for Electrical Work UAE | Alcoa',
    description:
      'Fiberglass ladders for electrical and MEP work in Abu Dhabi and the UAE — non-conductive A-type and straight ladders to rent or buy from Musaffah 37.',
    h1: 'Fiberglass Ladder for Rent & Sale in UAE',
  },
  'cuplock-standard': {
    title: 'Cuplock Standard (Vertical) Specs | Alcoa',
    description:
      'Cuplock standard (vertical) specifications — lengths, cup spacing and uses on steel cuplock scaffolding. Rent or buy from Alcoa Musaffah 37.',
    h1: 'Cuplock Standard (Vertical) — Specifications',
  },
  installation: {
    title: 'Scaffolding Installation Abu Dhabi | Erection | Alcoa',
    description:
      'Scaffolding installation Abu Dhabi — erection crews for aluminium towers and steel cuplock, with handover checks. Quoted per site from Musaffah 37.',
    h1: 'Scaffolding Installation Abu Dhabi',
    primaryKeyword: 'Scaffolding Installation Abu Dhabi',
    money: true,
  },
  'installation-disassembly': {
    title: 'Scaffolding Dismantling UAE | Erection & Removal | Alcoa',
    description:
      'Scaffolding dismantling UAE — safe pack-down, modification and removal of aluminium and cuplock scaffolding by Alcoa crews from Musaffah 37.',
    h1: 'Scaffolding Dismantling UAE — Erection & Safe Removal',
    primaryKeyword: 'Scaffolding Dismantling UAE',
    money: true,
  },
  inspections: {
    title: 'Scaffolding Safety Inspection Service | Alcoa UAE',
    description:
      'Scaffolding safety inspection service — pre-use, periodic and post-alteration checks with written notes for HSE files in Abu Dhabi and the UAE.',
    h1: 'Scaffolding Safety Inspection Service',
  },
};

export const SERVICE_QUICK_ANSWERS = {
  rental: `Alcoa rents aluminium scaffold towers, steel cuplock, ladders and accessories in Abu Dhabi on daily, weekly or monthly terms from its Musaffah 37 warehouse. Delivery covers Abu Dhabi, Dubai and the UAE, or collect from ${STREET_ADDRESS_SHORT}. Pricing is quoted per project — call ${PHONE_PRIMARY}.`,
  'folding-tower': `Alcoa rents and sells aluminium mobile scaffolding towers — folding, single-width and double-width — in Abu Dhabi and across the UAE. Towers are delivered from Musaffah 37 or collected from the warehouse; hire is daily, weekly or monthly with optional erection crews.`,
  installation: `Alcoa installs (erects) aluminium towers and steel cuplock scaffolding on Abu Dhabi and UAE sites with its own crews, followed by a handover check. Installation is quoted per site from height, deck area, access and duration.`,
  'installation-disassembly': `Alcoa dismantles, modifies and removes aluminium and steel cuplock scaffolding across the UAE. Crews pack down in a controlled sequence, load out equipment and leave the area clear; dismantling can be booked with or without Alcoa hire equipment.`,
  'stairway-scaffolding': `Stairway scaffolding is a tower with an internal staircase instead of ladders, giving safer access to upper platforms. Alcoa rents and sells aluminium stairway towers in Abu Dhabi from Musaffah 37.`,
  'cantilever-scaffolding': `Cantilever scaffolding projects the working platform out over an obstruction where standards cannot sit directly below. Alcoa supplies cantilever configurations for rent or sale in Abu Dhabi and Dubai from Musaffah 37.`,
  'aluminium-rolling-platform': `An aluminium rolling platform is a lightweight, wheeled work platform for short elevated tasks such as painting and maintenance. Alcoa rents and sells rolling platforms in Abu Dhabi from Musaffah 37.`,
  'single-width-scaffolding': `A single width mobile scaffold tower is a narrow aluminium tower on castors for corridors and tight spaces. Alcoa rents and sells single width towers in Abu Dhabi from Musaffah 37.`,
  'double-width-scaffolding': `A double width mobile scaffold tower has a wider platform so two people can work side by side on facades and ceilings. Alcoa rents and sells double width towers in Abu Dhabi from Musaffah 37.`,
  inspections: `Alcoa inspects scaffolding before first use, after alterations and periodically, and issues written notes for your site HSE file. Inspections can be booked with or without Alcoa equipment.`,
};

const hoursLine = `Mon–Sat business hours (${OPENING_HOURS_SUMMARY})`;

/** Service-specific FAQs for priority pages; others use the generic template in serviceRichContent. */
export const SERVICE_FAQ = {
  rental: [
    {
      q: 'Where can I rent aluminium scaffolding in Abu Dhabi?',
      a: `From Alcoa's warehouse at ${STREET_ADDRESS_SHORT}, Musaffah, or with delivery to your Abu Dhabi site. Call or WhatsApp ${PHONE_PRIMARY}.`,
    },
    {
      q: 'What are the rental periods for scaffolding?',
      a: 'Daily, weekly and monthly hire. Weekly and monthly terms usually lower the effective daily cost on longer programmes; ask for all three options on your quote.',
    },
    {
      q: 'Can I rent a mobile scaffolding tower for one day?',
      a: 'Yes, subject to availability. One-day hire is common for short maintenance and installation jobs.',
    },
    {
      q: 'Do you rent steel cuplock as well as aluminium towers?',
      a: 'Yes. Cuplock standards, ledgers, transoms, jacks and planks are available for hire alongside aluminium towers and ladders.',
    },
    {
      q: 'Is installation included in the rental price?',
      a: 'Equipment hire and installation are quoted as separate lines. You can hire equipment only, or add erection and dismantling crews.',
    },
  ],
  'folding-tower': [
    {
      q: 'Where can I rent a mobile scaffolding tower in Abu Dhabi?',
      a: `Alcoa rents mobile scaffolding towers from Musaffah 37 (${STREET_ADDRESS_SHORT}) with delivery across Abu Dhabi, or collection from the warehouse.`,
    },
    {
      q: 'Do you offer mobile scaffolding rental across the UAE?',
      a: 'Yes. Mobile scaffolding towers are delivered to Dubai, Sharjah and the other emirates from our Abu Dhabi warehouse; delivery lead time is confirmed on the quote.',
    },
    {
      q: 'What is the difference between a folding tower and a standard mobile tower?',
      a: 'A folding tower collapses into a compact unit for transport and quick setup; a standard (single- or double-width) tower is assembled from frames and braces and reaches greater heights.',
    },
    {
      q: 'Can I buy a mobile scaffolding tower instead of renting?',
      a: 'Yes. Mobile towers are available for sale. Purchase usually suits teams that need a tower regularly over many months.',
    },
    {
      q: 'Who should assemble a mobile tower?',
      a: 'Only trained, competent persons following the manufacturer instructions. Alcoa can supply an erection crew if your team is not trained.',
    },
  ],
  installation: [
    {
      q: 'Who installs scaffolding in Abu Dhabi?',
      a: `Alcoa provides scaffolding installation crews in Abu Dhabi from Musaffah 37 for aluminium towers and steel cuplock. Call ${PHONE_PRIMARY} to book a site visit.`,
    },
    {
      q: 'How is scaffolding installation priced?',
      a: 'Per site, based on scaffold type, height, deck area, access constraints and duration. A site visit or clear drawings help us quote accurately.',
    },
    {
      q: 'Do you install scaffolding you did not supply?',
      a: 'Ask our team. We normally install Alcoa-supplied equipment so components and documentation match.',
    },
    {
      q: 'Is there a check after installation?',
      a: 'Yes. Crews complete a handover check, and a separate inspection visit can be booked for your HSE records.',
    },
  ],
  'installation-disassembly': [
    {
      q: 'Who dismantles scaffolding in the UAE?',
      a: 'Alcoa provides scaffolding dismantling crews across Abu Dhabi, Dubai and the UAE, dispatched from Musaffah 37.',
    },
    {
      q: 'Why use professional scaffolding dismantling?',
      a: 'Dismantling is when many falls and dropped-object incidents occur. Trained crews follow a planned sequence, keep guardrails in place as long as possible and control the exclusion zone.',
    },
    {
      q: 'Can you modify scaffolding mid-project?',
      a: 'Yes. Crews can raise, lower or reconfigure lifts during the project, then dismantle at completion.',
    },
    {
      q: 'How is dismantling priced?',
      a: 'Per site, based on scaffold size, height, access and whether equipment is being returned to Alcoa or removed elsewhere.',
    },
  ],
  'stairway-scaffolding': [
    {
      q: 'What is stairway scaffolding used for?',
      a: 'For safer, frequent access between levels on construction and maintenance sites — workers climb stairs instead of internal ladders.',
    },
    {
      q: 'Can I rent stairway scaffolding in Abu Dhabi?',
      a: 'Yes. Aluminium stairway towers are available for hire or sale from Musaffah 37 with delivery across the UAE.',
    },
  ],
  'cantilever-scaffolding': [
    {
      q: 'What is cantilever scaffolding?',
      a: 'Cantilever scaffolding is a scaffold whose working platform extends out beyond its supported base, carried by braced or tied members, so work can be done above an area where standards cannot be placed on the ground.',
    },
    {
      q: 'When is cantilever scaffolding needed?',
      a: 'When the ground below the work area is blocked — for example by a canopy, roadway or plant — so the platform must extend out from a supported section.',
    },
    {
      q: 'Do you supply cantilever scaffolding in Abu Dhabi?',
      a: 'Yes, for rent and sale from Musaffah 37. Share the span, load and height for a recommendation and quote.',
    },
  ],
  'aluminium-rolling-platform': [
    {
      q: 'What is an aluminium rolling platform?',
      a: 'A lightweight mobile work platform on lockable castors, used for painting, fit-out and maintenance at modest heights.',
    },
    {
      q: 'Can I rent a rolling platform in Abu Dhabi?',
      a: 'Yes. Rolling platforms are available for daily, weekly or monthly hire or for purchase from Musaffah 37.',
    },
  ],
  'single-width-scaffolding': [
    {
      q: 'When should I use a single width tower?',
      a: 'In narrow corridors, stairwells and rooms where a double width tower will not fit. For facades or two-person work, choose double width.',
    },
    {
      q: 'Can I rent a single width tower in Abu Dhabi?',
      a: 'Yes. Single width aluminium towers are available for hire or sale from Musaffah 37.',
    },
  ],
  'double-width-scaffolding': [
    {
      q: 'What is a double width scaffold tower?',
      a: 'An aluminium mobile tower with a wider platform, giving room for two workers and materials, typically used on facades and ceilings.',
    },
    {
      q: 'Can I rent a double width tower in Abu Dhabi?',
      a: 'Yes. Double width aluminium towers are available for hire or sale from Musaffah 37.',
    },
  ],
  inspections: [
    {
      q: 'When should scaffolding be inspected?',
      a: 'Before first use, after any alteration, after events such as high winds, and at regular intervals set by your site rules.',
    },
    {
      q: 'Do you provide written inspection reports?',
      a: `Yes. Written inspection notes are provided for your HSE file. Book during ${hoursLine}.`,
    },
  ],
};

const COMPONENT_CATEGORIES = new Set(['Couplers', 'Steel Cuplock Scaffolding']);

const firstThatFits = (candidates, max) => candidates.find((c) => c.length <= max) || candidates[candidates.length - 1];

export const getServiceSeo = (serviceId, service) => {
  if (SERVICE_SEO[serviceId]) return SERVICE_SEO[serviceId];
  const name = service.title;
  // Component searches usually include "scaffolding" (e.g. "scaffolding ladder clamp").
  const prefixed =
    COMPONENT_CATEGORIES.has(service.category) && !/scaffold/i.test(name) ? `Scaffolding ${name}` : name;
  const title = firstThatFits(
    [`${prefixed} | Sale & Rent UAE | Alcoa`, `${name} | Sale & Rent UAE | Alcoa`, `${name} UAE | Alcoa`, name],
    60
  );
  const description = firstThatFits(
    [
      `${service.description} Rent or buy in Abu Dhabi and across the UAE from Alcoa, Musaffah 37.`,
      `${service.description} Rent or buy from Alcoa, Musaffah 37.`,
    ],
    160
  );
  return { title, description, h1: `${name} for Rent & Sale in UAE` };
};

export const getServiceQuickAnswer = (serviceId, service) =>
  SERVICE_QUICK_ANSWERS[serviceId] ||
  `${service.title} is available for rent and sale from Alcoa Aluminium Scaffolding in Musaffah 37, Abu Dhabi, with delivery across the UAE. ${service.description} Call ${PHONE_PRIMARY} for a free quote.`;

/** Extra keyword section shown on priority service pages (also rendered into static HTML). */
export const SERVICE_SECONDARY_SECTIONS = {
  'folding-tower': {
    h2: 'Mobile Scaffolding Rental in the UAE',
    body: 'Mobile scaffolding towers are delivered from our Musaffah 37 warehouse to Abu Dhabi, Dubai, Sharjah and the other emirates on daily, weekly or monthly hire. Choose folding towers for quick moves between sites, single-width towers for corridors and double-width towers for facades and two-person work.',
    links: [
      { label: 'Single width mobile scaffold tower', path: '/services/single-width-scaffolding' },
      { label: 'Double width mobile scaffold tower', path: '/services/double-width-scaffolding' },
      { label: 'Stairway scaffolding Abu Dhabi', path: '/services/stairway-scaffolding' },
      { label: 'Aluminium scaffolding rental Abu Dhabi', path: '/services/rental' },
      { label: 'Mobile tower setup guide', path: '/blog/mobile-scaffolding-tower-setup-guide' },
      { label: 'Benefits of mobile scaffolding towers', path: '/blog/benefits-of-mobile-scaffolding-towers' },
    ],
  },
  rental: {
    h2: 'What you can rent from Musaffah 37',
    body: 'Aluminium mobile scaffold towers, stairway and cantilever configurations, rolling platforms, steel cuplock systems, ladders, couplers, jacks and planks. Combine hire with installation and dismantling crews when your site needs a full-service package.',
    links: [
      { label: 'Mobile scaffolding tower rental', path: '/services/folding-tower' },
      { label: 'Steel cuplock scaffolding UAE', path: '/products/steel-cuplock-scaffolding' },
      { label: 'Scaffolding rental Abu Dhabi', path: '/scaffolding-rental-abu-dhabi' },
      { label: 'Scaffolding rental Dubai', path: '/scaffolding-rental-dubai' },
      { label: 'Rental vs buying scaffolding', path: '/blog/scaffolding-rental-vs-purchase-uae' },
    ],
  },
  installation: {
    h2: 'Scaffolding erection for construction and industrial sites',
    body: 'Crews erect aluminium mobile towers, stairway towers and steel cuplock scaffolding for construction, facade, MEP and industrial maintenance work in Abu Dhabi, Musaffah, KIZAD and across the UAE. Work follows the manufacturer instructions and your site permit and HSE requirements.',
    links: [
      { label: 'Scaffolding dismantling UAE', path: '/services/installation-disassembly' },
      { label: 'Scaffolding manpower supply', path: '/scaffolding-manpower-supply' },
      { label: 'Industrial scaffolding Abu Dhabi', path: '/construction-scaffolding-uae' },
      { label: 'Why professional installation matters', path: '/blog/professional-scaffolding-installation-dismantling-uae' },
    ],
  },
  'cantilever-scaffolding': {
    h2: 'What is cantilever scaffolding?',
    body: 'Cantilever scaffolding carries a working platform out beyond its supported base. It is used where standards cannot stand directly below the work — over canopies, entrances, roads, roofs, plant or atrium voids. The projecting section is supported by braced, tied or counterweighted members designed for the load. Alcoa supplies aluminium cantilever configurations for rent or sale from Musaffah 37, with erection crews on request.',
    links: [
      { label: 'Types of scaffolding systems', path: '/blog/types-of-scaffolding-uae-construction' },
      { label: 'Bridge scaffolding', path: '/services/bridge-scaffolding' },
      { label: 'Scaffolding installation Abu Dhabi', path: '/services/installation' },
      { label: 'Aluminium scaffold towers', path: '/products/aluminium-scaffolding' },
    ],
  },
  'installation-disassembly': {
    h2: 'Safe scaffolding dismantling and removal',
    body: 'Dismantling reverses the erection sequence from the top down, keeps guardrails in place as long as possible, lowers components instead of dropping them and controls the area below. Alcoa crews dismantle, sort and load out equipment for return or removal across Abu Dhabi, Dubai and the UAE.',
    links: [
      { label: 'Scaffolding installation Abu Dhabi', path: '/services/installation' },
      { label: 'Scaffolding manpower supply', path: '/scaffolding-manpower-supply' },
      { label: 'Why professional installation and dismantling matter', path: '/blog/professional-scaffolding-installation-dismantling-uae' },
    ],
  },
};
