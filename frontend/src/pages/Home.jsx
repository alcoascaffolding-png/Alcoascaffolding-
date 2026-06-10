import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import Certification from '../components/sections/Certification';
import ServiceCategories from '../components/sections/ServiceCategories';
import Projects from '../components/sections/Projects';
import Testimonials from '../components/sections/Testimonials';
import ContactCTA from '../components/sections/ContactCTA';
import SEOHead from '../components/common/SEOHead';

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Alcoa Aluminium Scaffolding',
    legalName: 'Alcoa Aluminium Scaffolding L.L.C - S.P.C',
    description: 'Scaffolding rental service in Abu Dhabi, United Arab Emirates. Aluminium scaffolding, cuplock systems, ladders, and erection crews. Musaffah 37 warehouse with same-day delivery.',
    url: 'https://alcoascaffolding.com',
    telephone: '+971581375601',
    email: 'sales@alcoascaffolding.com',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'sales@alcoascaffolding.com',
        telephone: '+971581375601',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'info@alcoascaffolding.com',
      },
    ],
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
    areaServed: ['Abu Dhabi', 'Musaffah', 'Yas Island', 'KIZAD', 'United Arab Emirates'],
    serviceType: 'Scaffolding Rental Service',
    priceRange: 'AED 35–1100',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Alcoa Aluminium Scaffolding',
    url: 'https://alcoascaffolding.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://alcoascaffolding.com/services?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
];

const homeFaq = [
  {
    q: 'How much does scaffolding rental cost in Abu Dhabi?',
    a: 'Aluminium mobile tower rental in Abu Dhabi, United Arab Emirates starts from AED 35–60 per day. Weekly packages from AED 200 and monthly from AED 600. Contact Alcoa for a site-specific quote including delivery.',
  },
  {
    q: 'Does Alcoa provide scaffolding erection and installation in Abu Dhabi?',
    a: 'Yes. Our certified erection crews install, inspect, and dismantle scaffolding on site across Abu Dhabi and Musaffah. Installation is quoted per site visit based on tower height, access complexity, and duration.',
  },
  {
    q: 'Does Alcoa deliver scaffolding to Abu Dhabi and Musaffah?',
    a: 'Yes. Our Musaffah warehouse dispatches across Abu Dhabi industrial zones, Yas Island, Saadiyat, KIZAD, and Reem Island. Same-day delivery on in-stock items when confirmed before 2 PM.',
  },
  {
    q: 'What is the best scaffolding company in Abu Dhabi?',
    a: 'Alcoa Aluminium Scaffolding has served Abu Dhabi contractors since 2008 with certified equipment, 24/7 WhatsApp support, and on-site erection crews. ISO 9001:2015 certified with zero major incidents on record.',
  },
  {
    q: 'What scaffolding types does Alcoa supply in UAE?',
    a: 'Aluminium mobile towers, steel cuplock systems, ladders (aluminium and fiberglass), couplers, prop jacks, GI/MS pipe, and wooden planks — for rent and sale. Weekly and monthly hire rates reduce the daily cost.',
  },
];

const Home = () => {
  const hreflang = [
    { hrefLang: 'en-AE', href: 'https://alcoascaffolding.com/' },
    { hrefLang: 'ar-AE', href: 'https://alcoascaffolding.com/ar' },
    { hrefLang: 'x-default', href: 'https://alcoascaffolding.com/' },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Scaffolding Rental Service Abu Dhabi | Alcoa Aluminium Scaffolding UAE"
        description="Alcoa Aluminium Scaffolding — 4.6★ scaffolding rental service in Abu Dhabi, UAE. Musaffah 37 warehouse. Cuplock, mobile towers, ladders from AED 35/day. Erection crews available."
        keywords="scaffolding rental service Abu Dhabi, scaffolding rental Abu Dhabi, scaffolding hire Abu Dhabi, Alcoa Aluminium Scaffolding LLC, scaffolding company UAE, scaffolding erection Abu Dhabi, scaffolding installation Abu Dhabi, industrial scaffolding Abu Dhabi, scaffolding Musaffah 37, alcoa scaffolding, scaffolding near me UAE, scaffolding Musaffah, weekly scaffolding rental, monthly scaffolding hire UAE, scaffolding Abu Dhabi UAE"
        canonical="/"
        jsonLd={homeJsonLd}
        faq={homeFaq}
        alternates={hreflang}
      />
      <Hero />
      <Features />
      <About />
      <Services />
      <Projects />
      <Testimonials />
      <Certification />
      <ServiceCategories />
      <ContactCTA />
    </div>
  );
};

export default Home;

