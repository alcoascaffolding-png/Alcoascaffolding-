import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiTool, 
  FiTruck, 
  FiShield, 
  FiLayers,
  FiArrowRight,
  FiCheck,
  FiInfo
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';

const Products = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Products Page Under Construction"
        subtitle="We're showcasing our premium scaffolding solutions!"
        description="Our Products page is currently being enhanced with detailed product catalogs, specifications, and interactive features. We're working hard to provide you with comprehensive information about our premium aluminum scaffolding systems and equipment."
        showContactInfo={true}
      />
    );
  }

  const products = [
    {
      id: 'aluminium-scaffolding',
      title: 'Aluminium Scaffolding',
      description: 'Lightweight, durable aluminium scaffolding and mobile tower solutions for construction and maintenance projects.',
      icon: FiTool,
      image: 'aluminium-scaffolding',
      features: [
        'Lightweight high-strength frames',
        'Quick assembly systems',
        'Multiple height options',
        'Safety guardrails and platforms',
        'Compliant with safety standards',
        'Rental and purchase options'
      ],
      specifications: {
        'Material': 'High-grade Aluminium Alloy',
        'Types': 'Single/Double Width, Stairway, Folding Towers',
        'Heights Available': '2m to 12m',
        'Load Capacity': '150-250kg per platform',
        'Standards Compliance': 'AS/NZS 1576.1, EN 1004'
      },
      applications: [
        'Building construction',
        'Maintenance work',
        'Indoor and outdoor projects',
        'Warehouse operations',
        'Event setup'
      ],
      price: 'From AED 150/day',
      category: 'aluminium'
    },
    {
      id: 'ladders',
      title: 'Ladders',
      description: 'Professional-grade aluminium and fiberglass ladders for industrial and commercial use.',
      icon: FiLayers,
      image: 'ladders',
      features: [
        'Aluminium & fiberglass options',
        'A-type, straight, and extension ladders',
        'Multi-purpose configurations',
        'Non-slip steps and feet',
        'Electrical safety rated (fiberglass)',
        'Various heights available'
      ],
      specifications: {
        'Materials': 'Aluminium Alloy, Fiberglass',
        'Types': 'A-Type, Straight, Extension, Multi-Purpose',
        'Heights': '6ft to 24ft',
        'Load Capacity': '120-150kg',
        'Safety Rating': 'Non-conductive (fiberglass)'
      },
      applications: [
        'Electrical work',
        'Painting and maintenance',
        'Warehouse operations',
        'Industrial facilities',
        'Commercial buildings'
      ],
      price: 'From AED 50/day',
      category: 'ladders'
    },
    {
      id: 'steel-cuplock-scaffolding',
      title: 'Steel Cuplock Scaffolding',
      description: 'Heavy-duty steel cuplock scaffolding systems and components for large-scale construction projects.',
      icon: FiShield,
      image: 'steel-cuplock',
      features: [
        'High load capacity',
        'Quick assembly with cup lock system',
        'Versatile configurations',
        'Heavy-duty steel construction',
        'Standards compliant',
        'Complete component range'
      ],
      specifications: {
        'Material': 'Galvanized Steel',
        'System': 'Cup Lock Connection',
        'Load Capacity': 'Up to 600kg per bay',
        'Heights Available': 'Up to 40m',
        'Standards': 'AS/NZS 1576.1, BS EN 12811'
      },
      applications: [
        'High-rise construction',
        'Bridge works',
        'Industrial projects',
        'Heavy-duty applications',
        'Large-scale renovations'
      ],
      price: 'Quote on request',
      category: 'steel'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: FiTool },
    { id: 'aluminium', name: 'Aluminium Scaffolding', icon: FiTool },
    { id: 'ladders', name: 'Ladders', icon: FiLayers },
    { id: 'steel', name: 'Steel Cuplock', icon: FiShield }
  ];

  const [activeCategory, setActiveCategory] = React.useState('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-12 sm:py-16 lg:py-24 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl sm:max-w-4xl mx-auto px-2"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
              Premium 
              <span className="text-gradient"> Scaffolding Products</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-6 sm:mb-8">
              Discover our comprehensive range of professional-grade aluminum scaffolding 
              systems designed for safety, efficiency, and versatility.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/contact-us" className="btn-primary">
                Request Quote
              </Link>
              <Link to="/contact-us" className="btn-secondary">
                Product Consultation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark transition-theme">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-brand-primary-600 text-white'
                    : 'bg-surface-muted dark:bg-surface-muted-dark text-text-secondary dark:text-text-secondary-dark hover:bg-brand-primary-50 dark:hover:bg-brand-primary-950 hover:text-brand-primary-600'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-4 sm:p-6 hover:shadow-2xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 sm:mb-6 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <product.icon className="w-16 h-16 sm:w-20 sm:h-20 text-primary-600 dark:text-gray-300" />
                  </div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white dark:bg-gray-800 rounded-lg px-2 py-1 sm:px-3 shadow-md">
                    <span className="text-xs sm:text-sm font-semibold text-primary-600 dark:text-gray-200">{product.price}</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                      {product.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <FiInfo className="w-4 h-4 text-blue-500 mr-2" />
                      Specifications
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <dl className="space-y-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-start gap-3 text-sm">
                            <dt className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{key}:</dt>
                            <dd className="text-gray-900 dark:text-gray-100 font-medium text-right">{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>

                  {/* Applications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Applications</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.applications.map((app, appIndex) => (
                        <span
                          key={appIndex}
                          className="px-3 py-1 bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                      to={`/contact-us?product=${product.id}`}
                      className="btn-primary flex-1"
                    >
                      Get Quote
                    </Link>
                    <Link 
                      to={`/products/${product.id}`}
                      className="btn-secondary flex-1"
                    >
                      Learn More
                      <FiArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-surface-muted dark:bg-surface-muted-dark py-16 transition-theme">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Need Help Choosing the Right Product?
          </h2>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto">
            Our experts can help you select the perfect scaffolding solution 
            for your specific project requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact-us" className="btn-primary">
              Speak with Expert
            </Link>
            <a href="tel:+971581375601" className="btn-secondary">
              Call +971 58 137 5601
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
