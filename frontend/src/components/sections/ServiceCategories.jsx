import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiTool } from 'react-icons/fi';

const ServiceCategories = () => {
  const categories = [
    // Aluminium Scaffolding
    { title: 'Aluminium scaffolding', link: '/services/aluminium-scaffolding', type: 'service' },
    { title: 'Aluminium scaffolding Abu Dhabi', link: '/services/aluminium-scaffolding?location=abu-dhabi', type: 'location' },
    { title: 'Aluminium scaffolding Musaffah', link: '/services/aluminium-scaffolding?location=musaffah', type: 'location' },
    { title: 'Aluminium scaffolding Dubai', link: '/services/aluminium-scaffolding?location=dubai', type: 'location' },
    { title: 'Aluminium scaffolding UAE', link: '/services/aluminium-scaffolding?location=uae', type: 'location' },
    { title: 'Aluminium scaffolding near me', link: '/services/aluminium-scaffolding?location=near-me', type: 'location' },
    { title: 'Aluminium scaffolding manufacture', link: '/services/aluminium-scaffolding?type=manufacture', type: 'service' },
    { title: 'Aluminium scaffolding supplier', link: '/services/aluminium-scaffolding?type=supplier', type: 'service' },
    
    // A Type Ladder
    { title: 'A Type Ladder', link: '/services/a-type-ladder', type: 'service' },
    { title: 'A Type Ladder Abu Dhabi', link: '/services/a-type-ladder?location=abu-dhabi', type: 'location' },
    { title: 'A Type Ladder Musaffah', link: '/services/a-type-ladder?location=musaffah', type: 'location' },
    { title: 'A Type Ladder Dubai', link: '/services/a-type-ladder?location=dubai', type: 'location' },
    { title: 'A Type Ladder manufacture', link: '/services/ladder-manufacturers?type=a-type', type: 'service' },
    { title: 'A Type Ladder supplier', link: '/services/ladder-manufacturers?type=a-type', type: 'service' },
    { title: 'A Type Ladder near me', link: '/services/a-type-ladder?location=near-me', type: 'location' },
    
    // Scaffolding General
    { title: 'Scaffolding', link: '/services', type: 'service' },
    { title: 'Scaffolding Abu Dhabi', link: '/services?location=abu-dhabi', type: 'location' },
    { title: 'Scaffolding Musaffah', link: '/services?location=musaffah', type: 'location' },
    { title: 'Scaffolding Dubai', link: '/services?location=dubai', type: 'location' },
    { title: 'Scaffolding near me', link: '/services?location=near-me', type: 'location' },
    
    // Scaffolding Rental
    { title: 'Scaffolding Rental near me', link: '/services/rental?location=near-me', type: 'location' },
    { title: 'Scaffolding Rental Abu Dhabi', link: '/services/rental?location=abu-dhabi', type: 'location' },
    { title: 'Scaffolding Rental Musaffah', link: '/services/rental?location=musaffah', type: 'location' },
    { title: 'Scaffolding Rental Dubai', link: '/services/rental?location=dubai', type: 'location' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
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
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-accent-100 dark:bg-brand-accent-900 text-brand-accent-700 dark:text-brand-accent-300 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FiMapPin className="w-4 h-4" />
            <span>Service Locations</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-3 sm:mb-4">
            Find Services Near You
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
            Quick access to our scaffolding and ladder services across UAE locations
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <Link
                to={category.link}
                className="block w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-700 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-gray-600 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-medium">
                    {category.title}
                  </span>
                  {category.type === 'location' ? (
                    <FiMapPin className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <FiTool className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8 sm:mt-12"
        >
          <p className="text-sm sm:text-base text-text-secondary dark:text-text-secondary-dark mb-4 sm:mb-6">
            Can't find your location? We serve all areas across UAE!
          </p>
          <Link 
            to="/contact-us"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 dark:bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Contact Us for Your Location
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCategories;

