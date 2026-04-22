import React from 'react';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import ServiceCategories from '../components/sections/ServiceCategories';
import Projects from '../components/sections/Projects';
import Testimonials from '../components/sections/Testimonials';
import ContactCTA from '../components/sections/ContactCTA';
import SEOHead from '../components/common/SEOHead';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': 'Alcoa Scaffolding UAE',
  'description': 'Scaffolding sale and rental in Dubai and Abu Dhabi',
  'url': 'https://alcoascaffolding.com',
  'telephone': '+971 58 137 5601',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Abu Dhabi',
    'addressCountry': 'AE'
  },
  'areaServed': ['Dubai', 'Abu Dhabi', 'Musaffah', 'UAE'],
  'serviceType': 'Scaffolding Rental and Sales'
};

const Home = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Scaffolding Rental Dubai | Alcoa Scaffolding UAE"
        description="Scaffolding rental Dubai from Alcoa Scaffolding, a trusted scaffolding company UAE serving Abu Dhabi, Musaffah, and the wider UAE. Call for fast rental, hire, and delivery."
        keywords="scaffolding rental Dubai, scaffolding company UAE, scaffolding sale UAE, scaffolding hire UAE, alcoa scaffolding, scaffolding near me UAE, scaffolding rental Abu Dhabi, scaffolding Musaffah"
        canonical="/"
        jsonLd={homeJsonLd}
      />
      <Hero />
      <Features />
      <About />
      <Services />
      <Projects />
      <Testimonials />
      <ServiceCategories />
      <ContactCTA />
    </div>
  );
};

export default Home;

