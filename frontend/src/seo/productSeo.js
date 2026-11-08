import { PHONE_PRIMARY, STREET_ADDRESS_SHORT } from '../data/businessFacts';

/** Product category pages: SEO meta, quick answer, visible FAQ and supporting sections. */
export const PRODUCT_SEO = {
  'aluminium-scaffolding': {
    title: 'Aluminium Scaffold Tower Abu Dhabi | Alcoa UAE',
    description:
      'Aluminium scaffold towers Abu Dhabi — mobile, folding & stairway systems for rent or sale from Musaffah 37. Browse the Alcoa aluminium range.',
    h1: 'Aluminium Scaffold Towers Abu Dhabi',
    primaryKeyword: 'Aluminium Scaffold Tower',
    money: true,
    quickAnswer: `Alcoa rents and sells aluminium scaffold towers in Abu Dhabi: single-width, double-width, folding, stairway, bridge, combination and cantilever configurations. Towers are lightweight, wheeled and fitted with guardrails and outriggers as specified, and ship from ${STREET_ADDRESS_SHORT}, Musaffah.`,
    faq: [
      {
        q: 'Who sells aluminium scaffold towers in Abu Dhabi?',
        a: `Alcoa Aluminium Scaffolding sells and rents aluminium scaffold towers from its Musaffah 37 warehouse. Call ${PHONE_PRIMARY} for a quote.`,
      },
      {
        q: 'Which aluminium tower do I need?',
        a: 'Single-width towers suit narrow corridors; double-width towers suit facades and two-person work; stairway towers give safer frequent access; folding towers suit teams that move between sites.',
      },
      {
        q: 'Do you deliver aluminium towers across the UAE?',
        a: 'Yes — Abu Dhabi, Dubai, Musaffah and the wider UAE, or collect from the warehouse Mon–Sat 8am–6pm.',
      },
    ],
  },
  ladders: {
    title: 'Aluminium Ladder Supplier Abu Dhabi & UAE | Alcoa',
    description:
      'Aluminium ladder supplier Abu Dhabi & UAE — A-type, straight, extension, platform and fiberglass ladders for rent and sale from Musaffah 37.',
    h1: 'Aluminium Ladder Supplier Abu Dhabi & UAE',
    primaryKeyword: 'Aluminium Ladder Supplier',
    money: true,
    quickAnswer: `Alcoa is an aluminium ladder supplier in Abu Dhabi serving the UAE, with A-type, straight, extension, multi-purpose and platform ladders plus non-conductive fiberglass ladders for electrical work. Rent or buy from ${STREET_ADDRESS_SHORT}, Musaffah.`,
    faq: [
      {
        q: 'Who sells aluminium ladders in Abu Dhabi?',
        a: `Alcoa Aluminium Scaffolding supplies aluminium and fiberglass ladders from Musaffah 37 for sale or hire. Call ${PHONE_PRIMARY}.`,
      },
      {
        q: 'Should I use an aluminium or fiberglass ladder?',
        a: 'Use fiberglass near live electrical equipment because it is non-conductive. Aluminium ladders are lighter and suit general construction and maintenance access.',
      },
      {
        q: 'Do you supply ladders in bulk across the UAE?',
        a: 'Yes. Bulk ladder orders for contractors and facility teams are quoted with delivery to Abu Dhabi, Dubai and the other emirates.',
      },
    ],
  },
  'steel-cuplock-scaffolding': {
    title: 'Steel Cuplock Scaffolding UAE | Rent & Buy | Alcoa',
    description:
      'Steel cuplock scaffolding UAE — standards, ledgers, transoms, jacks and planks for rent or sale from Musaffah 37, Abu Dhabi. Erection crews available.',
    h1: 'Steel Cuplock Scaffolding UAE',
    primaryKeyword: 'Steel Cuplock Scaffolding',
    money: true,
    quickAnswer: `Alcoa supplies steel cuplock scaffolding across the UAE for rent or sale — vertical standards, ledgers, intermediate transoms, base and U-head jacks, and steel or wooden planks — from ${STREET_ADDRESS_SHORT}, Musaffah, with optional erection and dismantling crews.`,
    sections: [
      {
        h2: 'What is cuplock scaffolding?',
        paragraphs: [
          'Cuplock is a modular steel scaffolding system. Vertical standards carry fixed bottom cups at regular intervals; ledger and transom blades sit in the cups and a sliding top cup locks up to four connections at one node with a hammer blow — no loose couplers at each joint.',
          'Because the nodes are fixed, cuplock goes up quickly, stays square and carries heavier loads than mobile aluminium towers, which is why it is common for high-rise perimeters, birdcage access and industrial shutdowns.',
        ],
      },
      {
        h2: 'Cuplock vs aluminium towers',
        bullets: [
          'Cuplock: heavier decks, large areas, long-duration and industrial work',
          'Aluminium towers: light, mobile access for MEP, painting and maintenance',
          'Many UAE sites use both — Alcoa can quote a mixed package from one warehouse',
        ],
        links: [
          { label: 'Aluminium vs steel scaffolding', path: '/blog/aluminium-vs-steel-scaffolding-uae' },
          { label: 'Cuplock components guide', path: '/blog/cuplock-scaffolding-components-guide' },
          { label: 'Industrial scaffolding Abu Dhabi', path: '/construction-scaffolding-uae' },
          { label: 'Scaffolding installation Abu Dhabi', path: '/services/installation' },
        ],
      },
    ],
    faq: [
      {
        q: 'Who supplies steel cuplock scaffolding in the UAE?',
        a: `Alcoa Aluminium Scaffolding supplies cuplock components for rent and sale from Musaffah 37, Abu Dhabi, with delivery across the UAE. Call ${PHONE_PRIMARY}.`,
      },
      {
        q: 'What are the main cuplock components?',
        a: 'Vertical standards, horizontal ledgers, intermediate transoms, base jacks, U-head jacks and planks, plus couplers and tube where tube-and-fitting sections are needed.',
      },
      {
        q: 'Can you erect cuplock scaffolding for us?',
        a: 'Yes. Erection, modification and dismantling crews can be supplied with the equipment; quoted per site.',
      },
      {
        q: 'Is cuplock better than aluminium scaffolding?',
        a: 'Neither is better everywhere. Cuplock suits heavy loads and large structures; aluminium towers suit light, mobile access. Choose based on load, height, duration and mobility.',
      },
    ],
  },
  couplers: {
    title: 'Scaffolding Couplers & Clamps UAE | Alcoa',
    description:
      'Scaffolding couplers and clamps UAE — double, swivel, putlog, sleeve, beam and board-retaining couplers for rent or sale from Musaffah 37.',
    h1: 'Scaffolding Couplers & Clamps UAE',
    primaryKeyword: 'Scaffolding Couplers',
    quickAnswer: `Alcoa supplies scaffolding couplers and clamps across the UAE — double (right-angle), swivel, putlog, sleeve, beam, board-retaining and toe-board clamps, plus pins and tie rods — for rent or sale from ${STREET_ADDRESS_SHORT}, Musaffah.`,
    faq: [
      {
        q: 'What is the difference between a double and a swivel coupler?',
        a: 'A double coupler joins two tubes at a fixed right angle; a swivel coupler joins them at any angle, typically for bracing.',
      },
      {
        q: 'Do you sell couplers in bulk?',
        a: 'Yes. Coupler and clamp orders are quoted per piece with bulk pricing on request and delivery across the UAE.',
      },
    ],
  },
};

export const getProductSeo = (productId, category) =>
  PRODUCT_SEO[productId] || {
    title: `${category.title} | Buy or Rent in UAE | Alcoa`,
    description: `Buy or rent ${category.category.toLowerCase()} in Abu Dhabi & Dubai UAE. Fast supply from Musaffah 37.`,
    h1: `${category.title} in Abu Dhabi, UAE`,
    faq: [],
  };
