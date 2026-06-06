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
    name: 'Alcoa Scaffolding UAE',
    description: 'Scaffolding sale and rental in Dubai and Abu Dhabi',
    url: 'https://alcoascaffolding.com',
    telephone: '+971 58 137 5601',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Musaffah, Abu Dhabi',
      addressCountry: 'AE',
    },
    areaServed: ['Dubai', 'Abu Dhabi', 'Musaffah', 'UAE'],
    serviceType: 'Scaffolding Rental and Sales',
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
    q: 'How much does scaffolding rental cost in Dubai?',
    a: 'Aluminium mobile tower rental in Dubai starts from AED 35–60 per day. Weekly and monthly packages reduce the daily rate. Contact Alcoa for a site-specific quote including delivery.',
  },
  {
    q: 'Does Alcoa deliver scaffolding to Abu Dhabi and Musaffah?',
    a: 'Yes. Our Musaffah warehouse dispatches to Abu Dhabi, Musaffah industrial zones, Dubai, Sharjah, and Al Ain. Same-day delivery available on in-stock items.',
  },
  {
    q: 'What scaffolding types does Alcoa supply in UAE?',
    a: 'Aluminium mobile towers, steel cuplock systems, ladders (aluminium and fiberglass), couplers, prop jacks, GI/MS pipe, and wooden planks — for rent and sale.',
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
        title="Scaffolding Rental Dubai | Alcoa Scaffolding UAE"
        description="Scaffolding rental Dubai from Alcoa Scaffolding, a trusted scaffolding company UAE serving Abu Dhabi, Musaffah, and the wider UAE. Towers from AED 35/day. Fast delivery."
        keywords="scaffolding rental Dubai, scaffolding company UAE, scaffolding sale UAE, scaffolding hire UAE, alcoa scaffolding, scaffolding near me UAE, scaffolding rental Abu Dhabi, scaffolding Musaffah"
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

