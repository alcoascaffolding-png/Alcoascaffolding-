export const locationPages = {
  dubai: {
    slug: 'scaffolding-rental-dubai',
    city: 'Dubai',
    title: 'Scaffolding Rental Dubai',
    h1: 'Scaffolding Rental Dubai',
    description:
      'Scaffolding rental Dubai from Alcoa Aluminium Scaffolding. Same-day delivery to JAFZA, Downtown Dubai, Business Bay, Dubai Marina, and industrial zones. Aluminium towers from AED 35/day.',
    keywords:
      'scaffolding rental Dubai, scaffolding hire Dubai, scaffolding company Dubai, aluminium scaffolding Dubai, mobile tower rental Dubai',
    intro: `Alcoa Aluminium Scaffolding delivers certified scaffolding rental across Dubai for construction, façade, MEP, and maintenance projects. From single-width mobile towers in Business Bay to cuplock systems for high-rise cores in Dubai Marina, our Musaffah warehouse dispatches equipment daily to Dubai metro sites. Typical aluminium tower hire starts at AED 35–60 per day with weekly and monthly discounts. We supply aluminium scaffolding, steel cuplock, ladders, and couplers with optional erection crews.`,
    zones: [
      'JAFZA & Dubai Industrial City',
      'Downtown Dubai & Business Bay',
      'Dubai Marina & JLT',
      'Deira & Al Quoz workshops',
      'Dubai South & Expo area projects',
    ],
    delivery: 'Same-day delivery available for orders confirmed before 2 PM. Standard Dubai delivery AED 150–350 depending on zone.',
    testimonial:
      'Ahmed Al Rashidi, site manager at a Dubai Marina tower project: "Alcoa delivered cuplock and mobile towers within four hours — pricing was clear and equipment was inspection-ready."',
  },
  'abu-dhabi': {
    slug: 'scaffolding-rental-abu-dhabi',
    city: 'Abu Dhabi',
    title: 'Scaffolding Rental Abu Dhabi',
    h1: 'Scaffolding Rental Abu Dhabi',
    description:
      'Scaffolding rental Abu Dhabi and Musaffah industrial area. Alcoa HQ warehouse, 24/7 hire, aluminium & cuplock from AED 35/day. Yas Island, Saadiyat, Mussafah delivery.',
    keywords:
      'scaffolding rental Abu Dhabi, scaffolding Abu Dhabi, scaffolding Musaffah, scaffolding hire Abu Dhabi, cuplock scaffolding Abu Dhabi',
    intro: `Our headquarters in Musaffah Industrial Area makes Alcoa the natural choice for scaffolding rental Abu Dhabi. We serve Yas Island, Saadiyat, Reem Island, Mussafah M-40/M-45 zones, and ADNOC-adjacent sites with aluminium mobile towers, steel cuplock systems, and full coupler ranges. Abu Dhabi clients benefit from the shortest delivery legs in our network — many Musaffah orders are fulfilled within two hours. Hire rates align with Dubai pricing with Musaffah pickup available at no delivery charge.`,
    zones: [
      'Musaffah Industrial (M-40, M-45)',
      'Yas Island & Saadiyat',
      'Reem Island & Al Reem',
      'Khalifa Industrial Zone (KIZAD)',
      'Mussafah workshop clusters',
    ],
    delivery: 'Musaffah pickup free. Abu Dhabi island and industrial deliveries typically same-day.',
    testimonial:
      'Rajesh Kumar, Gulf Build Contractors Abu Dhabi: "We rent cuplock and props monthly from Alcoa — Musaffah warehouse stock means no waiting for transfers from Dubai."',
  },
  musaffah: {
    slug: 'scaffolding-rental-musaffah',
    city: 'Musaffah',
    title: 'Scaffolding Rental Musaffah',
    h1: 'Scaffolding Rental Musaffah Industrial Area',
    description:
      'Scaffolding rental Musaffah — Alcoa warehouse on-site. Walk-in hire, cuplock, aluminium towers, ladders. Fast quotes +971 58 137 5601.',
    keywords:
      'scaffolding Musaffah, scaffolding rental Musaffah, scaffolding supplier Musaffah, cuplock Musaffah, scaffolding warehouse Abu Dhabi',
    intro: `Musaffah is home to Alcoa Aluminium Scaffolding's main warehouse — the fastest way to get scaffolding in Abu Dhabi's industrial heart. Fabricators, mechanical contractors, and facility teams across M-40 and M-45 collect towers, ledgers, couplers, and ladders directly or schedule local delivery within Musaffah. Our inventory covers single-width aluminium towers, full cuplock sets, GI/MS pipe, prop jacks, and wooden planks with transparent AED pricing from AED 35/day.`,
    zones: [
      'Musaffah M-40 industrial sector',
      'Musaffah M-45 workshop zone',
      'ICAD & adjacent industrial parks',
      'Abu Dhabi mainland contractors',
    ],
    delivery: 'Warehouse pickup during business hours. Musaffah delivery runs multiple times daily.',
    testimonial:
      'Fatima Hassan, Musaffah workshop owner: "We pick up ladders and base jacks from Alcoa same morning — no Dubai transfer delays."',
  },
  'near-me': {
    slug: 'scaffolding-near-me-uae',
    city: 'UAE',
    title: 'Scaffolding Near Me UAE',
    h1: 'Scaffolding Near Me — UAE Wide',
    description:
      'Find scaffolding near you in UAE. Alcoa delivers Dubai, Abu Dhabi, Musaffah, Sharjah, Al Ain. Call +971 58 137 5601 for nearest stock and same-day hire.',
    keywords:
      'scaffolding near me UAE, scaffolding near me Dubai, scaffolding near me Abu Dhabi, scaffolding hire near me',
    intro: `Searching "scaffolding near me" in the UAE? Alcoa Aluminium Scaffolding covers Dubai, Abu Dhabi, Musaffah, Sharjah, and Al Ain with daily deliveries from our Musaffah HQ. Share your map pin or project address on WhatsApp for the nearest available stock list and delivery ETA. We rent and sell aluminium scaffolding, mobile towers, ladders, steel cuplock, and couplers with rates from AED 35/day and quotes returned in under 30 minutes during business hours.`,
    zones: ['Dubai & Sharjah', 'Abu Dhabi & Musaffah', 'Al Ain industrial areas', 'Northern Emirates on request'],
    delivery: 'WhatsApp your location for instant availability check and delivery quote.',
    testimonial:
      'Contractors across UAE use our WhatsApp line for near-me quotes — average response under 30 minutes.',
  },
};

export const getLocationByKey = (key) => locationPages[key];

export const getLocationBySlug = (slug) =>
  Object.values(locationPages).find((p) => p.slug === slug);
