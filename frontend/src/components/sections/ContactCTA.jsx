import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiPhone, 
  FiMail, 
  FiClock, 
  FiMapPin,
  FiArrowRight,
  FiCheckCircle,
  FiAward
} from 'react-icons/fi';

const ContactCTA = () => {
  const benefits = [
    'Free consultation and site assessment',
    'Competitive pricing with no hidden fees',
    'Licensed and fully insured professionals',
    'Compliance with all safety regulations',
    '24/7 emergency support available',
    'Flexible rental and purchase options'
  ];

  const contactMethods = [
    {
      icon: FiPhone,
      title: 'Call Us',
      description: 'Speak with our experts',
      action: '+971 58 137 5601 | +971 50 926 8038',
      link: 'tel:+971581375601',
      available: 'Monday-Saturday, 8am-6pm'
    },
    {
      icon: FiMail,
      title: 'Email Us',
      description: 'Get a detailed quote',
      action: 'Sales@alcoascaffolding.com',
      link: 'mailto:Sales@alcoascaffolding.com',
      available: '24/7 Response'
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      description: 'See our equipment',
      action: 'Musaffah, Abu Dhabi',
      link: 'https://maps.google.com',
      available: 'Monday-Saturday, 8am-6pm'
    }
  ];

  return (
    <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full px-4 py-2 mb-6">
              <FiAward className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to Get Started?</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight text-gray-900 dark:text-white">
              Let's Build Something
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-orange-400 dark:to-yellow-400">
                {" "}Amazing Together
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              Ready to start your next project? Our team of scaffolding experts 
              is here to provide you with safe, reliable, and cost-effective solutions. 
              Get your free consultation today.
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-2 sm:space-x-3"
                >
                  <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                to="/contact-us" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-sm sm:text-base"
              >
                Get Free Quote
                <FiArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a 
                href="tel:+971581375601"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm sm:text-base"
              >
                <FiPhone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </div>
          </motion.div>

          {/* Right Content - Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Emergency Contact Banner */}
            <div className="bg-red-600 rounded-xl p-4 sm:p-6 text-center shadow-lg">
              <FiClock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-white" />
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">24/7 Emergency Service</h3>
              <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 opacity-90">
                Urgent scaffolding needs? We're available around the clock.
              </p>
              <a href="tel:+971581375601" className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base">
                Emergency Hotline
              </a>
            </div>

            {/* Contact Methods */}
            <div className="space-y-3 sm:space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group shadow-sm"
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <method.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold mb-1 text-gray-900 dark:text-white">{method.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-2">{method.description}</p>
                      <a 
                        href={method.link}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors text-xs sm:text-sm"
                        target={method.link.startsWith('http') ? '_blank' : undefined}
                        rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {method.action}
                      </a>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {method.available}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Quote Form Teaser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-orange-600 rounded-xl p-4 sm:p-6 shadow-lg"
            >
              <h4 className="text-base sm:text-lg font-bold mb-2 text-white">Quick Quote Request</h4>
              <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4 opacity-90">
                Get an instant estimate for your project in under 2 minutes.
              </p>
              <Link 
                to="/contact-us?form=quote" 
                className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Start Quick Quote
                <FiArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            {[
              { icon: FiAward, label: 'Licensed & Insured', sublabel: 'Fully certified' },
              { icon: FiCheckCircle, label: 'Safety Compliant', sublabel: 'UAE standards' },
              { icon: FiClock, label: 'Quick Response', sublabel: 'Same day service' },
              { icon: FiPhone, label: '24/7 Support', sublabel: 'Always available' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-white mb-1 text-xs sm:text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.sublabel}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactCTA;
