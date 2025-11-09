import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiCheck, 
  FiInfo, 
  FiArrowRight,
  FiCloud,
  FiClock,
  FiUsers,
  FiStar,
  FiDownload,
  FiPhone,
  FiMail,
  FiSun,
  FiWind,
  FiDroplet
} from 'react-icons/fi';

const TemporaryRoofing = () => {
  const features = [
    'Waterproof PVC membrane covering',
    'Wind-resistant design up to 120km/h',
    'Modular system for any size project',
    'Quick installation process',
    'Integrated lighting options',
    'Ventilation system included',
    'Custom sizing available',
    'Professional installation service'
  ];

  const specifications = {
    'Material': 'Aluminum frame with PVC membrane',
    'Wind Rating': 'Up to 120km/h wind speed',
    'Coverage': 'Custom sizes available',
    'Waterproofing': 'Welded seam construction',
    'Frame Material': 'Galvanized aluminum',
    'Membrane': 'Heavy-duty PVC',
    'Installation Time': '1-3 days depending on size',
    'Standards Compliance': 'AS/NZS 1170.2, BS 6399-2'
  };

  const applications = [
    'Construction site protection',
    'Event coverage and staging',
    'Emergency repairs and maintenance',
    'Equipment protection',
    'Outdoor work areas',
    'Temporary storage facilities',
    'Sports facility coverage',
    'Industrial project protection'
  ];

  const protectionFeatures = [
    'Waterproof membrane system',
    'Wind-resistant anchoring',
    'UV protection coating',
    'Fire-resistant materials',
    'Professional installation',
    'Regular maintenance service',
    'Emergency repair service',
    'Compliance certification'
  ];

  const advantages = [
    {
      icon: FiDroplet,
      title: 'Waterproof Protection',
      description: 'Complete protection from rain and moisture'
    },
    {
      icon: FiWind,
      title: 'Wind Resistant',
      description: 'Engineered to withstand high wind speeds'
    },
    {
      icon: FiSun,
      title: 'UV Protection',
      description: 'Protection from harmful UV rays'
    },
    {
      icon: FiShield,
      title: 'Durable Construction',
      description: 'Built to last in harsh conditions'
    }
  ];

  const pricing = [
    { period: 'Weekly', price: 'Quote', description: 'Custom pricing based on size and duration' },
    { period: 'Monthly', price: 'Quote', description: 'Best value for extended projects', popular: true },
    { period: 'Project', price: 'Quote', description: 'Complete project-based pricing' }
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
              <FiShield className="w-12 h-12 text-brand-primary-600 mr-4" />
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark lg:whitespace-nowrap">
                Temporary 
                <span className="text-gradient"> Roofing</span>
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-6 sm:mb-8">
              Professional weather protection systems to keep your project running 
              in all conditions. Custom-designed solutions for any size or duration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us?product=temporary-roofing" className="btn-primary">
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
                Complete Weather Protection Solutions
              </h2>
              <p className="text-sm sm:text-lg text-text-secondary dark:text-text-secondary-dark mb-4 sm:mb-6">
                Our temporary roofing systems provide comprehensive protection from weather 
                elements, ensuring your project continues regardless of conditions. Built 
                with durable materials and professional engineering for maximum reliability.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <FiDroplet className="w-6 h-6 text-blue-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Waterproof</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiWind className="w-6 h-6 text-gray-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Wind Resistant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiSun className="w-6 h-6 text-yellow-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">UV Protection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiShield className="w-6 h-6 text-green-500" />
                  <span className="text-text-secondary dark:text-text-secondary-dark">Durable</span>
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
                <FiShield className="w-24 h-24 sm:w-32 sm:h-32 text-brand-primary-600 dark:text-gray-300" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary-600">120km/h</div>
                  <div className="text-sm text-text-secondary dark:text-text-secondary-dark">Wind Rating</div>
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
              Why Choose Our Temporary Roofing?
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Comprehensive weather protection with professional installation and support
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
              Advanced Protection Features
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              State-of-the-art materials and engineering for maximum protection
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

      {/* Protection Features */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Comprehensive Protection
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Multiple layers of protection ensure your project stays on track
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protectionFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiShield className="w-6 h-6 text-blue-600" />
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
              Custom Pricing
            </h2>
            <p className="text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
              Pricing varies based on size, duration, and specific requirements
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
                  to="/contact-us?product=temporary-roofing&period=plan.period"
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
              Ready for Weather Protection?
            </h2>
            <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto text-white/90 leading-relaxed">
              Contact our experts today for a personalized quote and professional consultation 
              for your temporary roofing needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/contact-us?product=temporary-roofing" 
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

export default TemporaryRoofing;
