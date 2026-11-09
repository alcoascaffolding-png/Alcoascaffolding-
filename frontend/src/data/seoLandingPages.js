import {
  PHONE_PRIMARY,
  STREET_ADDRESS,
  STREET_ADDRESS_SHORT,
  OPENING_HOURS_SUMMARY,
  ISO_CERT,
  MAPS_SEARCH_URL,
  FULL_ADDRESS,
} from './businessFacts';

/**
 * High-impact SEO landing pages from the July 2026 guide.
 * Pricing kept quote-based until ops confirms AED tables.
 */
export const seoLandingPages = {
  dubai: {
    slug: 'scaffolding-rental-dubai',
    title: 'Scaffolding Rental Dubai | Aluminium & Cuplock | Alcoa',
    h1: 'Scaffolding Rental Dubai, UAE',
    primaryKeyword: 'Scaffolding Rental Dubai',
    money: true,
    areaServed: ['Dubai', 'United Arab Emirates'],
    quickAnswer:
      'Alcoa provides scaffolding rental in Dubai — aluminium mobile towers, steel cuplock and ladders — delivered from its warehouse in Musaffah 37, Abu Dhabi. Alcoa has no Dubai depot; Dubai orders are quoted with delivery to Al Quoz, Jebel Ali, Deira, Business Bay and villa communities.',
    description:
      'Scaffolding rental Dubai — aluminium towers, cuplock & ladders delivered to Al Quoz, Jebel Ali, Deira & villas from Musaffah 37. Erection crews available.',
    keywords:
      'scaffolding rental dubai, aluminium scaffolding dubai, scaffolding company dubai, scaffolding supplier dubai, scaffold hire al quoz dubai, scaffolding jebel ali dubai, mobile scaffold tower rental dubai',
    intro: `Alcoa Aluminium Scaffolding supplies scaffolding rental to Dubai contractors, facility managers, and villa renovation teams from our Musaffah 37 warehouse in Abu Dhabi. Whether you need aluminium mobile towers for painting and MEP, steel cuplock for industrial access, or ladders for short-duration work, we quote clear AED hire terms and arrange delivery into Dubai zones including Al Quoz, Jebel Ali, Deira, Business Bay, and surrounding districts.`,
    sections: [
      {
        h2: 'Why Dubai projects hire Alcoa from Musaffah 37',
        paragraphs: [
          `Dubai construction and fit-out schedules rarely wait for equipment. Alcoa keeps aluminium towers, cuplock components, couplers, and ladders in stock at ${STREET_ADDRESS_SHORT}, Abu Dhabi — a practical logistics base for Dubai deliveries without maintaining a second depot. You get ISO ${ISO_CERT.standard} process discipline (${ISO_CERT.number}) covering manufacturing, supply, erection, dismantling, rental and maintenance of aluminium and steel scaffolding and ladders.`,
          'Share your Dubai site pin, preferred tower height, quantity, and hire duration on WhatsApp or our contact form. We return a written quote covering equipment, delivery, and optional erection crews. Weekly and monthly hire are available when projects run beyond a few days.',
        ],
      },
      {
        h2: 'Dubai service areas we regularly support',
        paragraphs: [
          'Our Dubai coverage focuses on construction, industrial, and residential access needs:',
        ],
        bullets: [
          'Al Quoz and Al Quoz Industrial — workshops, fit-out, and contractor yards',
          'Jebel Ali and surrounding industrial logistics zones',
          'Deira, Bur Dubai, and older commercial corridors needing facade or MEP access',
          'Business Bay and Downtown-adjacent renovation and maintenance',
          'Villa communities across Dubai for painting, waterproofing, and renovation scaffolding',
        ],
      },
      {
        h2: 'Scaffolding rental in Al Quoz and Jebel Ali',
        paragraphs: [
          'Al Quoz and Al Quoz Industrial are among the most frequent Dubai delivery areas for scaffolding hire — workshops, warehouse fit-outs, showroom refurbishments and contractor yards typically need aluminium mobile towers, rolling platforms and ladders for short access jobs, plus cuplock for larger internal decks.',
          'For Jebel Ali and the surrounding industrial and logistics zones, plan deliveries around gate passes, delivery-vehicle entry rules and unloading times. Send the site location, contact person, access requirements and the equipment list with your enquiry so the delivery slot can be confirmed with the quote.',
        ],
        links: [
          { label: 'Mobile scaffolding towers', path: '/services/folding-tower' },
          { label: 'Aluminium rolling platform', path: '/services/aluminium-rolling-platform' },
          { label: 'Steel cuplock scaffolding UAE', path: '/products/steel-cuplock-scaffolding' },
          { label: 'Scaffolding installation', path: '/services/installation' },
        ],
      },
      {
        h2: 'Equipment available for Dubai hire',
        paragraphs: [
          'Popular Dubai rental combinations include single- and double-width aluminium towers, stairway towers, folding/mobile towers, aluminium rolling platforms, steel cuplock standards and ledgers, prop jacks, and right-angle or swivel couplers. Ladder hire (aluminium A-type and fiberglass) is available for electrical and light access work.',
        ],
        links: [
          { label: 'Aluminium scaffolding', path: '/products/aluminium-scaffolding' },
          { label: 'Cantilever scaffolding', path: '/services/cantilever-scaffolding' },
          { label: 'Scaffolding rental hub', path: '/services/rental' },
          { label: 'Scaffolding for sale', path: '/scaffolding-for-sale' },
        ],
      },
      {
        h2: 'Pricing approach for Dubai scaffolding rental',
        paragraphs: [
          'We do not publish a one-size price online because Dubai jobs vary by height, load, delivery window, and whether erection is included. Instead we provide a free project quote in AED with daily, weekly, or monthly options. Tell us if you need scaffolding with delivery only, or scaffolding with erection and dismantling.',
          `Call ${PHONE_PRIMARY} or request a quote online. Business hours: ${OPENING_HOURS_SUMMARY}.`,
        ],
      },
    ],
    zones: [
      'Al Quoz & Al Quoz Industrial',
      'Jebel Ali',
      'Deira & Bur Dubai',
      'Business Bay',
      'Villa communities across Dubai',
    ],
    mapEmbed: true,
    faq: [
      {
        q: 'Do you deliver scaffolding rental to Dubai?',
        a: 'Yes. Alcoa delivers scaffolding to Dubai from Musaffah 37, Abu Dhabi. Delivery timing depends on stock and site access — confirm when you request a quote.',
      },
      {
        q: 'Do you deliver scaffolding rental to Al Quoz?',
        a: 'Yes. Al Quoz and Al Quoz Industrial are regular delivery areas from our Musaffah 37 warehouse. Share your site location and access times when you request a quote.',
      },
      {
        q: 'Can you supply scaffolding to Jebel Ali sites with gate-pass rules?',
        a: 'Yes. Send the site contact, gate-pass and vehicle-entry requirements with your order so the delivery can be planned to the site rules.',
      },
      {
        q: 'Do you provide scaffolding erection in Dubai?',
        a: 'Yes. Erection and dismantling crews can be arranged for Dubai sites together with equipment delivery from Musaffah 37.',
      },
      {
        q: 'Can I hire scaffolding for villa painting in Dubai?',
        a: 'Yes. Aluminium mobile towers and rolling platforms are commonly hired for villa painting and renovation. Share storeys/height and duration for a tailored quote.',
      },
      {
        q: 'Do you supply mobile scaffold tower rental in Dubai?',
        a: 'Yes — folding and mobile aluminium towers are available for Dubai hire with delivery from our Abu Dhabi warehouse.',
      },
      {
        q: 'Is scaffolding for sale available as well as rental?',
        a: 'Yes. See our scaffolding for sale page for new equipment options, or ask about project-length hire versus purchase.',
      },
    ],
  },

  'for-sale': {
    slug: 'scaffolding-for-sale',
    title: 'Scaffolding for Sale UAE | Buy Aluminium & Cuplock | Alcoa',
    h1: 'Scaffolding for Sale UAE — Buy in Abu Dhabi',
    description:
      'Scaffolding for sale UAE — buy aluminium towers, steel cuplock & ladders from Alcoa Musaffah 37, Abu Dhabi. Request a sales quote.',
    primaryKeyword: 'Scaffolding for Sale',
    money: true,
    quickAnswer:
      'Alcoa sells scaffolding in the UAE from its Musaffah 37 warehouse in Abu Dhabi: aluminium mobile towers, steel cuplock systems, aluminium and fiberglass ladders, couplers, jacks and planks. Send your item list and delivery address for a sales quote.',
    keywords:
      'buy aluminium scaffolding abu dhabi, scaffolding for sale uae, aluminium scaffolding supplier uae, scaffolding supplier abu dhabi',
    intro: `Looking to buy scaffolding in the UAE instead of long-term hire? Alcoa Aluminium Scaffolding sells aluminium mobile towers, steel cuplock systems, ladders, couplers, prop jacks, and related accessories from our Musaffah 37 warehouse in Abu Dhabi. Purchase suits contractors with repeating access needs; hire still makes sense for short projects — we help you compare both.`,
    sections: [
      {
        h2: 'What you can buy from Alcoa',
        bullets: [
          'Aluminium scaffolding towers — single width, double width, stairway, folding, bridgeway',
          'Steel cuplock standards, ledgers, transoms, and bay components',
          'Aluminium and fiberglass ladders (A-type, straight, extension)',
          'Couplers & clamps — double, swivel, putlog, sleeve, universal',
          'Prop jacks, base jacks, wooden and steel planks, lattice beams',
        ],
      },
      {
        h2: 'New stock and condition standards',
        paragraphs: [
          'Sales inventory is supplied for professional construction use. Ask our team about current stock, specifications, and any project documentation you need for procurement. If you are evaluating budget options such as used or second-hand scaffolding, tell us your load and height requirements — we will advise what we can supply from current stock or recommend hire as a safer interim solution.',
        ],
      },
      {
        h2: 'How to request a sales quote',
        paragraphs: [
          `Email sales@alcoascaffolding.com or call ${PHONE_PRIMARY} with item list, quantities, and delivery address (Abu Dhabi, Dubai, or other emirates). Warehouse collection at ${STREET_ADDRESS} is available during ${OPENING_HOURS_SUMMARY}.`,
        ],
        links: [
          { label: 'Contact sales', path: '/contact-us' },
          { label: 'Product categories', path: '/aluminum-scaffolding-abu-dhabi' },
          { label: 'Scaffolding rental', path: '/services/rental' },
        ],
      },
    ],
    zones: ['Abu Dhabi', 'Musaffah 37', 'Dubai', 'Sharjah & Northern Emirates'],
    mapEmbed: true,
    showEnquiry: true,
    faq: [
      {
        q: 'Do you sell scaffolding for sale in UAE and Dubai?',
        a: 'Yes. Alcoa sells aluminium and steel scaffolding systems and accessories across the UAE, with sales support from Musaffah 37, Abu Dhabi.',
      },
      {
        q: 'Can I buy used or second-hand scaffolding in Abu Dhabi?',
        a: 'Ask our sales team about current stock. Availability of used equipment varies — we will only recommend items suitable for your stated application.',
      },
      {
        q: 'Is it cheaper to rent or buy scaffolding in UAE?',
        a: 'Short projects usually favour rental; repeating weekly access often favours purchase. Share your annual usage days and we will help you compare.',
      },
    ],
  },

  'rental-uae': {
    slug: 'scaffolding-rental-uae',
    title: 'Aluminium Scaffolding UAE | Supplier & Rental | Alcoa',
    h1: 'Aluminium Scaffolding UAE — Supplier & Rental',
    description:
      'Aluminium scaffolding UAE — scaffolding supplier for rental, sale and mobile towers from Musaffah 37, Abu Dhabi, delivering to every emirate. Free quote.',
    primaryKeyword: 'Aluminium Scaffolding UAE',
    money: true,
    quickAnswer:
      'Alcoa is an aluminium scaffolding supplier for the whole UAE, operating from one warehouse in Musaffah 37, Abu Dhabi. It rents and sells aluminium towers, steel cuplock and ladders and delivers to Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Al Ain.',
    keywords:
      'aluminium scaffolding UAE, aluminium scaffolding supplier UAE, aluminium scaffolding rental UAE, mobile scaffolding UAE, scaffolding company uae, scaffolding rental sharjah',
    intro: `Alcoa Aluminium Scaffolding supplies aluminium scaffolding across the United Arab Emirates from our Musaffah 37 headquarters in Abu Dhabi. One supplier can cover aluminium towers, steel cuplock, ladders, and erection support for projects in every emirate — with quotes tailored to delivery distance and duration.`,
    sections: [
      {
        h2: 'Scaffolding supplier UAE — one supplier for every emirate',
        paragraphs: [
          'Buying from one scaffolding supplier keeps equipment, documentation and invoicing consistent across sites. Alcoa supplies aluminium mobile towers, stairway and cantilever configurations, rolling platforms, steel cuplock, ladders and couplers for rent or sale, with erection and dismantling crews when needed.',
        ],
        links: [
          { label: 'Mobile scaffolding towers', path: '/services/folding-tower' },
          { label: 'Steel cuplock scaffolding UAE', path: '/products/steel-cuplock-scaffolding' },
          { label: 'Aluminium ladder supplier', path: '/products/ladders' },
          { label: 'Aluminium scaffolding manufacturer UAE', path: '/aluminium-scaffolding-manufacturer-uae' },
        ],
      },
      {
        h2: 'Emirates coverage overview',
        bullets: [
          'Abu Dhabi & Musaffah — headquarters warehouse, fastest pickup and delivery',
          'Dubai — Al Quoz, Jebel Ali, Deira, Business Bay, villa communities',
          'Sharjah — scaffolding rental and supplier support for industrial and commercial sites',
          'Ajman — hire aluminium scaffolding and related access equipment',
          'Ras Al Khaimah (RAK) — scaffold hire coordinated from Musaffah stock',
          'Al Ain — scaffolding company support for construction and maintenance',
          'Fujairah — scaffolding rental for coastal and industrial projects',
        ],
      },
      {
        h2: 'Choose the right landing page for your city',
        links: [
          { label: 'Abu Dhabi rental', path: '/scaffolding-rental-abu-dhabi' },
          { label: 'Musaffah warehouse', path: '/scaffolding-rental-musaffah' },
          { label: 'Dubai rental', path: '/scaffolding-rental-dubai' },
          { label: 'KIZAD industrial', path: '/scaffolding-rental-kizad' },
          { label: 'Yas Island hire', path: '/scaffolding-hire-yas-island' },
          { label: 'Near me guide', path: '/scaffolding-near-me-uae' },
        ],
      },
      {
        h2: 'Rental types and related services',
        paragraphs: [
          'Daily, weekly, and monthly hire are available. Add erection, dismantling, inspection, or manpower when your site requires a full-service package.',
        ],
        links: [
          { label: 'Rental service', path: '/services/rental' },
          { label: 'Inspection UAE', path: '/scaffolding-inspection-uae' },
          { label: 'Manpower supply', path: '/scaffolding-manpower-supply' },
        ],
      },
    ],
    zones: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'RAK', 'Al Ain', 'Fujairah'],
    mapEmbed: true,
    faq: [
      {
        q: 'Who is a scaffolding supplier covering the whole UAE?',
        a: 'Alcoa Aluminium Scaffolding supplies aluminium and steel scaffolding to all emirates from its Musaffah 37 warehouse in Abu Dhabi, for rent or sale, with delivery quoted per location.',
      },
      {
        q: 'Do you offer scaffolding rental in Sharjah and Ajman?',
        a: 'Yes. We support Sharjah and Ajman projects with equipment from Musaffah 37. Delivery schedules depend on quantity and access.',
      },
      {
        q: 'Can I get scaffolding hire in Ras Al Khaimah or Fujairah?',
        a: 'Yes — Northern Emirates projects are quoted with delivery lead times from our Abu Dhabi warehouse.',
      },
    ],
  },

  faq: {
    slug: 'faq',
    title: 'Scaffolding FAQ UAE | Prices, Delivery & Hire | Alcoa',
    h1: 'Scaffolding FAQ UAE — Rental, Delivery & Safety',
    description:
      'Scaffolding FAQ UAE: rental cost factors, delivery, 1-day hire, OSHAD basics, aluminium vs steel and how to book Alcoa from Musaffah 37.',
    primaryKeyword: 'Scaffolding FAQ UAE',
    quickAnswer:
      'Scaffolding rental in the UAE is quoted per project from equipment type, height, quantity, hire period and delivery zone. Alcoa rents and sells from Musaffah 37, Abu Dhabi, delivers across the emirates, and offers one-day, weekly and monthly hire.',
    keywords:
      'scaffolding rental price abu dhabi, how much does scaffolding rental cost in uae, can i rent scaffolding for 1 day in uae, scaffolding delivery musaffah, OSHAD scaffolding',
    intro: `Direct answers for contractors and facility teams researching scaffolding hire in the UAE. Pricing is quoted per project until a public price list is confirmed — contact us for current AED rates.`,
    sections: [
      {
        h2: 'How to get an accurate quote',
        paragraphs: [
          `Provide location, equipment type, height, quantity, duration, and whether you need erection. Call ${PHONE_PRIMARY} or use the contact form. Warehouse: ${FULL_ADDRESS}. Hours: ${OPENING_HOURS_SUMMARY}.`,
        ],
      },
    ],
    zones: [],
    mapEmbed: false,
    faq: [
      {
        q: 'How much does scaffolding rental cost in Abu Dhabi?',
        a: `Cost depends on tower type, height, quantity, and hire period. Alcoa provides free AED quotes from Musaffah 37 — call ${PHONE_PRIMARY}.`,
      },
      {
        q: 'How much does scaffolding rental cost in UAE per day or per month?',
        a: 'Daily, weekly, and monthly packages are available. Monthly hire usually lowers the effective daily rate. Request a written quote for your equipment list.',
      },
      {
        q: 'Where can I rent scaffolding in Musaffah?',
        a: `Alcoa Aluminium Scaffolding is at ${STREET_ADDRESS}. Pickup during business hours or arrange delivery. Map: ${MAPS_SEARCH_URL}`,
      },
      {
        q: 'Does Alcoa deliver scaffolding to Dubai?',
        a: 'Yes. We deliver to Dubai and other emirates from Musaffah 37. Confirm timing when booking.',
      },
      {
        q: 'Can I rent scaffolding for just 1 day in UAE?',
        a: 'Yes, subject to availability. One-day hire is common for short access jobs; confirm minimums on your quote.',
      },
      {
        q: 'What types of scaffolding does Alcoa supply?',
        a: 'Aluminium mobile towers, cantilever, stairway, folding towers, rolling platforms, steel cuplock, ladders, couplers, prop jacks, and planks — rent or sale.',
      },
      {
        q: 'Is aluminium scaffolding suitable for industrial projects?',
        a: 'Aluminium towers suit many MEP, maintenance, and light industrial tasks. Heavy industrial or high-load designs often use steel cuplock — our team will recommend based on load and height.',
      },
      {
        q: 'What are OSHAD scaffolding safety expectations in Abu Dhabi?',
        a: 'Abu Dhabi projects typically require competent erection, suitable equipment, edge protection, and inspection records under local EHSMS/OSHAD-aligned practice. Alcoa can support erection and inspection documentation on request.',
      },
      {
        q: 'Do scaffolding companies in UAE provide delivery?',
        a: 'Alcoa does — delivery from Musaffah 37 across Abu Dhabi, Dubai, and other emirates, or warehouse collection.',
      },
      {
        q: 'How quickly can scaffolding be delivered in Abu Dhabi?',
        a: 'Lead time depends on stock and destination. Many Abu Dhabi and Musaffah orders are arranged for fast dispatch during business hours — confirm when you order.',
      },
      {
        q: 'Is Alcoa ISO certified?',
        a: `Yes — ${ISO_CERT.standard}, certificate ${ISO_CERT.number}, issued by ${ISO_CERT.issuer}.`,
      },
      {
        q: 'How do I book scaffolding with Alcoa?',
        a: `Call or WhatsApp ${PHONE_PRIMARY}, email sales@alcoascaffolding.com, or use the website contact form with your site details.`,
      },
    ],
  },

  inspection: {
    slug: 'scaffolding-inspection-uae',
    title: 'Scaffolding Inspection Abu Dhabi | UAE | Alcoa',
    h1: 'Scaffolding Inspection Abu Dhabi & UAE',
    primaryKeyword: 'Scaffolding Inspection Abu Dhabi',
    money: true,
    quickAnswer:
      'Alcoa carries out scaffolding inspections in Abu Dhabi and the UAE — before first use, after alterations and periodically — and issues written notes for site HSE files. Inspections can be combined with erection or booked on their own.',
    description:
      'Scaffolding inspection Abu Dhabi — pre-use, periodic & post-alteration checks with written reports. ISO 9001:2015 supplier. Call Alcoa.',
    keywords:
      'scaffolding inspection abu dhabi, certified scaffolding inspection uae, scaffolding safety inspection, OSHAD scaffolding inspection',
    intro: `Alcoa provides scaffolding inspection support for Abu Dhabi and UAE contractors who need structured checks before use, after alterations, or on a periodic schedule. Inspections complement our rental, sale, and erection services and help sites keep clearer HSE records.`,
    sections: [
      {
        h2: 'What our inspection visits typically cover',
        bullets: [
          'Base plates, sole boards, and ground conditions',
          'Standards, ledgers, transoms, and bracing integrity',
          'Working platforms, boards, and trapdoor arrangements',
          'Guardrails, mid-rails, and toe boards',
          'Access stairs/ladders and signage where applicable',
          'Written notes suitable for site HSE files',
        ],
      },
      {
        h2: 'OSHAD / Abu Dhabi EHSMS alignment',
        paragraphs: [
          'Abu Dhabi projects commonly expect competent persons, suitable equipment, and documented inspections under local EHSMS practice (historically referenced alongside OSHAD frameworks). We help contractors demonstrate that scaffolds were checked at appropriate stages — without replacing your site’s legal duties.',
        ],
        links: [
          { label: 'Safety inspections service', path: '/services/inspections' },
          { label: 'Safety standards page', path: '/safety' },
          { label: 'Blog: UAE scaffolding safety', path: '/blog/uae-scaffolding-safety-regulations' },
        ],
      },
    ],
    zones: ['Abu Dhabi', 'Musaffah', 'KIZAD', 'Dubai'],
    mapEmbed: false,
    faq: [
      {
        q: 'Do you provide certified scaffolding inspection in UAE?',
        a: 'We provide scaffolding inspection visits with written reports for contractor HSE records. Ask about inspector competency documentation for your site requirements.',
      },
      {
        q: 'Can inspection be combined with erection?',
        a: 'Yes. Many clients book erection plus handover inspection as a package.',
      },
    ],
  },

  manpower: {
    slug: 'scaffolding-manpower-supply',
    title: 'Scaffolding Manpower Supply Abu Dhabi | Scaffolders | Alcoa',
    h1: 'Scaffolding Manpower Supply Abu Dhabi & UAE',
    primaryKeyword: 'Scaffolding Manpower Supply',
    money: true,
    quickAnswer:
      'Alcoa supplies scaffolding manpower in Abu Dhabi and the UAE — trained scaffolders for erection, modification and dismantling of aluminium towers and steel cuplock — coordinated with equipment from Musaffah 37. Share site, scaffold type, height, shifts and duration for a crew quote.',
    description:
      'Scaffolding manpower supply Abu Dhabi — trained scaffolders for erection and dismantling of aluminium and cuplock scaffolding. Request a crew quote.',
    keywords:
      'scaffolding manpower supply abu dhabi, scaffolding with operator uae, scaffolding erection service dubai, certified scaffolders abu dhabi',
    intro: `Need scaffolding with a crew, not only equipment? Alcoa arranges scaffolding manpower for erection and dismantling on Abu Dhabi and UAE sites — aluminium towers and steel cuplock systems — coordinated with equipment from Musaffah 37.`,
    sections: [
      {
        h2: 'Crew services',
        bullets: [
          'Scaffolding erection and installation',
          'Mid-project modifications',
          'Dismantling and load-out',
          'Coordination with site HSE induction requirements',
          'Optional inspection support at handover',
        ],
      },
      {
        h2: 'How to request manpower',
        paragraphs: [
          `Share site location, scaffold type, height/area, shift timing, and duration. Call ${PHONE_PRIMARY} or use the contact form. ISO ${ISO_CERT.standard} company processes cover erection and dismantling within our certified scope.`,
        ],
        links: [
          { label: 'Installation service', path: '/services/installation' },
          { label: 'Installation / disassembly', path: '/services/installation-disassembly' },
          { label: 'Contact Alcoa', path: '/contact-us' },
        ],
      },
    ],
    zones: ['Abu Dhabi', 'Musaffah', 'Dubai', 'KIZAD'],
    mapEmbed: false,
    showEnquiry: true,
    faq: [
      {
        q: 'Do you provide scaffolding with operator in UAE?',
        a: 'We supply erection and dismantling crews alongside equipment hire. Confirm crew size and skills required for your scaffold type.',
      },
      {
        q: 'Can you erect scaffolding in Dubai?',
        a: 'Yes — erection services can be arranged for Dubai sites together with equipment delivery from Musaffah 37.',
      },
    ],
  },

  supplier: {
    slug: 'aluminium-scaffolding-supplier-abu-dhabi',
    title: 'Aluminium Scaffolding Supplier Abu Dhabi | Alcoa',
    h1: 'Aluminium Scaffolding Supplier Abu Dhabi',
    primaryKeyword: 'Aluminium Scaffolding Supplier Abu Dhabi',
    money: true,
    quickAnswer:
      'Alcoa Aluminium Scaffolding L.L.C - S.P.C is an aluminium scaffolding supplier in Abu Dhabi, based at Ar Rahmah 4 St., Musaffah 37. It supplies mobile towers, ladders, rolling platforms and cuplock components for purchase or hire, with delivery across Abu Dhabi and the UAE. ISO 9001:2015 certified.',
    description:
      'Aluminium scaffolding supplier Abu Dhabi — towers, ladders & access equipment from Musaffah 37. Rent or buy. ISO 9001:2015. Free quote.',
    keywords:
      'aluminium scaffolding supplier Abu Dhabi, scaffolding supplier Abu Dhabi, aluminium scaffolding supplier Musaffah, scaffolding equipment supplier Abu Dhabi, scaffolding supplier UAE',
    intro: `Alcoa Aluminium Scaffolding L.L.C - S.P.C is an aluminium scaffolding supplier based at Ar Rahmah 4 St., Musaffah 37, Abu Dhabi. Contractors and facility teams source mobile towers, ladders, cuplock components, and accessories for purchase or hire — with delivery across Abu Dhabi and the UAE.`,
    sections: [
      {
        h2: 'What we supply',
        bullets: [
          'Aluminium mobile scaffold towers — single width, double width, folding, stairway',
          'Aluminium and fiberglass ladders',
          'Rolling platforms and cantilever configurations',
          'Steel cuplock systems, couplers, jacks and planks',
          'Optional erection, dismantling and inspection support',
        ],
      },
      {
        h2: 'Why choose Alcoa as your scaffolding supplier',
        paragraphs: [
          'We operate from a walk-in Musaffah 37 warehouse with ISO 9001:2015 certified processes covering manufacturing, supply, erection, dismantling, rental and maintenance. Quotes are project-specific in AED — share height, quantity, duration and delivery zone for a clear offer.',
        ],
      },
      {
        h2: 'Related pages',
        links: [
          { label: 'Aluminium scaffold towers', path: '/products/aluminium-scaffolding' },
          { label: 'Scaffolding rental Abu Dhabi', path: '/scaffolding-rental-abu-dhabi' },
          { label: 'Scaffolding for sale', path: '/scaffolding-for-sale' },
          { label: 'Manufacturer UAE', path: '/aluminium-scaffolding-manufacturer-uae' },
          { label: 'Musaffah warehouse', path: '/scaffolding-rental-musaffah' },
        ],
      },
    ],
    zones: ['Musaffah 37', 'Abu Dhabi', 'Dubai', 'KIZAD', 'Yas Island'],
    mapEmbed: true,
    showEnquiry: true,
    faq: [
      {
        q: 'Who supplies aluminium scaffolding in Abu Dhabi?',
        a: `Alcoa Aluminium Scaffolding supplies aluminium scaffolding in Abu Dhabi from its warehouse at ${STREET_ADDRESS_SHORT}, Musaffah — towers, ladders and access equipment for sale or hire. Call ${PHONE_PRIMARY}.`,
      },
      {
        q: 'Are you a scaffolding supplier in Musaffah?',
        a: 'Yes. Our warehouse is at Ar Rahmah 4 St., Musaffah 37, Abu Dhabi. Walk-in pickup and local delivery are available during business hours.',
      },
      {
        q: 'Do you supply scaffolding equipment for purchase and rental?',
        a: 'Yes. We supply for both sale and hire. Tell us your project duration and we will recommend the more cost-effective option.',
      },
      {
        q: 'Which areas do you deliver to?',
        a: 'Abu Dhabi, Musaffah, Yas Island, KIZAD, Dubai and wider UAE — confirm lead times when you request a quote.',
      },
    ],
  },

  manufacturer: {
    slug: 'aluminium-scaffolding-manufacturer-uae',
    title: 'Aluminium Scaffolding Manufacturer UAE | Alcoa',
    h1: 'Aluminium Scaffolding Manufacturer UAE',
    primaryKeyword: 'Aluminium Scaffolding Manufacturer UAE',
    money: true,
    quickAnswer:
      'Alcoa Aluminium Scaffolding is an aluminium scaffolding manufacturer in the UAE: its ISO 9001:2015 certificate (14143790) covers manufacturing, supply, erection, dismantling, rental and maintenance of aluminium/steel scaffolding and ladders. Its only base is Musaffah 37, Abu Dhabi.',
    description:
      'Aluminium scaffolding manufacturer UAE — Alcoa Musaffah 37, Abu Dhabi. ISO 9001:2015 scope includes manufacturing, supply, rental & maintenance.',
    keywords:
      'aluminium scaffolding manufacturer UAE, aluminium scaffolding manufacturer Abu Dhabi, aluminium scaffolding manufacturer Musaffah, scaffolding manufacturer UAE',
    intro: `Alcoa Aluminium Scaffolding L.L.C - S.P.C operates under ISO 9001:2015 certification covering manufacturing, supply, erection, dismantling, rental and maintenance of aluminium and steel scaffolding and ladders. Our base is Musaffah 37, Abu Dhabi — we do not claim separate factory offices in other emirates.`,
    sections: [
      {
        h2: 'Manufacturing and supply scope',
        paragraphs: [
          'Our certified scope includes manufacturing and supply of aluminium/steel scaffolding and ladders. Customers in Abu Dhabi and across the UAE source systems for construction, industrial maintenance and commercial access from our Musaffah warehouse.',
        ],
      },
      {
        h2: 'Products associated with our manufacturing scope',
        bullets: [
          'Aluminium scaffold towers and mobile systems',
          'Ladders (aluminium and fiberglass ranges)',
          'Related access components supplied with scaffolding packages',
        ],
        links: [
          { label: 'Aluminium scaffolding products', path: '/products/aluminium-scaffolding' },
          { label: 'Supplier page', path: '/aluminium-scaffolding-supplier-abu-dhabi' },
          { label: 'About Alcoa', path: '/about-us' },
        ],
      },
      {
        h2: 'Service area',
        paragraphs: [
          'Equipment and support are dispatched from Musaffah, Abu Dhabi to projects across the UAE. Contact us for manufacturing/supply and rental combinations on the same order.',
        ],
      },
    ],
    zones: ['Musaffah 37, Abu Dhabi', 'UAE project delivery'],
    mapEmbed: true,
    showEnquiry: true,
    faq: [
      {
        q: 'Is Alcoa an aluminium scaffolding manufacturer in the UAE?',
        a: 'Yes. Our ISO 9001:2015 certificate scope includes manufacturing of aluminium/steel scaffolding and ladders, alongside supply, erection, dismantling, rental and maintenance.',
      },
      {
        q: 'Where is the manufacturer based?',
        a: 'Ar Rahmah 4 St., Musaffah 37, Office 11, 1st Floor, Abu Dhabi, UAE.',
      },
    ],
  },
};

export const getSeoLandingPage = (key) => seoLandingPages[key] || null;

export const seoLandingPageKeys = Object.keys(seoLandingPages);
