import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiExternalLink, 
  FiCalendar, 
  FiMapPin, 
  FiUsers,
  FiArrowRight,
  FiFilter
} from 'react-icons/fi';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All Projects' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'industrial', name: 'Industrial' },
  ];

  const projects = [
    {
      id: 1,
      title: 'Abu Dhabi Marina Tower Renovation',
      category: 'commercial',
      location: 'Abu Dhabi, UAE',
      duration: '6 months',
      team: '15 specialists',
      description: 'Complex scaffolding solution for the iconic Opera House facade restoration project.',
      image: 'opera-house',
      stats: { height: '60m', area: '2,500m²', difficulty: 'Expert' },
      tags: ['Heritage Building', 'Complex Access', 'Tourism Impact']
    },
    {
      id: 2,
      title: 'Abu Dhabi Financial Center',
      category: 'commercial',
      location: 'Abu Dhabi, UAE',
      duration: '4 months',
      team: '12 specialists',
      description: 'Large-scale scaffolding for shopping center expansion while maintaining operations.',
      image: 'westfield',
      stats: { height: '25m', area: '4,000m²', difficulty: 'Advanced' },
      tags: ['Retail Active', 'Multi-Level', 'Public Safety']
    },
    {
      id: 3,
      title: 'Abu Dhabi Residential Tower',
      category: 'residential',
      location: 'Abu Dhabi, UAE',
      duration: '8 months',
      team: '20 specialists',
      description: 'High-rise residential building construction with premium scaffolding systems.',
      image: 'residential-tower',
      stats: { height: '120m', area: '1,800m²', difficulty: 'Expert' },
      tags: ['High-Rise', 'Luxury Finish', 'Weather Protection']
    },
    {
      id: 4,
      title: 'Industrial Refinery Maintenance',
      category: 'industrial',
      location: 'Abu Dhabi, UAE',
      duration: '3 months',
      team: '25 specialists',
      description: 'Specialized scaffolding for petroleum refinery maintenance and upgrades.',
      image: 'refinery',
      stats: { height: '45m', area: '3,200m²', difficulty: 'Expert' },
      tags: ['Hazardous Environment', 'Specialized Access', '24/7 Operations']
    },
    {
      id: 5,
      title: 'Heritage Church Restoration',
      category: 'commercial',
      location: 'Abu Dhabi, UAE',
      duration: '5 months',
      team: '8 specialists',
      description: 'Delicate scaffolding work for 150-year-old church restoration project.',
      image: 'church',
      stats: { height: '35m', area: '800m²', difficulty: 'Advanced' },
      tags: ['Heritage Preservation', 'Minimal Impact', 'Architectural Detail']
    },
    {
      id: 6,
      title: 'Suburban Home Extension',
      category: 'residential',
      location: 'Abu Dhabi, UAE',
      duration: '2 months',
      team: '4 specialists',
      description: 'Efficient scaffolding solution for residential extension and renovation.',
      image: 'home-extension',
      stats: { height: '8m', area: '300m²', difficulty: 'Standard' },
      tags: ['Residential', 'Quick Setup', 'Neighbor Friendly']
    }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Standard': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'Advanced': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'Expert': return 'bg-red-500 text-white';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <section className="section-padding bg-surface-muted dark:bg-surface-muted-dark transition-theme">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10 lg:mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-brand-primary-100 dark:bg-brand-primary-900 text-brand-primary-700 dark:text-brand-primary-300 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FiUsers className="w-4 h-4" />
            <span>Our Work</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary dark:text-text-primary-dark mb-3 sm:mb-4">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-text-secondary dark:text-text-secondary-dark max-w-3xl mx-auto">
            Explore some of our most challenging and successful scaffolding projects 
            across residential, commercial, and industrial sectors.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
                activeFilter === filter.id
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FiFilter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{filter.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeFilter} // Re-animate when filter changes
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="group h-full"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Project Image */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-slate-100 dark:from-blue-900/20 dark:to-slate-900/20 mb-6 -mx-6 -mt-6">
                  <div className="w-full h-full flex items-center justify-center">
                    {/* Placeholder icon - replace with actual project images */}
                    <svg
                      className="w-20 h-20 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className={`absolute top-8 right-8 px-3 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(project.stats.difficulty)}`}>
                    {project.stats.difficulty}
                  </div>

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      to={`/projects/${project.id}`}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4 inline mr-2" />
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Project Info */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="text-center">
                      <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.location}</div>
                    </div>
                    <div className="text-center">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.duration}</div>
                    </div>
                    <div className="text-center">
                      <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <div className="text-xs text-gray-600 dark:text-gray-400">{project.team}</div>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center mb-3 sm:mb-4">
                    <div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{project.stats.height}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Height</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{project.stats.area}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Coverage</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">{project.category}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Type</div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
          className="text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Explore Our Complete Portfolio
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
              See more of our successful projects and discover how we can help with your next scaffolding challenge.
            </p>
            <Link to="/projects" className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-sm sm:text-base">
              View All Projects
              <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
