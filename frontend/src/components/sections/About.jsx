import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiAward, 
  FiTrendingUp, 
  FiCheck,
  FiArrowRight 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const About = () => {
  const achievements = [
    {
      icon: FiUsers,
      number: '500+',
      label: 'Projects Completed',
      description: 'Successfully delivered scaffolding solutions'
    },
    {
      icon: FiAward,
      number: '15+',
      label: 'Years Experience',
      description: 'Serving the UAE construction industry'
    },
    {
      icon: FiTrendingUp,
      number: '98%',
      label: 'Client Satisfaction',
      description: 'Rated by our valued customers'
    }
  ];

  const values = [
    'Safety is our top priority in every project',
    'Quality equipment and professional service',
    'Competitive pricing with transparent quotes',
    'Reliable delivery and installation schedules',
    'Comprehensive insurance and certifications',
    '24/7 emergency support when you need it'
  ];

  return (
    <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-brand-primary-100 dark:bg-brand-primary-900 text-brand-primary-700 dark:text-brand-primary-300 rounded-full px-4 py-2 text-sm font-medium">
                <FiAward className="w-4 h-4" />
                <span>About Alcoa Scaffolding</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark leading-tight">
                UAE's Most
                <span className="text-gradient"> Trusted Scaffolding</span>
                <br />Solutions Provider
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                For over 15 years, Alcoa Aluminium Scaffolding has been the go-to choice 
                for construction professionals across UAE. We combine cutting-edge 
                aluminum scaffolding technology with unmatched expertise to deliver safe, 
                efficient, and cost-effective solutions.
              </p>

              <p className="text-sm sm:text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                From small residential projects to large-scale commercial developments, 
                our team of certified professionals ensures every installation meets the 
                highest safety standards while keeping your project on schedule and within budget.
              </p>

              {/* Values List */}
              <div className="space-y-2 sm:space-y-3">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-2 sm:space-x-3"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-brand-success-100 dark:bg-brand-success-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-success-600 dark:text-brand-success-400" />
                    </div>
                    <span className="text-text-primary dark:text-text-primary-dark text-sm sm:text-base">{value}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2 sm:pt-4">
                <Link 
                  to="/about-us" 
                  className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium group text-sm sm:text-base"
                >
                  <span>Learn more about our story</span>
                  <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Stats & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Image/Visual Container */}
            <div className="relative">
              {/* Background Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl overflow-hidden shadow-xl">
                <div className="w-full h-full flex items-center justify-center">
                  {/* Construction/Scaffolding Visual */}
                  <div className="w-48 h-48 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="text-8xl text-primary-600">🏗️</div>
                  </div>
                </div>
              </div>

              {/* Achievement Cards */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 right-4 sm:right-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      className="bg-surface-light dark:bg-surface-muted-dark rounded-xl shadow-lg p-2 sm:p-4 text-center"
                    >
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 bg-brand-primary-100 dark:bg-brand-primary-900 rounded-lg flex items-center justify-center`}>
                        <achievement.icon className="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary-600 dark:text-brand-primary-400" />
                      </div>
                      <div className="text-sm sm:text-xl font-bold text-text-primary dark:text-text-primary-dark">
                        {achievement.number}
                      </div>
                      <div className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark">
                        {achievement.label}
                      </div>
                      <div className="text-xs text-text-muted dark:text-text-muted-dark mt-1 hidden sm:block">
                        {achievement.description}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
