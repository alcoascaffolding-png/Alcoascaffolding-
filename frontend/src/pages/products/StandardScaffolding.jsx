import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiTool, 
  FiCheck, 
  FiInfo, 
  FiArrowRight,
  FiShield,
  FiClock,
  FiUsers,
  FiStar,
  FiDownload,
  FiPhone,
  FiMail
} from 'react-icons/fi';

const StandardScaffolding = () => {
  const features = [
    'Lightweight aluminum construction for easy handling',
    'Quick assembly and disassembly system',
    'Multiple height configurations from 2m to 20m',
    'Weather-resistant materials and coatings',
    'Load capacity up to 250kg/m²',
    'Modular design for flexible configurations',
    'Anti-slip platform surfaces',
    'Galvanized steel fittings for durability'
  ];

  const specifications = {
    'Material': 'High-grade aluminum alloy',
    'Load Capacity': '250kg/m² (live load)',
    'Heights Available': '2m to 20m in 2m increments',
    'Bay Widths': '1.2m, 1.5m, 2.0m',
    'Platform Length': '2.0m, 2.5m, 3.0m',
    'Standards Compliance': 'AS/NZS 1576.1, BS EN 12811-1',
    'Weight': 'Approximately 15kg per bay',
    'Surface Treatment': 'Anodized aluminum with powder coating'
  };

  const applications = [
    'Building maintenance and repairs',
    'Construction and renovation projects',
    'Painting and decorating work',
    'Window cleaning and installation',
    'Facade restoration',
    'Signage installation',
    'Lighting maintenance',
    'HVAC system installation'
  ];

  const safetyFeatures = [
    'Guardrails and toe boards included',
    'Non-slip platform surfaces',
    'Secure locking mechanisms',
    'Load capacity clearly marked',
    'Regular safety inspections',
    'Professional installation service',
    'Safety training available',
    'Compliance with local regulations'
  ];

  const pricing = [
    { period: 'Daily', price: '$45', description: 'Perfect for short-term projects' },
    { period: 'Weekly', price: '$280', description: 'Best value for medium projects', popular: true },
    { period: 'Monthly', price: '$950', description: 'Ideal for long-term construction' }
  ];

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
            <div className="flex items-center justify-center mb-6">
              <FiTool className="w-12 h-12 text-brand-primary-600 mr-4" />
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark">
                Standard 
                <span className="text-gradient"> Scaffolding</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-6 sm:mb-8">
              Professional-grade aluminum scaffolding systems designed for versatility, 
              safety, and efficiency in construction and maintenance projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us?product=standard-scaffolding" className="btn-primary">
                Get Quote
              </Link>
              <Link to="/products" className="btn-secondary">
                View All Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
                Versatile & Reliable Scaffolding Solution
              </h2>
              <p className="text-sm sm:text-lg text-text-secondary dark:text-text-secondary-dark mb-4 sm:mb-6">
                Our standard scaffolding systems are engineered for maximum versatility and safety. 
                Built with high-grade aluminum alloy, these systems provide the perfect balance of 
                strength, durability, and ease of use for a wide range of construction and maintenance applications.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <FiShield className="w-6 h-6 text-green-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Safety First</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiClock className="w-6 h-6 text-blue-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Quick Setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUsers className="w-6 h-6 text-purple-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Professional Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiStar className="w-6 h-6 text-yellow-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Premium Quality</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-primary-100 to-brand-accent-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                <FiTool className="w-24 h-24 sm:w-32 sm:h-32 text-brand-primary-600 dark:text-gray-300" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary-600">250kg/m²</div>
                  <div className="text-sm text-text-secondary dark:text-text-secondary-dark">Load Capacity</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Key Features & Benefits
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Engineered for performance, designed for safety, built for reliability
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand-primary-100 dark:bg-brand-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck className="w-6 h-6 text-brand-primary-600" />
                </div>
                <p className="text-text-secondary dark:text-text-secondary-dark">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
                Technical Specifications
              </h2>
              <div className="bg-surface-muted dark:bg-surface-muted-dark rounded-xl p-6">
                <dl className="space-y-4">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-border-light dark:border-border-dark last:border-b-0">
                      <dt className="text-text-secondary dark:text-text-secondary-dark font-medium">{key}:</dt>
                      <dd className="text-text-primary dark:text-text-primary-dark font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
                Common Applications
              </h2>
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-surface-muted dark:bg-surface-muted-dark rounded-lg">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-text-secondary dark:text-text-secondary-dark">{app}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Safety First
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Your safety is our priority. Every scaffolding system comes with comprehensive safety features and professional support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-text-secondary dark:text-text-secondary-dark">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Flexible Pricing Options
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Choose the rental period that best fits your project timeline and budget
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`card text-center hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-brand-primary-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-brand-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  {plan.period}
                </h3>
                <div className="text-4xl font-bold text-brand-primary-600 mb-2">
                  {plan.price}
                </div>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                  {plan.description}
                </p>
                <Link 
                  to="/contact-us?product=standard-scaffolding&period=plan.period"
                  className="btn-primary w-full"
                >
                  Get Quote
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-brand-primary-600 to-brand-accent-500 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18h-2v2.5h-2.5v2h2.5v2.5h2v-2.5h2.5v-2H20zM20 2V0h-2v2h-2.5v2h2.5v2h2V4h2.5V2H20zM2 20.5v-2H0v2H-2.5v2H0v2.5h2v-2.5h2.5v-2H2zM2 2V0H0v2H-2.5v2H0v2h2V4h2.5V2H2z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto text-white/90 leading-relaxed">
              Contact our experts today for a personalized quote and professional consultation 
              for your scaffolding needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/contact-us?product=standard-scaffolding" 
                className="bg-white text-brand-primary-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center min-w-[200px]"
              >
                Request Quote
              </Link>
              <a 
                href="tel:+971581375601" 
                className="border-2 border-white text-white hover:bg-white hover:text-brand-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center min-w-[200px]"
              >
                <FiPhone className="w-5 h-5 mr-2" />
                Call Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StandardScaffolding;
