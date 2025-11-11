import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiInfo, FiPackage } from 'react-icons/fi';
import { servicesData } from '../../data/servicesData';

const ProductDetail = () => {
  const { productId } = useParams();

  // Product category mappings
  const productCategories = {
    'aluminium-scaffolding': {
      title: 'Aluminium Scaffolding Products',
      description: 'Explore our complete range of lightweight, durable aluminium scaffolding systems',
      category: 'Aluminium Scaffolding',
      serviceKeys: [
        'single-width-scaffolding',
        'double-width-scaffolding',
        'stairway-scaffolding',
        'folding-tower',
        'combination-scaffolding',
        'bridge-scaffolding',
        'cantilever-scaffolding'
      ]
    },
    'ladders': {
      title: 'Professional Ladders',
      description: 'High-quality aluminium and fiberglass ladders for industrial and commercial applications',
      category: 'Ladders',
      serviceKeys: [
        'aluminium-a-type-dual',
        'aluminium-a-type-2way',
        'aluminium-straight-ladder',
        'aluminium-extension-ladder',
        'aluminium-multi-purpose',
        'aluminium-combination',
        'aluminium-rolling-platform',
        'fiberglass-a-type-oneway',
        'fiberglass-a-type-twoway'
      ]
    },
    'steel-cuplock-scaffolding': {
      title: 'Steel Cuplock Scaffolding Systems',
      description: 'Heavy-duty steel scaffolding components for large-scale construction projects',
      category: 'Steel Cuplock Scaffolding',
      serviceKeys: [
        'cuplock-standard',
        'cuplock-ledger',
        'intermediate-transom',
        'base-jacks',
        'prop-jacks',
        'steel-planks',
        'aluminium-beam',
        'wooden-planks',
        'lattice-beam'
      ]
    }
  };

  const productCategory = productCategories[productId];

  if (!productCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The product category you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">
            <FiArrowLeft className="inline mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Get all products in this category
  const categoryProducts = productCategory.serviceKeys
    .map(key => servicesData[key])
    .filter(product => product !== undefined);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-20 transition-theme">
        <div className="container-custom">
          <Link 
            to="/products" 
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
              {productCategory.title}
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary dark:text-text-secondary-dark max-w-3xl">
              {productCategory.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Highlights */}
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

                  {/* Quick Details */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center text-sm">
                      <FiInfo className="w-4 h-4 text-blue-500 mr-1" />
                      Quick Details
                    </h4>
                    <dl className="space-y-1">
                      {Object.entries(product.quickDetails).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <dt className="text-gray-600 dark:text-gray-400">{key}:</dt>
                          <dd className="text-gray-900 dark:text-white font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-2">
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

      {/* CTA Section */}
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

