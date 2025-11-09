import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiTruck, 
  FiCheck, 
  FiInfo, 
  FiArrowRight,
  FiShield,
  FiClock,
  FiUsers,
  FiStar,
  FiDownload,
  FiPhone,
  FiMail,
  FiMove,
  FiZap
} from 'react-icons/fi';

const MobileTowers = () => {
  const features = [
    'Quick setup in under 10 minutes',
    '4 swivel wheels with brake system',
    'Lightweight aluminum construction',
    'Adjustable height platform (2.5m to 8.0m)',
    'Non-slip platform surfaces',
    'Easy repositioning without disassembly',
    'Compact storage when collapsed',
    'Professional-grade stability system'
  ];

  const specifications = {
    'Material': 'Aluminum alloy frame with steel wheels',
    'Platform Height': '2.5m to 8.0m adjustable',
    'Platform Size': '1.35m x 1.8m',
    'Load Capacity': '150kg per platform',
    'Mobility': '4 swivel wheels with brakes',
    'Weight': 'Approximately 45kg',
    'Setup Time': 'Under 10 minutes',
    'Standards Compliance': 'AS/NZS 1576.2, BS EN 1004'
  };

  const applications = [
    'Indoor maintenance and repairs',
    'Warehouse operations and stock management',
    'Event setup and decoration',
    'Light construction work',
    'Painting and decorating',
    'Electrical and HVAC maintenance',
    'Retail store maintenance',
    'Office building repairs'
  ];

  const safetyFeatures = [
    'Locking castor wheels for stability',
    'Guardrails and toe boards',
    'Non-slip platform surface',
    'Load capacity clearly marked',
    'Professional installation service',
    'Safety training included',
    'Regular inspection service',
    'Emergency brake system'
  ];

  const advantages = [
    {
      icon: FiMove,
      title: 'Easy Mobility',
      description: 'Move around your workspace without disassembly'
    },
    {
      icon: FiZap,
      title: 'Quick Setup',
      description: 'Ready to use in under 10 minutes'
    },
    {
      icon: FiShield,
      title: 'Safe Operation',
      description: 'Built-in safety features and professional training'
    },
    {
      icon: FiUsers,
      title: 'Versatile Use',
      description: 'Perfect for various indoor applications'
    }
  ];

  const pricing = [
    { period: 'Daily', price: '$65', description: 'Perfect for short-term projects' },
    { period: 'Weekly', price: '$380', description: 'Best value for medium projects', popular: true },
    { period: 'Monthly', price: '$1,200', description: 'Ideal for long-term operations' }
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
              <FiTruck className="w-12 h-12 text-brand-primary-600 mr-4" />
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark">
                Mobile 
                <span className="text-gradient"> Access Towers</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-6 sm:mb-8">
              Portable aluminum towers designed for quick access and easy repositioning. 
              Perfect for indoor maintenance, warehouse operations, and flexible work environments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us?product=mobile-towers" className="btn-primary">
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
      <section className="section-padding bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4 sm:mb-6">
                Maximum Mobility, Maximum Efficiency
              </h2>
              <p className="text-sm sm:text-lg text-text-secondary dark:text-text-secondary-dark mb-4 sm:mb-6">
                Our mobile access towers combine the convenience of portability with the safety 
                and stability of professional scaffolding. Built for indoor environments where 
                flexibility and quick repositioning are essential.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <FiMove className="w-6 h-6 text-blue-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Easy Movement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiZap className="w-6 h-6 text-yellow-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Quick Setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiShield className="w-6 h-6 text-green-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Safe Operation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiUsers className="w-6 h-6 text-purple-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Versatile Use</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-primary-100 to-brand-accent-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                <FiTruck className="w-24 h-24 sm:w-32 sm:h-32 text-brand-primary-600 dark:text-gray-300" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary-600">150kg</div>
                  <div className="text-sm text-text-secondary dark:text-text-secondary-dark">Per Platform</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Why Choose Mobile Towers?
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Experience the perfect combination of mobility, safety, and efficiency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-brand-primary-100 dark:bg-brand-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <advantage.icon className="w-8 h-8 text-brand-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-3">
                  {advantage.title}
                </h3>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  {advantage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
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
              Engineered for performance, designed for mobility, built for reliability
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
      <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
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
              <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6">
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
                  <div key={index} className="flex items-center space-x-3 p-3 bg-surface-light dark:bg-surface-dark rounded-lg">
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
      <section className="section-padding">
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
              Your safety is our priority. Every mobile tower comes with comprehensive safety features and professional support.
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
      <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
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
                  to="/contact-us?product=mobile-towers&period=plan.period"
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
              for your mobile access tower needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/contact-us?product=mobile-towers" 
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

export default MobileTowers;
