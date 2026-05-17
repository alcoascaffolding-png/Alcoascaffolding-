import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiCheck, FiShield, FiExternalLink } from 'react-icons/fi';
import certificateImg from '../../assets/certificate.jpg';

const Certification = () => {
  const highlights = [
    'ISO 9001:2015 Quality Management Systems certified',
    'Manufacturing, supply, rental, and maintenance of scaffolding & ladders',
    'Erection and dismantling of light and heavy-duty access systems',
    'Aluminium and steel scaffolding for construction & industrial projects',
    'Compliance with applicable UAE safety and quality standards',
    'Client-specific solutions with documented quality processes',
  ];

  const benefits = [
    {
      title: 'Consistent Quality',
      description: 'Every project follows documented procedures from delivery through installation.',
    },
    {
      title: 'Safety Assurance',
      description: 'Certified processes help protect your team and worksite at every stage.',
    },
    {
      title: 'Trusted Partner',
      description: 'Independent third-party verification you can share with clients and inspectors.',
    },
  ];

  const certificateDetails = [
    { label: 'Certificate No.', value: '14143790' },
    { label: 'Issued by', value: 'QA Certification' },
    // { label: 'Valid until', value: '26 April 2029' },
    { label: 'Status', value: 'Full Registration' },
  ];

  return (
    <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-primary-100 dark:bg-brand-primary-900 text-brand-primary-700 dark:text-brand-primary-300 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FiAward className="w-4 h-4" />
            <span>Our Certification</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-3 sm:mb-4">
            ISO 9001:2015
            <span className="text-gradient"> Certified</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
            Alcoa Aluminium Scaffolding is registered for ISO 9001:2015 Quality Management
            Systems — your assurance of consistent quality, safety, and professional service
            across the UAE.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1 space-y-6 sm:space-y-8"
          >
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                Certified Scope of Activities
              </h3>
              <p className="text-sm sm:text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                Our certification covers manufacturing, supply, erection, dismantling, rental, and
                maintenance of aluminium and steel scaffolding and ladders for construction,
                industrial, and maintenance projects throughout the UAE.
              </p>
              <p className="text-sm sm:text-base text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                We provide safe and efficient access solutions tailored to meet client-specific
                requirements while ensuring compliance with applicable safety and quality standards
                on every job — from residential builds to large commercial and industrial sites.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
                <FiShield className="w-5 h-5 text-brand-primary-600 dark:text-brand-primary-400" />
                What Our Certification Covers
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {highlights.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-brand-success-100 dark:bg-brand-success-900 flex items-center justify-center">
                      <FiCheck className="w-3 h-3 text-brand-success-600 dark:text-brand-success-400" />
                    </span>
                    <span className="text-sm sm:text-base text-text-secondary dark:text-text-secondary-dark">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                Why It Matters for Your Project
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-text-primary dark:text-text-primary-dark mb-1">
                      {benefit.title}
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary dark:text-text-primary-dark">
                Certificate Details
              </h3>
              <div className="flex gap-2 flex-wrap">
                {certificateDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 px-2 py-2"
                  >
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark inline mr-1">
                      {detail.label}:
                    </p>
                    <p className="text-xs font-semibold text-text-primary dark:text-text-primary-dark inline">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2 flex justify-center lg:sticky lg:top-24"
          >
            <div className="relative w-full max-w-md sm:max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark ring-1 ring-black/5 dark:ring-white/10"
              >
                <img
                  src={certificateImg}
                  alt="ISO 9001:2015 Certificate of Registration for Alcoa Aluminium Scaffolding L.L.C - S.P.C"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </motion.div>
              <div className="absolute -bottom-3 -right-3 w-full h-full rounded-xl bg-brand-primary-500/10 dark:bg-brand-primary-400/10 -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Certification;
