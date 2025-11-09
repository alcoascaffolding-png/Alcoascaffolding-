import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiFilter, 
  FiExternalLink, 
  FiCalendar, 
  FiMapPin, 
  FiUsers,
  FiArrowRight,
  FiAward
} from 'react-icons/fi';
import UnderConstruction from '../components/common/UnderConstruction';

const ProjectGallery = () => {
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Show UnderConstruction page if enabled
  if (showUnderConstruction) {
    return (
      <UnderConstruction
        title="Project Gallery Under Construction"
        subtitle="We're curating our best work for you!"
        description="Our Project Gallery is currently being enhanced with high-quality project showcases, detailed case studies, and interactive features. We're working hard to provide you with comprehensive insights into our successful scaffolding projects across UAE."
        showContactInfo={true}
      />
    );
  }

  const filters = [
    { id: 'all', name: 'All Projects' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'industrial', name: 'Industrial' },
    { id: 'heritage', name: 'Heritage' },
  ];

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
      featured: true
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
      tags: ['Retail Active', 'Multi-Phase', 'Public Safety']
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
      tags: ['High-Rise', 'Luxury', 'Weather Protection']
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
      tags: ['Hazardous Environment', 'Industrial', '24/7 Operations']
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
      tags: ['Heritage', 'Community', 'Award Winning']
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
      tags: ['Multi-Trade', 'Complex', 'Large Scale']
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Project 
              <span className="text-gradient"> Gallery</span>
            </h1>
            <p className="text-lg lg:text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Explore our portfolio of successful scaffolding projects across Abu Dhabi and UAE. 
              From heritage restorations to industrial complexes, see how we deliver excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-primary">
                Start Your Project
              </Link>
              <Link to="/services" className="btn-secondary">
                Our Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 transition-theme">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-primary-600 text-black shadow-lg ring-2 ring-primary-200 dark:bg-primary-500 dark:text-white dark:ring-primary-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Project Image */}
                <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-6 -mx-6 -mt-6 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-primary-600 dark:text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  
                  {/* Featured Badge - Positioned separately to maintain consistent complexity badge position */}
                  {project.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-accent-500 text-white text-xs rounded-full font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                  
                  {/* Complexity Badge - Always positioned at same level */}
                  <div className={`absolute left-4 ${project.featured ? 'top-4' : 'top-4'}`}>
                    <span className={`px-3 py-1 text-xs rounded-full border ${getComplexityColor(project.stats.complexity)}`}>
                      {project.stats.complexity}
                    </span>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 rounded-lg">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.year}</span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link 
                      to={`/project-details/${project.id}`}
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4 inline mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Project Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <FiMapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.location}</div>
                    </div>
                    <div className="text-center">
                      <FiCalendar className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.duration}</div>
                    </div>
                    <div className="text-center">
                      <FiUsers className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.team}</div>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.stats.height}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Height</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{project.stats.area}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Coverage</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400 capitalize">{project.category}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
                    </div>
                  </div>

                  {/* Challenge & Solution */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Challenge</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{project.challenge}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Solution</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{project.solution}</p>
                    </div>
                  </div>

                  {/* Results */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Key Results</h5>
                    <ul className="space-y-1">
                      {project.results.map((result, resultIndex) => (
                        <li key={resultIndex} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Link 
                      to={`/project-details/${project.id}`}
                      className="w-full btn-secondary text-sm inline-flex items-center justify-center"
                    >
                      View Full Case Study
                      <FiArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="section-padding bg-aluminum-50 dark:bg-surface-dark transition-theme">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Award-Winning Projects
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our commitment to excellence has been recognized by industry leaders 
              and clients across Abu Dhabi and UAE.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                award: 'Excellence in Safety',
                year: '2023',
                project: 'Abu Dhabi Refinery Maintenance',
                organization: 'UAE Construction Safety Board'
              },
              {
                award: 'Heritage Preservation Award',
                year: '2022',
                project: 'Abu Dhabi Heritage Mosque',
                organization: 'National Heritage Trust'
              },
              {
                award: 'Innovation in Construction',
                year: '2023',
                project: 'Abu Dhabi Marina Tower Restoration',
                organization: 'Master Builders UAE'
              }
            ].map((award, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <FiAward className="w-12 h-12 text-accent-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {award.award}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium mb-1">
                  {award.project}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {award.organization}
                </p>
                <span className="inline-block px-3 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-sm rounded-full">
                  {award.year}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Create Your Success Story?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join our portfolio of successful projects. Contact us today to discuss 
              your scaffolding requirements and create the next showcase project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 border-primary-600 hover:border-primary-700">
                Start Your Project
              </Link>
              <Link to="/services" className="btn-secondary border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-700">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProjectGallery;
