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
    buildProductSchema(serviceId, service, pricing),
    isHowToService(serviceId) ? buildHowToSchema(serviceId, service) : null,
  ].filter(Boolean);

  const serviceJsonLd = buildEnhancedServiceSchema(serviceId, service, pricing);

  const breadcrumbItems = [
    { name: 'Services', path: '/services' },
    { name: service.title, path: `/services/${serviceId}` },
  ];

  return (
    <article className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <SEOHead
        title={`${service.title} in UAE | Rental & Sale | Alcoa Scaffold`}
        description={`Rent or buy ${service.title} in Dubai & Abu Dhabi from AED ${pricing.daily[0]}/day. Fast UAE delivery, certified ${service.category.toLowerCase()}, free quote.`}
        keywords={`${service.title} UAE, ${service.title} Dubai, ${service.title} Abu Dhabi, ${service.category} UAE, scaffolding ${service.title.toLowerCase()} Musaffah, ${service.title} price AED`}
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
            {service.title} in <span className="text-gradient">Dubai & Abu Dhabi</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
            {service.description} Rental from AED {pricing.daily[0]}–{pricing.daily[1]}/day. Sale and hire across UAE.
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
                alt={`${service.title} for rent and sale in Dubai and Abu Dhabi`}
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-blue-200 dark:border-blue-700">
                      <th className="py-2 pr-4 font-semibold text-gray-900 dark:text-white">Period</th>
                      <th className="py-2 font-semibold text-gray-900 dark:text-white">Price range</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 dark:text-gray-300">
                    <tr className="border-b border-blue-100 dark:border-blue-800">
                      <td className="py-3 pr-4">Daily (per {pricing.unit})</td>
                      <td className="py-3 font-semibold">AED {pricing.daily[0]} – {pricing.daily[1]}</td>
                    </tr>
                    {pricing.weekly && (
                      <tr className="border-b border-blue-100 dark:border-blue-800">
                        <td className="py-3 pr-4">Weekly</td>
                        <td className="py-3 font-semibold">AED {pricing.weekly[0]} – {pricing.weekly[1]}</td>
                      </tr>
                    )}
                    {pricing.monthly && (
                      <tr className="border-b border-blue-100 dark:border-blue-800">
                        <td className="py-3 pr-4">Monthly</td>
                        <td className="py-3 font-semibold">AED {pricing.monthly[0]} – {pricing.monthly[1]}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">{pricing.note}</p>
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
                    className="flex items-start justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <dt className="text-gray-600 dark:text-gray-400 font-medium">{key}</dt>
                    <dd className="text-gray-900 dark:text-white text-right font-semibold">{value}</dd>
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
                  className="block w-full text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Call: +971 58 137 5601
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
                  <div>Sales@alcoascaffolding.com</div>
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
