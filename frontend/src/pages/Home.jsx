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
import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../utils/schemaBuilders';
import { SITE_URL, PHONE_PRIMARY, STREET_ADDRESS_SHORT, ISO_CERT } from '../data/businessFacts';
import { Link } from 'react-router-dom';

const homeFaq = [
  {
    q: 'How much does scaffolding rental cost in Abu Dhabi?',
    a: `Scaffolding rental in Abu Dhabi is quoted per equipment type, height, quantity, and hire duration (daily, weekly, or monthly). Contact Alcoa at ${PHONE_PRIMARY} or WhatsApp for a free site-specific AED quote from Musaffah 37.`,
  },
  {
    q: 'Does Alcoa provide scaffolding erection and installation in Abu Dhabi?',
    a: 'Yes. Our erection crews install, inspect, and dismantle scaffolding on site across Abu Dhabi and Musaffah. Installation is quoted per site visit based on tower height, access complexity, and duration.',
  },
  {
    q: 'Does Alcoa deliver scaffolding to Abu Dhabi and Musaffah?',
    a: `Yes. Our Musaffah 37 warehouse (${STREET_ADDRESS_SHORT}) dispatches across Abu Dhabi industrial zones, Yas Island, Saadiyat, KIZAD, Reem Island, and Dubai. Warehouse pickup is available Mon–Sat 8am–6pm.`,
  },
  {
    q: 'What scaffolding types does Alcoa supply in UAE?',
    a: 'Aluminium mobile towers, steel cuplock systems, ladders (aluminium and fiberglass), couplers, prop jacks, GI/MS pipe, wooden and steel planks — for rent and sale. See our products and services pages for the full range.',
  },
  {
    q: 'Is Alcoa an ISO certified scaffolding company?',
    a: `Yes. Alcoa Aluminium Scaffolding is ${ISO_CERT.standard} certified (certificate ${ISO_CERT.number}) for manufacturing, supply, erection, dismantling, rental and maintenance of aluminium/steel scaffolding and ladders.`,
  },
  {
    q: 'Can I rent scaffolding for just 1 day in UAE?',
    a: 'Yes — minimum hire is typically one day subject to availability. Weekly and monthly packages are available for longer projects. Confirm terms when you request a quote.',
  },
  {
    q: 'Do you supply scaffolding for oil and gas or industrial sites?',
    a: 'Yes. We supply industrial scaffolding and access equipment for contractors working on industrial, petrochemical-adjacent, and heavy commercial projects in Abu Dhabi, Musaffah, and KIZAD. HSE documentation available on request.',
  },
  {
    q: 'Where is Alcoa Scaffolding located?',
    a: `Alcoa Aluminium Scaffolding LLC is based at ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi, UAE. Call ${PHONE_PRIMARY} or visit our FAQ and contact pages for maps and directions.`,
  },
];

const Home = () => {
  const hreflang = [
    { hrefLang: 'en-AE', href: `${SITE_URL}/` },
    { hrefLang: 'ar-AE', href: `${SITE_URL}/ar` },
    { hrefLang: 'x-default', href: `${SITE_URL}/` },
  ];

  const homeJsonLd = [
    buildOrganizationSchema(),
    buildLocalBusinessSchema({
      description:
        'Aluminium and steel scaffolding rental and sale in Abu Dhabi, Musaffah 37, Dubai and UAE. ISO 9001:2015 certified supplier with erection and inspection services.',
      serviceType: 'Scaffolding Rental Service',
    }),
    buildWebSiteSchema(),
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Scaffolding Rental Abu Dhabi & Dubai | Alcoa UAE"
        description="Rent or buy aluminium & steel scaffolding across UAE. Serving Abu Dhabi, Musaffah 37, Dubai. ISO 9001:2015. Call Alcoa for a free quote!"
        keywords="scaffolding rental Abu Dhabi, scaffolding rental Dubai, aluminium scaffolding UAE, scaffolding company Abu Dhabi, scaffolding supplier Abu Dhabi, scaffolding Musaffah, scaffolding hire UAE, scaffolding near me UAE"
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

      <section className="section-padding py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Scaffolding rental FAQ — Abu Dhabi & UAE
          </h2>
          <div className="space-y-4">
            {homeFaq.map((item) => (
              <details
                key={item.q}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm group"
              >
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-blue-600 group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            More answers on our{' '}
            <Link to="/faq" className="text-blue-600 hover:underline">
              FAQ page
            </Link>
            ,{' '}
            <Link to="/scaffolding-rental-dubai" className="text-blue-600 hover:underline">
              Dubai rental
            </Link>
            , and{' '}
            <Link to="/scaffolding-rental-musaffah" className="text-blue-600 hover:underline">
              Musaffah warehouse
            </Link>{' '}
            pages.
          </p>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
};

export default Home;
