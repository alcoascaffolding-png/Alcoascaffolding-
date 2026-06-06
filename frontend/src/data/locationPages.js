export const locationPages = {
  'abu-dhabi': {
    slug: 'scaffolding-rental-abu-dhabi',
    city: 'Abu Dhabi',
    title: 'Scaffolding Rental Abu Dhabi',
    h1: 'Scaffolding Rental Abu Dhabi',
    description:
      'Scaffolding rental Abu Dhabi and Musaffah industrial area. Alcoa HQ warehouse, 24/7 hire, aluminium & cuplock from AED 35/day. Yas Island, Saadiyat, Mussafah delivery.',
    keywords:
      'scaffolding rental Abu Dhabi, scaffolding Abu Dhabi, scaffolding Musaffah, scaffolding hire Abu Dhabi, cuplock scaffolding Abu Dhabi',
    intro: `Our headquarters in Musaffah Industrial Area makes Alcoa the natural choice for scaffolding rental Abu Dhabi, United Arab Emirates. We serve Yas Island, Saadiyat, Reem Island, Mussafah M-40/M-45 zones, and ADNOC-adjacent sites with aluminium mobile towers, steel cuplock systems, and full coupler ranges. Abu Dhabi clients benefit from the shortest delivery legs in our network — many Musaffah orders are fulfilled within two hours. Hire rates from AED 35–60 per day with Musaffah pickup available at no delivery charge.`,
    zones: [
      'Musaffah Industrial (M-40, M-45)',
      'Yas Island & Saadiyat',
      'Reem Island & Al Reem',
      'Khalifa Industrial Zone (KIZAD)',
      'Mussafah workshop clusters',
    ],
    delivery: 'Musaffah pickup free. Abu Dhabi island and industrial deliveries typically same-day.',
    testimonial:
      'Rajesh Kumar, Gulf Build Contractors Abu Dhabi: "We rent cuplock and props monthly from Alcoa — Musaffah warehouse stock means fast turnaround and no waiting."',
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
      'Fatima Hassan, Musaffah workshop owner: "We pick up ladders and base jacks from Alcoa same morning — local warehouse stock with no delays."',
  },
  'near-me': {
    slug: 'scaffolding-near-me-uae',
    city: 'UAE',
    title: 'Scaffolding Near Me UAE',
    h1: 'Scaffolding Near Me — Abu Dhabi, United Arab Emirates',
    description:
      'Find scaffolding near you in Abu Dhabi, United Arab Emirates. Alcoa delivers Abu Dhabi, Musaffah. Call +971 58 137 5601 for nearest stock and same-day hire.',
    keywords:
      'scaffolding near me UAE, scaffolding near me Abu Dhabi, scaffolding hire near me, scaffolding Musaffah',
    intro: `Searching "scaffolding near me" in Abu Dhabi, United Arab Emirates? Alcoa Aluminium Scaffolding serves Abu Dhabi and Musaffah from our Musaffah HQ. Share your map pin or project address on WhatsApp for the nearest available stock list and delivery ETA. We rent and sell aluminium scaffolding, mobile towers, ladders, steel cuplock, and couplers with rates from AED 35/day and quotes returned in under 30 minutes during business hours.`,
    zones: ['Abu Dhabi & Musaffah', 'Yas Island & Saadiyat', 'Reem Island & KIZAD', 'Abu Dhabi industrial areas'],
    delivery: 'WhatsApp your location for instant availability check and delivery quote.',
    testimonial:
      'Contractors across Abu Dhabi use our WhatsApp line for near-me quotes — average response under 30 minutes.',
  },
};

export const getLocationByKey = (key) => locationPages[key];

export const getLocationBySlug = (slug) =>
  Object.values(locationPages).find((p) => p.slug === slug);
