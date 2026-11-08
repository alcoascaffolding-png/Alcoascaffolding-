import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiInfo, FiPackage } from 'react-icons/fi';
import { productCategories } from '../../data/productCategories';
import { servicesData } from '../../data/servicesData';
import ProductImageDisplay from '../../components/common/ProductImageDisplay';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import QuickAnswer from '../../components/common/QuickAnswer';
import { getCategoryIcon } from '../../data/productImageMap';
import { getServicePricing } from '../../utils/serviceRichContent';
import SEOHead from '../../components/common/SEOHead';
import { buildServiceSchema } from '../../utils/schemaBuilders';
import { SITE_URL } from '../../data/businessFacts';
import { getProductSeo } from '../../seo/productSeo';
import { serviceHref } from '../../seo/redirects';

const PRODUCTS_HUB = '/aluminum-scaffolding-abu-dhabi';

const ProductDetail = () => {
  const { productId } = useParams();

  const productCategory = productCategories[productId];

  if (!productCategory) {
    return <Navigate to={PRODUCTS_HUB} replace />;
  }

  const categoryItems = productCategory.serviceKeys
    .map((key) => ({ key, product: servicesData[key] }))
    .filter((item) => item.product !== undefined);

  const categoryPricing = getServicePricing({ category: productCategory.category });
  const productSeo = getProductSeo(productId, productCategory);

  const breadcrumbItems = [
    { name: 'Products', path: PRODUCTS_HUB },
    { name: productCategory.title, path: `/products/${productId}` },
  ];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      <SEOHead
        title={productSeo.title}
        description={productSeo.description}
        canonical={`/products/${productId}`}
        jsonLd={buildServiceSchema({
          name: productSeo.h1,
          description: productSeo.description,
          url: `${SITE_URL}/products/${productId}`,
          serviceType: `${productCategory.category} Rental and Sale`,
        })}
        faq={productSeo.faq}
        breadcrumbs={[{ name: 'Home', path: '/' }, ...breadcrumbItems]}
      />
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-20 transition-theme">
        <div className="container-custom">
          <Breadcrumbs items={breadcrumbItems} />
          <Link
            to={PRODUCTS_HUB}
            className="inline-flex items-center text-brand-primary-600 dark:text-brand-primary-400 hover:text-brand-primary-700 dark:hover:text-brand-primary-300 mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Products
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              {productSeo.h1}
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary dark:text-text-secondary-dark max-w-3xl mb-6">
              {productCategory.description} {categoryPricing.note}
            </p>
            <QuickAnswer text={productSeo.quickAnswer} className="max-w-3xl" />
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
            {productCategory.title} range
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryItems.map(({ key, product }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                  <ProductImageDisplay
                    productId={key}
                    alt={`${product.title} — ${productCategory.category.toLowerCase()} for rent and sale in Abu Dhabi`}
                    fallbackEmoji={getCategoryIcon(product.category)}
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    <Link to={serviceHref(key)} className="hover:underline">
                      {product.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm">
                      <FiCheck className="w-4 h-4 text-green-500 mr-1" />
                      Key Features
                    </h4>
                    <ul className="space-y-1">
                      {product.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm">
                      <FiInfo className="w-4 h-4 text-blue-500 mr-1" />
                      Quick Details
                    </h4>
                    <dl className="space-y-1">
                      {Object.entries(product.quickDetails).slice(0, 2).map(([detailKey, value]) => (
                        <div key={detailKey} className="flex items-start justify-between gap-3 text-xs">
                          <dt className="min-w-0 text-gray-600 dark:text-gray-400">{detailKey}:</dt>
                          <dd className="min-w-0 break-words text-right font-medium text-gray-900 dark:text-white">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={serviceHref(key)}
                      className="btn-secondary flex-1 text-sm py-2"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/contact-us?product=${product.title}`}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      Get Quote
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {productSeo.sections?.map((section) => (
        <section key={section.h2} className="py-10 border-t border-gray-100 dark:border-gray-800">
          <div className="container-custom max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{section.h2}</h2>
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {section.bullets?.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
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

      {productSeo.faq?.length > 0 && (
        <section className="py-12 border-t border-gray-100 dark:border-gray-800">
          <div className="container-custom max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {productCategory.title} — FAQ
            </h2>
            <div className="space-y-3">
              {productSeo.faq.map((item) => (
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

      <section className="bg-surface-muted dark:bg-surface-muted-dark py-12 sm:py-16 transition-theme">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <FiPackage className="w-12 h-12 text-brand-primary-600 dark:text-brand-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Need Help Choosing the Right Product?
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark mb-6 max-w-2xl mx-auto">
              Our experts can help you select the perfect solution for your project requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-primary">
                Contact Our Experts
              </Link>
              <a href="tel:+971581375601" className="btn-secondary">
                Call +971 58 137 5601
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
