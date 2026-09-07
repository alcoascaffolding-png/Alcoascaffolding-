import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { servicesData } from '../../data/servicesData';
import ProductImageDisplay from '../../components/common/ProductImageDisplay';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { getCategoryIcon } from '../../data/productImageMap';
import {
  getServicePricing,
  getServiceIntro,
  getServiceFaq,
  getServiceProcess,
  buildProductSchema,
  buildEnhancedServiceSchema,
  buildHowToSchema,
  isHowToService,
} from '../../utils/serviceRichContent';
import { getRelatedServices, getRelatedProductCategory } from '../../utils/serviceRelatedLinks';
import { FiCheck, FiPhone, FiMail, FiChevronDown } from 'react-icons/fi';
import SEOHead from '../../components/common/SEOHead';
import { EMAIL_SALES, EMAIL_INFO } from '../../data/contactInfo';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const service = servicesData[serviceId];

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const pricing = getServicePricing(service);
  const intro = getServiceIntro(serviceId, service);
  const faq = getServiceFaq(serviceId, service);
  const process = getServiceProcess(service);
  const related = getRelatedServices(serviceId);
  const productCategoryPath = getRelatedProductCategory(service.category);

  const jsonLdExtra = [
    buildProductSchema(serviceId, service),
    isHowToService(serviceId) ? buildHowToSchema(serviceId, service) : null,
  ].filter(Boolean);

  const serviceJsonLd = buildEnhancedServiceSchema(serviceId, service);

  const SERVICE_SEO = {
    'cantilever-scaffolding': {
      title: 'Cantilever Scaffolding Abu Dhabi | Alcoa UAE',
      description:
        'Cantilever scaffolding Abu Dhabi — aluminium systems for rent & sale from Musaffah 37. Delivery across UAE. Free quote from Alcoa.',
      h1: 'Cantilever Scaffolding Abu Dhabi',
    },
    'intermediate-transom': {
      title: 'Intermediate Transom Scaffolding UAE | Alcoa',
      description:
        'Intermediate transom scaffolding for sale & rental in Abu Dhabi and Dubai. Fast supply from Musaffah 37.',
      h1: 'Intermediate Transom Scaffolding — UAE',
    },
    'aluminium-rolling-platform': {
      title: 'Aluminium Rolling Platform Abu Dhabi | Alcoa',
      description:
        'Aluminium rolling platform Abu Dhabi — lightweight mobile platforms for rent & sale. UAE delivery from Musaffah 37.',
      h1: 'Aluminium Rolling Platform Abu Dhabi',
    },
    'stairway-scaffolding': {
      title: 'Stairway Scaffolding Abu Dhabi | Alcoa UAE',
      description:
        'Stairway scaffolding Abu Dhabi — aluminium stairway towers for hire & sale. Delivery from Musaffah 37 across UAE.',
      h1: 'Stairway Scaffolding Abu Dhabi',
    },
    rental: {
      title: 'Aluminium Scaffolding Rental Abu Dhabi | Alcoa',
      description:
        'Aluminium scaffolding rental Abu Dhabi — daily, weekly & monthly hire from Musaffah 37. Towers, cuplock & ladders. Free quote.',
      h1: 'Aluminium Scaffolding Rental Abu Dhabi',
    },
    'folding-tower': {
      title: 'Mobile Scaffolding Tower Abu Dhabi | Alcoa',
      description:
        'Mobile scaffolding tower Abu Dhabi — folding aluminium towers for rent & sale from Musaffah 37. Request a free quote.',
      h1: 'Mobile Scaffolding Tower Abu Dhabi',
    },
    'folding-mobile-towers': {
      title: 'Folding Mobile Scaffold Towers | Product Specs | Alcoa',
      description:
        'Folding mobile scaffold tower specifications and hire options from Alcoa Musaffah 37, Abu Dhabi.',
      h1: 'Folding Mobile Scaffold Towers',
    },
    'single-width-mobile-towers': {
      title: 'Single Width Mobile Scaffold Towers | Alcoa Abu Dhabi',
      description:
        'Single-width mobile scaffold towers for hire and sale from Alcoa Musaffah 37, Abu Dhabi.',
      h1: 'Single Width Mobile Scaffold Towers',
    },
    'double-width-mobile-towers': {
      title: 'Double Width Mobile Scaffold Towers | Alcoa Abu Dhabi',
      description:
        'Double-width mobile scaffold towers for hire and sale from Alcoa Musaffah 37, Abu Dhabi.',
      h1: 'Double Width Mobile Scaffold Towers',
    },
    'stairway-mobile-towers': {
      title: 'Stairway Mobile Scaffold Towers | Product | Alcoa',
      description:
        'Stairway mobile scaffold tower product details — hire and sale from Musaffah 37, Abu Dhabi.',
      h1: 'Stairway Mobile Scaffold Towers',
    },
    'cuplock-standard': {
      title: 'Cuplock Scaffolding Rental UAE | Abu Dhabi | Alcoa',
      description:
        'Cuplock scaffolding rental and sale in Abu Dhabi & UAE. Standards, ledgers & bays from Musaffah 37. Call Alcoa.',
      h1: 'Cuplock Scaffolding Rental & Sale in UAE',
    },
  };

  const seo = SERVICE_SEO[serviceId] || {
    title: `${service.title} UAE | Rental & Sale | Alcoa`,
    description: `Rent or buy ${service.title} in Abu Dhabi & Dubai UAE. ${service.category} from Musaffah 37. Free quote from Alcoa.`,
    h1: `${service.title} for Rent & Sale in UAE`,
  };

  const breadcrumbItems = [
    { name: 'Services', path: '/construction-scaffolding-uae' },
    { name: service.title, path: `/services/${serviceId}` },
  ];

  return (
    <article className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={`${service.title} UAE, ${service.title} Abu Dhabi, ${service.category} UAE, scaffolding ${service.title.toLowerCase()} Musaffah, ${service.title} Dubai`}
        canonical={`/services/${serviceId}`}
        jsonLd={serviceJsonLd}
        jsonLdExtra={jsonLdExtra}
        faq={faq}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          ...breadcrumbItems,
        ]}
      />

      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom max-w-4xl mx-auto px-4 text-center">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            {service.category}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
            {seo.h1}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
            {service.description} Available for rental and sale across the UAE — request a free quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us" className="btn-primary">
              Get Free Quote
            </Link>
            <a href="tel:+971581375601" className="btn-secondary">
              Call +971 58 137 5601
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding py-12 sm:py-16">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md flex items-center justify-center py-8 px-4">
              <ProductImageDisplay
                productId={serviceId}
                alt={`${service.title} for rent and sale in Abu Dhabi, United Arab Emirates`}
                className="max-h-96 w-full object-contain"
                fallbackEmoji={getCategoryIcon(service.category)}
                emojiClassName="text-8xl sm:text-9xl select-none"
                iconWrapperClassName="bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full p-8"
              />
            </div>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                About {service.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{intro}</p>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Key Features & Highlights
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 dark:text-blue-100">
                Rental & Sale Pricing (AED)
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Quoted per {pricing.unit}. Daily, weekly, and monthly hire options available.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{pricing.note}</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/contact-us" className="btn-primary text-sm">
                  Request Free Quote
                </Link>
                <Link to="/faq" className="btn-secondary text-sm">
                  Pricing FAQ
                </Link>
                <Link to="/services/rental" className="text-sm text-blue-700 dark:text-blue-300 underline self-center">
                  Scaffolding rental hub
                </Link>
              </div>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                How to Order {service.title}
              </h2>
              <ol className="space-y-4">
                {process.map((step, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faq.map((item, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 list-none">
                      {item.q}
                      <FiChevronDown className="w-5 h-5 flex-shrink-0 ml-2 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-4 pb-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {related.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Related {service.category}
                </h2>
                <ul className="space-y-2">
                  {related.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to={productCategoryPath}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      View all {service.category} products →
                    </Link>
                  </li>
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Specifications
              </h3>
              <dl className="space-y-3 text-sm">
                {Object.entries(service.quickDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3 last:border-0 dark:border-gray-700"
                  >
                    <dt className="min-w-0 font-medium text-gray-600 dark:text-gray-400">{key}</dt>
                    <dd className="min-w-0 break-words text-right font-semibold text-gray-900 dark:text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 space-y-3">
                <Link
                  to={`/contact-us?service=${serviceId}`}
                  className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Quote
                </Link>
                <a
                  href="tel:+971581375601"
                  className="block w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Call Now
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-sm mb-4 text-blue-100">
                Quotes within 30 minutes during business hours.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <FiPhone className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div>+971 58 137 5601</div>
                    <div>+971 50 926 8038</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiMail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <a href={`mailto:${EMAIL_SALES}`} className="block hover:underline">{EMAIL_SALES}</a>
                    <a href={`mailto:${EMAIL_INFO}`} className="block hover:underline">{EMAIL_INFO}</a>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="pb-12 sm:pb-16">
        <div className="container-custom text-center">
          <Link
            to="/services"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
          >
            ← Back to All Services
          </Link>
        </div>
      </section>
    </article>
  );
};

export default ServiceDetail;
