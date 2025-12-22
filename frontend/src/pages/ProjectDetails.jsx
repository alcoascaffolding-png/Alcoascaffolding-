import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiExternalLink, 
  FiCalendar, 
  FiMapPin, 
  FiUsers,
  FiArrowRight,
  FiAward,
  FiCheckCircle,
  FiTool,
  FiTarget,
  FiTrendingUp
} from 'react-icons/fi';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample project data - in a real app, this would come from an API
  const projects = [
    {
      id: 1,
      title: 'Abu Dhabi Marina Tower Restoration',
      category: 'heritage',
      location: 'Abu Dhabi, UAE',
      year: '2023',
      duration: '6 months',
      team: '15 specialists',
      description: 'Complex scaffolding solution for the iconic Opera House facade restoration, requiring specialized heritage-approved methods.',
      challenge: 'Working around tourism operations while maintaining structural integrity of heritage facade',
      solution: 'Custom aluminum scaffolding with heritage-compliant finishes and tourist-safe barriers',
      results: [
        'Zero tourism disruption',
        'Heritage compliance maintained', 
        'Completed 2 weeks ahead of schedule'
      ],
      stats: { height: '60m', area: '2,500m²', complexity: 'Expert' },
      tags: ['Heritage Building', 'Tourism Active', 'Complex Access'],
      featured: true,
      fullDescription: 'This comprehensive restoration project involved the complete facade restoration of the iconic Abu Dhabi Marina Tower Opera House. Our team faced unique challenges including maintaining tourism operations, preserving heritage integrity, and ensuring public safety throughout the 6-month project duration.',
      approach: [
        'Detailed site assessment and heritage compliance review',
        'Custom scaffolding design with minimal visual impact',
        'Phased installation to maintain tourism access',
        'Continuous monitoring and safety protocols',
        'Regular stakeholder communication and updates'
      ],
      technologies: [
        'Custom Aluminum Scaffolding Systems',
        'Heritage-Compliant Protective Barriers',
        'Advanced Safety Monitoring Systems',
        'Weather-Resistant Materials',
        'Modular Installation Framework'
      ],
      awards: [
        'Heritage Preservation Excellence Award 2023',
        'Safety Innovation Recognition',
        'Client Satisfaction Excellence'
      ]
    },
    {
      id: 2,
      title: 'Abu Dhabi Financial Center',
      category: 'commercial',
      location: 'Abu Dhabi, UAE',
      year: '2023',
      duration: '4 months',
      team: '12 specialists',
      description: 'Large-scale scaffolding for shopping center expansion while maintaining full retail operations.',
      challenge: 'Maintaining customer access and safety during active retail operations',
      solution: 'Phased installation with sound barriers and protected walkways',
      results: [
        'Zero customer incidents',
        'Retail operations uninterrupted',
        'Customer satisfaction maintained'
      ],
      stats: { height: '25m', area: '4,000m²', complexity: 'Advanced' },
      tags: ['Retail Active', 'Multi-Phase', 'Public Safety'],
      fullDescription: 'The Abu Dhabi Financial Center expansion required innovative scaffolding solutions to accommodate ongoing retail operations. Our team successfully delivered a comprehensive scaffolding system that maintained full customer access while ensuring construction safety.',
      approach: [
        'Night-time installation phases to minimize disruption',
        'Sound barrier implementation for noise control',
        'Protected customer walkways and access routes',
        'Real-time monitoring of retail operations impact',
        'Flexible scheduling based on retail traffic patterns'
      ],
      technologies: [
        'Low-Noise Installation Equipment',
        'Sound Dampening Materials',
        'Flexible Access Control Systems',
        'Real-Time Monitoring Technology',
        'Quick-Deploy Safety Barriers'
      ],
      awards: [
        'Commercial Excellence Award 2023',
        'Innovation in Retail Construction',
        'Zero Disruption Achievement'
      ]
    },
    {
      id: 3,
      title: 'Abu Dhabi Residential Tower',
      category: 'residential',
      location: 'Abu Dhabi, UAE',
      year: '2022',
      duration: '8 months',
      team: '20 specialists',
      description: 'High-rise residential building construction with premium aluminum scaffolding systems.',
      challenge: 'Weather protection for luxury finishes at extreme heights',
      solution: 'Weather-resistant scaffolding with integrated protection systems',
      results: [
        'Zero weather delays',
        'Premium finish quality maintained',
        'Resident safety ensured'
      ],
      stats: { height: '120m', area: '1,800m²', complexity: 'Expert' },
      tags: ['High-Rise', 'Luxury', 'Weather Protection'],
      fullDescription: 'This high-rise residential project demanded exceptional attention to weather protection and luxury finish standards. Our scaffolding solution provided comprehensive protection against UAE\'s challenging weather conditions while maintaining the highest quality standards.',
      approach: [
        'Advanced weather monitoring and prediction systems',
        'Integrated protection for luxury finishes',
        'Multi-level safety protocols for extreme heights',
        'Resident communication and safety programs',
        'Quality assurance at every construction phase'
      ],
      technologies: [
        'Weather-Resistant Aluminum Systems',
        'Integrated Finish Protection',
        'Advanced Height Safety Equipment',
        'Weather Monitoring Technology',
        'Premium Quality Materials'
      ],
      awards: [
        'High-Rise Construction Excellence 2022',
        'Weather Innovation Award',
        'Luxury Construction Standard'
      ]
    },
    {
      id: 4,
      title: 'Abu Dhabi Refinery Maintenance',
      category: 'industrial',
      location: 'Abu Dhabi, UAE',
      year: '2023',
      duration: '3 months',
      team: '25 specialists',
      description: 'Specialized scaffolding for petroleum refinery maintenance with strict safety protocols.',
      challenge: 'Hazardous environment with explosive risk and 24/7 operations',
      solution: 'Explosion-proof scaffolding with integrated gas monitoring',
      results: [
        'Zero safety incidents',
        'Operations continued uninterrupted',
        'All safety certifications maintained'
      ],
      stats: { height: '45m', area: '3,200m²', complexity: 'Expert' },
      tags: ['Hazardous Environment', 'Industrial', '24/7 Operations'],
      fullDescription: 'This critical refinery maintenance project required the highest safety standards in a hazardous petroleum environment. Our specialized scaffolding solution enabled essential maintenance work while maintaining continuous refinery operations and zero safety incidents.',
      approach: [
        'Comprehensive hazard assessment and safety planning',
        'Explosion-proof scaffolding system design and approval',
        'Integrated gas monitoring and alert systems',
        'Continuous safety supervision and protocols',
        'Phased installation to maintain operations'
      ],
      technologies: [
        'Explosion-Proof Scaffolding Materials',
        'Integrated Gas Monitoring Systems',
        'Hazardous Area Safety Equipment',
        '24/7 Safety Monitoring',
        'Emergency Response Systems'
      ],
      awards: [
        'Excellence in Safety 2023',
        'Industrial Safety Innovation',
        'Zero Incident Achievement'
      ]
    },
    {
      id: 5,
      title: 'Abu Dhabi Heritage Mosque',
      category: 'heritage',
      location: 'Abu Dhabi, UAE',
      year: '2022',
      duration: '5 months',
      team: '8 specialists',
      description: 'Delicate scaffolding work for 150-year-old church restoration with heritage preservation focus.',
      challenge: 'Protecting delicate stonework while providing full access',
      solution: 'Minimal-impact scaffolding with protective barriers',
      results: [
        'Zero heritage damage',
        'Community access maintained',
        'Award-winning restoration'
      ],
      stats: { height: '35m', area: '800m²', complexity: 'Advanced' },
      tags: ['Heritage', 'Community', 'Award Winning'],
      fullDescription: 'The restoration of this 150-year-old heritage mosque required exceptional care and precision. Our minimal-impact scaffolding solution enabled full restoration access while preserving the delicate stonework and maintaining community access throughout the project.',
      approach: [
        'Heritage structure assessment and conservation planning',
        'Custom low-impact scaffolding design',
        'Protective barriers for delicate stonework',
        'Community engagement and access maintenance',
        'Heritage compliance monitoring and documentation'
      ],
      technologies: [
        'Minimal-Impact Scaffolding Systems',
        'Heritage-Approved Protective Materials',
        'Soft-Touch Support Systems',
        'Documentation and Monitoring Tools',
        'Community Safety Systems'
      ],
      awards: [
        'Heritage Preservation Award 2022',
        'Community Impact Excellence',
        'Restoration Quality Recognition'
      ]
    },
    {
      id: 6,
      title: 'Abu Dhabi Industrial Complex',
      category: 'industrial',
      location: 'Abu Dhabi, UAE',
      year: '2023',
      duration: '6 months',
      team: '18 specialists',
      description: 'Large-scale industrial facility construction with multiple specialized access requirements.',
      challenge: 'Coordinating with multiple trades in complex industrial environment',
      solution: 'Modular scaffolding system with flexible access points',
      results: [
        'Perfect trade coordination',
        'Schedule maintained',
        'Safety targets exceeded'
      ],
      stats: { height: '40m', area: '5,000m²', complexity: 'Expert' },
      tags: ['Multi-Trade', 'Complex', 'Large Scale'],
      fullDescription: 'This massive industrial complex required sophisticated coordination between multiple trades and specialized access solutions. Our modular scaffolding system provided flexible access points that adapted to the complex workflow requirements while maintaining strict safety standards.',
      approach: [
        'Multi-trade workflow analysis and coordination planning',
        'Modular scaffolding design for flexible access',
        'Trade-specific access point configuration',
        'Real-time coordination and adjustment protocols',
        'Integrated safety management systems'
      ],
      technologies: [
        'Modular Scaffolding Framework',
        'Flexible Access Point Systems',
        'Multi-Trade Coordination Tools',
        'Real-Time Monitoring Technology',
        'Large-Scale Safety Systems'
      ],
      awards: [
        'Industrial Construction Excellence 2023',
        'Multi-Trade Coordination Award',
        'Large-Scale Project Achievement'
      ]
    }
  ];

  const project = projects.find(p => p.id === parseInt(id));

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Project Not Found</h1>
          <Link to="/projects" className="btn-primary">Back to Projects</Link>
        </div>
      </div>
    );
  }

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Advanced': return 'bg-brand-warning-100 dark:bg-brand-warning-900 text-brand-warning-700 dark:text-brand-warning-300 border-brand-warning-200 dark:border-brand-warning-800';
      case 'Expert': return 'bg-brand-error-100 dark:bg-brand-error-900 text-brand-error-700 dark:text-brand-error-300 border-brand-error-200 dark:border-brand-error-800';
      default: return 'bg-brand-success-100 dark:bg-brand-success-900 text-brand-success-700 dark:text-brand-success-300 border-brand-success-200 dark:border-brand-success-800';
    }
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-theme">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary-50 to-brand-accent-50 dark:from-brand-primary-950 dark:to-brand-accent-950 py-16 lg:py-24 transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </button>

            <div className="max-w-4xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
                    {project.title}
                  </h1>
                  <p className="text-xl text-text-secondary dark:text-text-secondary-dark mb-6">
                    {project.description}
                  </p>
                </div>
                {project.featured && (
                  <span className="px-4 py-2 bg-accent-500 text-white text-sm rounded-full font-medium">
                    Featured Project
                  </span>
                )}
              </div>

              {/* Project Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <FiMapPin className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.stats.height}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <FiTarget className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.stats.area}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Coverage</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <FiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.duration}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                  <FiUsers className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.team}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Team Size</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Details */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Full Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Project Overview</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {project.fullDescription}
                </p>
              </motion.div>

              {/* Challenge & Solution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Challenge & Solution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <FiTool className="w-5 h-5 mr-2 text-red-500" />
                      Challenge
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{project.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                      <FiTarget className="w-5 h-5 mr-2 text-green-500" />
                      Solution
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{project.solution}</p>
                  </div>
                </div>
              </motion.div>

              {/* Approach */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Approach</h2>
                <ul className="space-y-4">
                  {project.approach.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{step}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Technologies Used */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="card"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Technologies Used</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.technologies.map((tech, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <FiTool className="w-4 h-4 text-primary-600 dark:text-primary-400 mr-3" />
                      <span className="text-gray-900 dark:text-gray-100">{tech}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Project Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{project.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</span>
                    <p className="text-gray-900 dark:text-gray-100">{project.location}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</span>
                    <p className="text-gray-900 dark:text-gray-100">{project.year}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Complexity</span>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full border ${getComplexityColor(project.stats.complexity)}`}>
                      {project.stats.complexity}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Key Results */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="card"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <FiTrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Key Results
                </h3>
                <ul className="space-y-3">
                  {project.results.map((result, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{result}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="card"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Project Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Awards */}
              {project.awards && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="card"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FiAward className="w-5 h-5 mr-2 text-accent-500" />
                    Awards & Recognition
                  </h3>
                  <ul className="space-y-2">
                    {project.awards.map((award, index) => (
                      <li key={index} className="flex items-start">
                        <FiAward className="w-4 h-4 text-accent-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{award}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card bg-primary-50 dark:bg-primary-900/20"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Start Your Project</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                  Ready to create your own success story? Contact us today to discuss your scaffolding requirements.
                </p>
                <div className="space-y-3">
                  <Link to="/contact-us" className="w-full btn-primary text-center block">
                    Get Free Quote
                  </Link>
                  <Link to="/projects" className="w-full btn-secondary text-center block">
                    View More Projects
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetails;
