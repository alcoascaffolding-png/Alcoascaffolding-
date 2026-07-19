import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiCheck, FiMessageCircle } from 'react-icons/fi';
import SEOHead from '../components/common/SEOHead';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ContactCTA from '../components/sections/ContactCTA';
import { getSeoLandingPage } from '../data/seoLandingPages';
import {
  PHONE_PRIMARY,
  PHONE_PRIMARY_E164,
  MAPS_EMBED_URL,
  MAPS_SEARCH_URL,
  STREET_ADDRESS_SHORT,
  whatsappUrl,
  SITE_URL,
} from '../data/businessFacts';
import { buildLocalBusinessSchema, buildServiceSchema } from '../utils/schemaBuilders';

const SeoLandingPage = ({ pageKey }) => {
  const page = getSeoLandingPage(pageKey);
  if (!page) return null;

  const jsonLd = [
    buildLocalBusinessSchema({
      name: `Alcoa Scaffolding — ${page.h1}`,
      url: `${SITE_URL}/${page.slug}`,
      description: page.description,
    }),
    buildServiceSchema({
      name: page.h1,
      description: page.description,
      url: `${SITE_URL}/${page.slug}`,
    }),
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        canonical={`/${page.slug}`}
        jsonLd={jsonLd}
        faq={page.faq}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: page.h1, path: `/${page.slug}` },
        ]}
      />

      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16">
        <div className="container-custom max-w-4xl">
          <Breadcrumbs items={[{ name: page.h1, path: `/${page.slug}` }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm mb-4">
              <FiMapPin className="w-4 h-4" />
              Musaffah 37 · UAE coverage
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
              <a
                href={whatsappUrl(`Hello Alcoa, I need info about: ${page.h1}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <FiMessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_PRIMARY_E164}`}
                className="inline-flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium"
              >
                <FiPhone className="w-4 h-4" />
                {PHONE_PRIMARY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {page.sections?.map((section) => (
        <section key={section.h2} className="py-10 border-b border-gray-100 dark:border-gray-800">
          <div className="container-custom max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.h2}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {section.bullets?.length > 0 && (
              <ul className="space-y-2 mb-4">
                {section.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.links?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {section.links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {page.zones?.length > 0 && (
        <section className="section-padding py-12">
          <div className="container-custom max-w-4xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Coverage highlights</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {page.zones.map((zone) => (
                <li key={zone} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  {zone}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {page.mapEmbed && (
        <section className="py-10 bg-gray-50 dark:bg-gray-900">
          <div className="container-custom max-w-4xl">
            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Warehouse location — Musaffah 37
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {STREET_ADDRESS_SHORT}, Abu Dhabi.{' '}
              <a
                href={MAPS_SEARCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open in Google Maps
              </a>
            </p>
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-md bg-gray-200">
              <iframe
                title="Alcoa Aluminium Scaffolding Musaffah 37 map"
                src={MAPS_EMBED_URL}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {page.faq?.length > 0 && (
        <section className="section-padding py-12">
          <div className="container-custom max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">FAQ</h2>
            <div className="space-y-3">
              {page.faq.map((item) => (
                <details
                  key={item.q}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCTA />
    </div>
  );
};

export default SeoLandingPage;
