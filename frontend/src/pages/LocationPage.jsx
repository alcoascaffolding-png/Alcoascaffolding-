import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiPhone, FiMessageCircle } from 'react-icons/fi';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Services from '../components/sections/Services';
import ContactCTA from '../components/sections/ContactCTA';
import { getLocationByKey } from '../data/locationPages';
import {
  PHONE_PRIMARY,
  PHONE_PRIMARY_E164,
  MAPS_EMBED_URL,
  MAPS_SEARCH_URL,
  STREET_ADDRESS_SHORT,
  SITE_URL,
  whatsappUrl,
} from '../data/businessFacts';
import { buildLocalBusinessSchema } from '../utils/schemaBuilders';

const LocationPage = ({ locationKey }) => {
  const page = getLocationByKey(locationKey);

  if (!page) return null;

  const faq = [
    {
      q: `How much is scaffolding rental in ${page.city}?`,
      a: `Scaffolding hire in ${page.city} is quoted per equipment type, height, quantity, and duration. Contact Alcoa at ${PHONE_PRIMARY} for a free AED quote including delivery.`,
    },
    {
      q: `How fast can you deliver scaffolding to ${page.city}?`,
      a: page.delivery,
    },
    {
      q: `Which scaffolding types are available in ${page.city}?`,
      a: 'Aluminium mobile towers, steel cuplock systems, ladders, couplers, prop jacks, wooden/steel planks, and GI/MS pipe. Sale and rental both available.',
    },
    {
      q: `How do I get a quote for ${page.city}?`,
      a: `Call ${PHONE_PRIMARY}, WhatsApp us, or use the contact form. Share location, tower height, quantity, and rental duration.`,
    },
    {
      q: 'Where is the Alcoa warehouse?',
      a: `${STREET_ADDRESS_SHORT}, Musaffah, Abu Dhabi. ${MAPS_SEARCH_URL}`,
    },
  ];

  const jsonLd = buildLocalBusinessSchema({
    name: `Alcoa Scaffolding — ${page.city}`,
    description: page.description,
    url: `${SITE_URL}/${page.slug}`,
    areaServed: [
      { '@type': 'Place', name: page.city },
      { '@type': 'Country', name: 'United Arab Emirates' },
    ],
  });

  return (
    <div className="min-h-screen">
      <SEOHead
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        canonical={`/${page.slug}`}
        jsonLd={jsonLd}
        faq={faq}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: page.title, path: `/${page.slug}` },
        ]}
      />

      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16">
        <div className="container-custom max-w-4xl">
          <Breadcrumbs items={[{ name: page.title, path: `/${page.slug}` }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm mb-4">
              <FiMapPin className="w-4 h-4" />
              {page.city}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {page.h1}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {page.intro}
            </p>
            {page.body?.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
              >
                {paragraph}
              </p>
            ))}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link to="/contact-us" className="btn-primary">
                Get Free Quote
              </Link>
              <a
                href={whatsappUrl(`Hello Alcoa, scaffolding rental enquiry for ${page.city}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <FiMessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_PRIMARY_E164}`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <FiPhone className="w-4 h-4" />
                {PHONE_PRIMARY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding py-12">
        <div className="container-custom max-w-4xl grid md:grid-cols-2 gap-8">
          <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Service zones in {page.city}
            </h2>
            <ul className="space-y-2">
              {page.zones.map((zone) => (
                <li key={zone} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  {zone}
                </li>
              ))}
            </ul>
          </article>
          <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Delivery & pricing
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{page.delivery}</p>
            <dl className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-2 dark:border-gray-700">
                <dt className="min-w-0 text-gray-600 dark:text-gray-400">Hire options</dt>
                <dd className="min-w-0 break-words text-right font-semibold text-gray-900 dark:text-white">Daily / weekly / monthly</dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-2 dark:border-gray-700">
                <dt className="min-w-0 text-gray-600 dark:text-gray-400">Pricing</dt>
                <dd className="min-w-0 break-words text-right font-semibold text-gray-900 dark:text-white">Free AED quote</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="min-w-0 text-gray-600 dark:text-gray-400">Phone / WhatsApp</dt>
                <dd className="min-w-0 break-words text-right font-semibold text-gray-900 dark:text-white">{PHONE_PRIMARY}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Link to="/faq" className="text-blue-600 hover:underline">
                FAQ
              </Link>
              <Link to="/scaffolding-rental-uae" className="text-blue-600 hover:underline">
                UAE coverage
              </Link>
              <Link to="/services/rental" className="text-blue-600 hover:underline">
                Rental hub
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom max-w-4xl">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Find us — Musaffah 37 warehouse
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {STREET_ADDRESS_SHORT}.{' '}
            <a href={MAPS_SEARCH_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Open in Google Maps
            </a>
          </p>
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Alcoa Scaffolding Musaffah map"
              src={MAPS_EMBED_URL}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-custom max-w-4xl">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">FAQ — {page.city}</h2>
          <div className="space-y-3 mb-8">
            {faq.map((item) => (
              <details
                key={item.q}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <summary className="font-semibold cursor-pointer text-gray-900 dark:text-white">
                  {item.q}
                </summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{item.a}</p>
              </details>
            ))}
          </div>
          <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-700 dark:text-gray-300">
            {page.testimonial}
          </blockquote>
        </div>
      </section>

      <Services />
      <ContactCTA />
    </div>
  );
};

export default LocationPage;
