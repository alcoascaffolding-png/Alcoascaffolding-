import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiPhone } from 'react-icons/fi';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Services from '../components/sections/Services';
import ContactCTA from '../components/sections/ContactCTA';
import { getLocationByKey } from '../data/locationPages';

const LocationPage = ({ locationKey }) => {
  const page = getLocationByKey(locationKey);

  if (!page) return null;

  const faq = [
    {
      q: `How much is scaffolding rental in ${page.city}?`,
      a: `Aluminium tower rental in ${page.city} typically starts at AED 35–60 per day. Weekly packages from AED 200 and monthly from AED 600. Delivery charges depend on zone — contact us for an exact quote.`,
    },
    {
      q: `How fast can you deliver scaffolding to ${page.city}?`,
      a: page.delivery,
    },
    {
      q: `Which scaffolding types are available in ${page.city}?`,
      a: 'Aluminium mobile towers, steel cuplock systems, ladders, couplers, prop jacks, wooden planks, and GI/MS pipe. Sale and rental both available.',
    },
    {
      q: `How do I get a quote for ${page.city}?`,
      a: 'Call +971 58 137 5601, WhatsApp us, or use the contact form. Share location, tower height, quantity, and rental duration.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Alcoa Scaffolding — ${page.city}`,
    description: page.description,
    url: `https://alcoascaffolding.com/${page.slug}`,
    telephone: '+971581375601',
    areaServed: page.city,
    address: {
      '@type': 'PostalAddress',
      addressLocality: page.city === 'UAE' ? 'Abu Dhabi' : page.city,
      addressCountry: 'AE',
    },
  };

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
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {page.intro}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact-us" className="btn-primary">
                Get Free Quote
              </Link>
              <a href="tel:+971581375601" className="btn-secondary inline-flex items-center gap-2">
                <FiPhone className="w-4 h-4" />
                +971 58 137 5601
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
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <dt className="text-gray-600 dark:text-gray-400">Daily hire from</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">AED 35/day</dd>
              </div>
              <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <dt className="text-gray-600 dark:text-gray-400">Weekly packages</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">AED 200+</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Phone / WhatsApp</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">+971 58 137 5601</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="py-8 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom max-w-4xl">
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
