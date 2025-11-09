import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiShield, 
  FiClock, 
  FiAward, 
  FiTool, 
  FiUsers, 
  FiThumbsUp 
} from 'react-icons/fi';

const Features = () => {
  const features = [
    {
      icon: FiShield,
      title: 'Safety First',
      description: 'Fully compliant with UAE safety standards and regulations. Our team is trained in the latest safety protocols.',
      color: 'bg-brand-success-100 dark:bg-brand-success-900 text-brand-success-600 dark:text-brand-success-400',
      stats: '100% Compliance'
    },
    {
      icon: FiClock,
      title: 'Fast Installation',
      description: 'Quick and efficient setup with minimal disruption to your project timeline. Same-day service available.',
      color: 'bg-brand-primary-100 dark:bg-brand-primary-900 text-brand-primary-600 dark:text-brand-primary-400',
      stats: '24hr Service'
    },
    {
      icon: FiAward,
      title: 'Industry Leaders',
      description: '15+ years of experience serving residential, commercial, and industrial clients across Abu Dhabi and UAE.',
      color: 'bg-brand-secondary-100 dark:bg-brand-secondary-900 text-brand-secondary-600 dark:text-brand-secondary-400',
      stats: '15+ Years'
    },
    {
      icon: FiTool,
      title: 'Quality Equipment',
      description: 'Premium aluminum scaffolding systems that are lightweight, durable, and suitable for all project types.',
      color: 'bg-orange-100 text-orange-600',
      stats: 'Premium Grade'
    },
    {
      icon: FiUsers,
      title: 'Expert Team',
      description: 'Professional team with extensive training in scaffolding installation, maintenance, and safety.',
      color: 'bg-indigo-100 text-indigo-600',
      stats: 'Expert Pros'
    },
    {
      icon: FiThumbsUp,
      title: 'Customer Satisfaction',
      description: 'Committed to exceeding expectations with reliable service and competitive pricing for every project.',
      color: 'bg-brand-accent-100 dark:bg-brand-accent-900 text-brand-accent-600 dark:text-brand-accent-400',
      stats: '98% Satisfaction'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="section-padding bg-surface-light dark:bg-surface-dark transition-theme">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-3 sm:mb-4">
            Why Choose Alcoa Scaffolding?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
            We combine years of experience with modern equipment and safety-first 
            practices to deliver exceptional scaffolding solutions for projects of all sizes.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group h-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                {/* Icon */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {feature.stats}
                    </span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8 sm:mt-12 lg:mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Ready to Start Your Project?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              Get a free consultation and quote for your scaffolding needs today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                Request Free Quote
              </button>
              <button className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 text-sm sm:text-base">
                Schedule Consultation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
