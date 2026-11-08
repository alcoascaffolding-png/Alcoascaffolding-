import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiRepeat, FiTool, FiTruck, FiArrowRight, FiPlus } from 'react-icons/fi';
import Hero from '../components/sections/Hero';
import ProductCategoryCards from '../components/sections/ProductCategoryCards';
import ServiceHighlights from '../components/sections/ServiceHighlights';
import ServiceAreas from '../components/sections/ServiceAreas';
import Testimonials from '../components/sections/Testimonials';
import ContactCTA from '../components/sections/ContactCTA';
import SEOHead from '../components/common/SEOHead';
import QuickAnswer from '../components/common/QuickAnswer';
import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../utils/schemaBuilders';
import { SITE_URL } from '../data/businessFacts';
import { ROUTE_META, HOME_FAQ } from '../data/routeMeta';

const meta = ROUTE_META['/'];

const hreflang = [
  { hrefLang: 'en-AE', href: `${SITE_URL}/` },
  { hrefLang: 'ar-AE', href: `${SITE_URL}/ar` },
  { hrefLang: 'x-default', href: `${SITE_URL}/` },
];

const homeJsonLd = [buildOrganizationSchema(), buildLocalBusinessSchema(), buildWebSiteSchema()];

const TRUST_POINTS = [
  { icon: FiAward, title: 'ISO 9001:2015 certified', text: 'Manufacturing, supply, rental and erection scope.' },
  { icon: FiRepeat, title: 'Rent or buy', text: 'Daily, weekly and monthly hire, or outright purchase.' },
  { icon: FiTool, title: 'Installation crews', text: 'Erection, modification and dismantling on site.' },
  { icon: FiTruck, title: 'UAE-wide delivery', text: 'From Musaffah 37 to Abu Dhabi, Dubai and beyond.' },
];

const Home = () => (
  <div className="min-h-screen">
    <SEOHead
      title={meta.title}
      description={meta.description}
      canonical="/"
      jsonLd={homeJsonLd}
      faq={HOME_FAQ}
      alternates={hreflang}
    />

    <Hero />

    <section className="bg-white py-14 dark:bg-surface-dark sm:py-16">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Who we are</h2>
            <QuickAnswer text={meta.quickAnswer} className="mt-5" />
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <Link to="/about-us" className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400">
                About Alcoa
                <FiArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <Link
                to="/aluminium-scaffolding-supplier-abu-dhabi"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Aluminium scaffolding supplier Abu Dhabi
              </Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {TRUST_POINTS.map((point) => (
              <li
                key={point.title}
                className="rounded-xl border border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <point.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <p className="mt-3 font-semibold text-gray-900 dark:text-white">{point.title}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <ProductCategoryCards />
    <ServiceHighlights />
    <ServiceAreas />
    <Testimonials />

    <section className="bg-gray-50 py-14 dark:bg-gray-900 sm:py-16">
      <div className="container-custom max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Frequently asked questions</h2>
        <div className="mt-8 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
          {HOME_FAQ.map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-900 dark:text-white">
                {item.q}
                <FiPlus className="h-5 w-5 flex-shrink-0 text-blue-600 transition-transform group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{item.a}</p>
            </details>
          ))}
        </div>
        <Link
          to="/faq"
          className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          See all FAQs
          <FiArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>

    <ContactCTA />
  </div>
);

export default Home;
