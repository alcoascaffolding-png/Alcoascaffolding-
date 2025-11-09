import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiShield, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiBook,
  FiUsers,
  FiAward,
  FiFileText,
  FiDownload,
  FiExternalLink
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';

const SafetyStandards = () => {
const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Safety Standards Page Under Construction"
        subtitle="We're documenting our commitment to safety!"
        description="Our Safety Standards page is currently being enhanced with comprehensive safety protocols, compliance information, and training resources. We're working hard to provide you with detailed insights into our safety-first approach and industry-leading standards."
        showContactInfo={true}
      />
    );
  }

  const safetyStats = [
    { number: '0', label: 'Major Incidents', sublabel: 'Since 2008' },
    { number: '100%', label: 'Compliance Rate', sublabel: 'All projects' },
    { number: '50+', label: 'Trained Staff', sublabel: 'Safety trained' },
    { number: '24/7', label: 'Safety Support', sublabel: 'Always available' }
  ];

  const standards = [
    {
      code: 'AS/NZS 1576.1',
      title: 'Scaffolding - General requirements',
      description: 'Primary UAE standard for scaffolding design, construction, and use.',
      compliance: 'Compliant',
      icon: FiShield
    },
    {
      code: 'AS/NZS 1576.2',
      title: 'Scaffolding - Couplers and fittings',
      description: 'Standards for scaffolding couplers, fittings, and accessories.',
      compliance: 'Compliant',
      icon: FiCheckCircle
    },
    {
      code: 'AS/NZS 1576.3',
      title: 'Scaffolding - Prefabricated and tube-and-coupler',
      description: 'Requirements for prefabricated scaffolding systems.',
      compliance: 'Compliant',
      icon: FiAward
    },
    {
      code: 'WHS Regulations',
      title: 'Work Health and Safety',
      description: 'Comprehensive workplace health and safety compliance.',
      compliance: 'Compliant',
      icon: FiUsers
    }
  ];

  const safetyProcedures = [
    {
      title: 'Pre-Installation Safety Assessment',
      description: 'Comprehensive site evaluation and risk assessment before any work begins.',
      steps: [
        'Site hazard identification',
        'Soil and foundation analysis',
        'Weather condition assessment',
        'Traffic and pedestrian impact evaluation',
        'Emergency access planning'
      ]
    },
    {
      title: 'Installation Safety Protocol',
      description: 'Strict safety procedures during scaffolding installation and setup.',
      steps: [
        'Personal protective equipment (PPE) mandatory',
        'Fall protection systems installed first',
        'Regular structural integrity checks',
        'Tool safety and secure storage',
        'Communication protocols established'
      ]
    },
    {
      title: 'Ongoing Safety Monitoring',
      description: 'Continuous safety monitoring throughout project duration.',
      steps: [
        'Daily safety inspections',
        'Weather impact assessments',
        'Load capacity monitoring',
        'Access control and security',
        'Emergency response readiness'
      ]
    },
    {
      title: 'Dismantling Safety Process',
      description: 'Safe and systematic scaffolding removal procedures.',
      steps: [
        'Reverse installation sequence',
        'Component inspection during removal',
        'Safe material handling and transport',
        'Site cleanup and restoration',
        'Final safety inspection and clearance'
      ]
    }
  ];

  const training = [
    {
      course: 'Basic Scaffolding Safety',
      duration: '1 Day',
      certification: 'Industry Training',
      topics: ['Safety regulations', 'PPE usage', 'Basic inspection', 'Emergency procedures']
    },
    {
      course: 'Advanced Scaffolding Operations',
      duration: '3 Days',
      certification: 'Professional Training',
      topics: ['Complex installations', 'Load calculations', 'Risk assessment', 'Team leadership']
    },
    {
      course: 'Safety Inspector Training',
      duration: '5 Days',
      certification: 'Official Training',
      topics: ['Inspection protocols', 'Compliance auditing', 'Report writing', 'Legal requirements']
    },
    {
      course: 'Emergency Response Training',
      duration: '2 Days',
      certification: 'First Aid Training',
      topics: ['Emergency procedures', 'First aid', 'Evacuation protocols', 'Incident reporting']
    }
  ];

  const documents = [
    {
      title: 'Safety Manual 2024',
      description: 'Comprehensive safety guidelines and procedures for all scaffolding operations.',
      size: '2.5 MB',
      type: 'PDF',
      pages: '45 pages'
    },
    {
      title: 'Emergency Response Plan',
      description: 'Detailed emergency response procedures and contact information.',
      size: '800 KB',
      type: 'PDF',
      pages: '12 pages'
    },
    {
      title: 'Daily Inspection Checklist',
      description: 'Standard daily inspection checklist for scaffolding safety assessment.',
      size: '250 KB',
      type: 'PDF',
      pages: '3 pages'
    },
    {
      title: 'Incident Report Form',
      description: 'Official incident reporting form for safety events and near misses.',
      size: '180 KB',
      type: 'PDF',
      pages: '2 pages'
    }
  ];

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-success-50 to-brand-primary-50 dark:from-brand-success-950 dark:to-brand-primary-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="w-20 h-20 bg-brand-success-100 dark:bg-brand-success-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShield className="w-10 h-10 text-brand-success-600 dark:text-brand-success-400" />
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Safety 
              <span className="text-gradient"> Standards</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              At Alcoa Scaffolding, safety isn't just a priority—it's our foundation. 
              Learn about our comprehensive safety standards and commitment to zero incidents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-primary">
                Safety Consultation
              </Link>
              <button className="btn-secondary">
                <FiDownload className="w-4 h-4 mr-2" />
                Download Safety Manual
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Safety Stats */}
      <section className="py-16 bg-surface-light dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Compliance */}
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
              UAE Standards Compliance
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We maintain full compliance with all relevant UAE standards 
              and continuously update our practices as regulations evolve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {standards.map((standard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <standard.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {standard.code}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                        {standard.compliance}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {standard.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {standard.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Procedures */}
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
              Safety Procedures
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive safety procedures cover every aspect of scaffolding 
              operations from initial assessment to final dismantling.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {safetyProcedures.map((procedure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {procedure.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {procedure.description}
                </p>
                
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Steps:</h4>
                <ul className="space-y-2">
                  {procedure.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-3">
                      <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Programs */}
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
              Safety Training Programs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive training programs to ensure all team members and clients 
              understand and implement proper safety procedures.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {training.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {course.course}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                    {course.duration}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <FiAward className="w-4 h-4 text-accent-500" />
                    <span>{course.certification}</span>
                  </span>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Course Topics:</h4>
                <ul className="space-y-2 mb-6">
                  {course.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{topic}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full btn-secondary">
                  <FiBook className="w-4 h-4 mr-2" />
                  Enroll Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Procedures */}
      <section className="bg-red-50 dark:bg-red-950 py-16 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <FiAlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Emergency Procedures
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Immediate action steps for emergency situations. All team members 
              are trained in these procedures and emergency contacts are always available.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Structural Emergency',
                number: '000',
                description: 'Call emergency services immediately',
                actions: ['Evacuate area', 'Call emergency services', 'Contact site supervisor', 'Document incident']
              },
              {
                title: 'Medical Emergency',
                number: '000',
                description: 'Call ambulance and provide first aid',
                actions: ['Ensure scene safety', 'Call ambulance', 'Provide first aid', 'Notify management']
              },
              {
                title: 'Safety Incident',
                number: '555-911-HELP',
                description: 'Report to Alcoa emergency hotline',
                actions: ['Secure the area', 'Call safety hotline', 'Document details', 'Wait for instructions']
              }
            ].map((emergency, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transition-theme"
              >
                <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">
                  {emergency.title}
                </h3>
                
                <div className="bg-red-600 dark:bg-red-700 text-white rounded-lg p-4 mb-4 text-center">
                  <div className="text-2xl font-bold mb-1">{emergency.number}</div>
                  <div className="text-sm">{emergency.description}</div>
                </div>

                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Action Steps:</h4>
                <ol className="space-y-1">
                  {emergency.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start space-x-2 text-sm">
                      <span className="w-5 h-5 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {actionIndex + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{action}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Documents */}
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
              Safety Documentation
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Download our comprehensive safety documents, manuals, and forms 
              to ensure proper safety procedures on your project.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <FiFileText className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {doc.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.type} • {doc.size} • {doc.pages}
                      </div>
                      <button className="btn-primary text-sm">
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Safety is Our Commitment
            </h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Experience the peace of mind that comes with UAE's safest 
              scaffolding solutions. Contact us to learn more about our safety standards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-secondary bg-white text-green-600 hover:bg-gray-100 border-white">
                Safety Consultation
              </Link>
              <Link to="/services/training" className="btn-secondary border-white text-white hover:bg-white/10">
                <FiUsers className="w-4 h-4 mr-2" />
                Training Programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SafetyStandards;
