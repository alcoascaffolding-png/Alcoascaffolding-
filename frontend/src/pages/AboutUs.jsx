import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiAward, 
  FiTarget, 
  FiHeart,
  FiShield,
  FiTrendingUp,
  FiCheck,
  FiMapPin
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';

const AboutUs = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="About Us Page Under Construction"
        subtitle="We're crafting our story to share with you!"
        description="Our About Us page is currently being enhanced with detailed company history, team profiles, and our commitment to excellence. We're working hard to provide you with comprehensive information about Alcoa Scaffolding's journey and values."
        showContactInfo={true}
      />
    );
  }

  const stats = [
    { number: '15+', label: 'Years Experience', icon: FiAward },
    { number: '500+', label: 'Projects Completed', icon: FiTarget },
    { number: '50+', label: 'Expert Team Members', icon: FiUsers },
    { number: '98%', label: 'Client Satisfaction', icon: FiHeart }
  ];

  const timeline = [
    {
      year: '2008',
      title: 'Company Founded',
      description: 'Started as a small family business with a vision to provide safer scaffolding solutions.'
    },
    {
      year: '2012',
      title: 'First Major Contract',
      description: 'Secured our first commercial project with a major construction company in Abu Dhabi.'
    },
    {
      year: '2015',
      title: 'Safety Certification',
      description: 'Achieved advanced safety certifications and became industry leaders in safety protocols.'
    },
    {
      year: '2018',
      title: 'National Expansion',
      description: 'Expanded operations across UAE with offices in major cities.'
    },
    {
      year: '2023',
      title: 'Sustainable Practices',
      description: 'Launched eco-friendly initiatives and sustainable scaffolding practices.'
    }
  ];

  const values = [
    {
      icon: FiShield,
      title: 'Safety First',
      description: 'Safety is never compromised. Every project begins with comprehensive risk assessment and safety planning.'
    },
    {
      icon: FiAward,
      title: 'Quality Excellence',
      description: 'We use only premium materials and maintain the highest standards in all our services.'
    },
    {
      icon: FiUsers,
      title: 'Customer Focus',
      description: 'Our clients\' success is our success. We work closely with you to achieve your project goals.'
    },
    {
      icon: FiTrendingUp,
      title: 'Innovation',
      description: 'We continuously invest in new technologies and methods to improve our services.'
    }
  ];

  const team = [
    {
      name: 'Syed Tawakal',
      role: 'CEO & Founder',
      specialization: 'Strategic Leadership',
      image: 'syed-tawakal'
    },
    {
      name: 'Syed Babu Jani',
      role: 'Director',
      experience: '20 years',
      specialization: 'Operations Management',
      image: 'syed-babu-jani'
    },
    {
      name: 'Syed Tawakal',
      role: 'Safety Director',
      specialization: 'Safety & Compliance',
      image: 'syed-tawakal'
    },
    {
      name: 'Syed Nouman',
      role: 'Technical Manager',
      specialization: 'Engineering Solutions',
      image: 'syed-nouman'
    }
  ];


  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              About 
              <span className="text-gradient"> Alcoa Scaffolding</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Building UAE's future, one scaffold at a time. Since 2008, we've been 
              the trusted partner for construction professionals across the nation.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-surface-light dark:bg-surface-muted-dark rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-brand-primary-600 dark:text-brand-primary-400" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  {stat.number}
                </div>
                <div className="text-text-secondary dark:text-text-secondary-dark">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  Founded in 2008 by Syed Babu Jani, Alcoa Aluminium Scaffolding began as a 
                  small family business with a big vision: to revolutionize the scaffolding 
                  industry in UAE through innovative solutions and unwavering commitment to safety.
                </p>
                <p>
                  What started as a two-person operation has grown into one of UAE's 
                  most trusted scaffolding companies, serving clients from residential 
                  homeowners to major construction corporations. Our success is built on 
                  three fundamental principles: safety, quality, and customer satisfaction.
                </p>
                <p>
                  Today, we're proud to have completed over 500 projects across UAE, 
                  maintaining a 98% customer satisfaction rate and zero major safety incidents. 
                  Our team of 50+ certified professionals continues to push the boundaries 
                  of what's possible in scaffolding solutions.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Company Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              {/* Floating Achievement Card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <FiAward className="w-8 h-8 text-accent-500" />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">Industry Leader</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Safety Excellence Award 2023</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-aluminum-50 dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Journey
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Milestones that shaped our company and the scaffolding industry in UAE.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-full bg-gradient-to-b from-gray-900 to-black dark:from-blue-400 dark:to-blue-500 shadow-xl border border-gray-700 dark:border-blue-500"></div>

            <div className="space-y-12">
              {timeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className="flex-1 px-8">
                    <div className={`card ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {event.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        {event.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="w-8 h-8 bg-black dark:bg-blue-400 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl z-10 ring-4 ring-gray-300 dark:ring-blue-600"></div>

                  <div className="flex-1 px-8"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do and shape our company culture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <value.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-aluminum-50 dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the experienced professionals who lead our company and drive our success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center hover:shadow-xl transition-all duration-300"
              >
                {/* Team Member Photo */}
                <div className="w-24 h-24 bg-gradient-to-br from-primary-200 to-accent-200 dark:from-gray-700 dark:to-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-700 dark:text-gray-200">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
                  {member.role}
                </p>
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p>{member.experience}</p>
                  <p className="font-medium">{member.specialization}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Work with UAE's Best?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who trust Alcoa Scaffolding 
              for their most important projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact-us" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white dark:bg-gray-800 text-black dark:text-white font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-black dark:border-white shadow-lg transition-colors"
              >
                Start Your Project
              </Link>
              <Link 
                to="/projects" 
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-black dark:text-white font-semibold rounded-lg border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-lg transition-colors"
              >
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
