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
    q: 'Who supplies aluminium scaffolding in Abu Dhabi?',
    a: `Alcoa Aluminium Scaffolding L.L.C - S.P.C supplies aluminium scaffolding from ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi. Call ${PHONE_PRIMARY} for rental or purchase quotes.`,
  },
  {
    q: 'Where can I rent aluminium scaffolding in Abu Dhabi?',
    a: `Rent aluminium towers and access equipment from our Musaffah 37 warehouse, or request delivery across Abu Dhabi. See our scaffolding rental page or call ${PHONE_PRIMARY}.`,
  },
  {
    q: 'Where can I buy aluminium scaffolding in Abu Dhabi?',
    a: 'Alcoa sells aluminium scaffolding systems, ladders, and accessories from Musaffah. Visit our supplier page or scaffolding for sale page for purchase options.',
  },
  {
    q: 'What types of aluminium scaffolding are available?',
    a: 'Single- and double-width mobile towers, folding towers, stairway towers, bridgeway systems, rolling platforms, cantilever configurations, plus ladders and related accessories — for rent or sale.',
  },
  {
    q: 'How much does scaffolding rental cost in Abu Dhabi?',
    a: `Scaffolding rental is quoted per equipment type, height, quantity, and hire duration (daily, weekly, or monthly). Contact Alcoa at ${PHONE_PRIMARY} for a free site-specific AED quote.`,
  },
  {
    q: 'Is Alcoa an ISO certified scaffolding company?',
    a: `Yes. Alcoa is ${ISO_CERT.standard} certified (certificate ${ISO_CERT.number}) for manufacturing, supply, erection, dismantling, rental and maintenance of aluminium/steel scaffolding and ladders.`,
  },
  {
    q: 'Do you deliver scaffolding from Musaffah?',
    a: `Yes. Our Musaffah 37 warehouse (${STREET_ADDRESS_SHORT}) dispatches across Abu Dhabi industrial zones, Yas Island, Saadiyat, KIZAD, Reem Island, and Dubai. Warehouse pickup is available Mon–Sat 8am–6pm.`,
  },
  {
    q: 'Where is Alcoa Scaffolding located?',
    a: `Alcoa Aluminium Scaffolding LLC is based at ${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi, UAE. Call ${PHONE_PRIMARY} or visit our contact page for maps and directions.`,
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
        'Aluminium scaffolding manufacturer, supplier, rental and access equipment company in Musaffah 37, Abu Dhabi — serving Dubai and the UAE. ISO 9001:2015 certified.',
      serviceType: 'Aluminium Scaffolding Supplier',
    }),
    buildWebSiteSchema(),
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Aluminium Scaffolding Abu Dhabi | Alcoa UAE"
        description="Aluminium scaffolding Abu Dhabi from Alcoa Musaffah 37 — supplier, rental & towers for UAE projects. ISO 9001:2015. Free quote: +971 58 137 5601."
        keywords="aluminium scaffolding Abu Dhabi, aluminium scaffolding UAE, scaffolding company Abu Dhabi, aluminium scaffolding supplier Abu Dhabi, scaffolding Musaffah, aluminium scaffold tower Abu Dhabi"
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
            Aluminium scaffolding FAQ — Abu Dhabi & UAE
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
            Explore{' '}
            <Link to="/products/aluminium-scaffolding" className="text-blue-600 hover:underline">
              aluminium scaffolding products
            </Link>
            ,{' '}
            <Link to="/scaffolding-rental-abu-dhabi" className="text-blue-600 hover:underline">
              scaffolding rental Abu Dhabi
            </Link>
            ,{' '}
            <Link to="/aluminium-scaffolding-supplier-abu-dhabi" className="text-blue-600 hover:underline">
              aluminium scaffolding supplier
            </Link>
            ,{' '}
            <Link to="/scaffolding-rental-musaffah" className="text-blue-600 hover:underline">
              Musaffah warehouse
            </Link>
            , and our{' '}
            <Link to="/faq" className="text-blue-600 hover:underline">
              FAQ page
            </Link>
            .
          </p>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
};

export default Home;
