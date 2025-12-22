import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, 
  FiChevronLeft, 
  FiChevronRight,
  FiMessageCircle,
  FiAward,
  FiUsers,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      role: 'Project Manager',
      company: 'Mitchell Construction',
      image: 'sarah-mitchell',
      rating: 5,
      quote: "Alcoa Scaffolding exceeded our expectations on every level. Their team was professional, punctual, and safety-focused. The quality of their aluminum scaffolding systems is outstanding, and they completed our commercial project ahead of schedule.",
      project: 'Commercial Office Complex - Abu Dhabi',
      projectValue: '$2.3M project',
      avatar: 'SM',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Site Supervisor', 
      company: 'Chen Brothers Development',
      image: 'david-chen',
      rating: 5,
      quote: "We've worked with many scaffolding companies over the years, but Alcoa stands out for their reliability and expertise. Their 24/7 support saved us during an emergency situation, and their equipment is always in excellent condition.",
      project: 'Residential High-Rise - Abu Dhabi',
      projectValue: '$15M project',
      avatar: 'DC',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 3,
      name: 'Emma Thompson',
      role: 'Architect',
      company: 'Thompson & Associates',
      image: 'emma-thompson',
      rating: 5,
      quote: "For our heritage building restoration, we needed a scaffolding partner who understood the delicate nature of the work. Alcoa's team provided innovative solutions that protected the building while allowing us complete access.",
      project: 'Heritage Building Restoration - Abu Dhabi',
      projectValue: '$1.8M project',
      avatar: 'ET',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 4,
      name: 'Michael O\'Brien',
      role: 'Operations Manager',
      company: 'Industrial Solutions Ltd',
      image: 'michael-obrien',
      rating: 5,
      quote: "In the industrial sector, safety is paramount. Alcoa's scaffolding systems and safety protocols are second to none. Their team completed our refinery project without a single safety incident.",
      project: 'Oil Refinery Maintenance - Abu Dhabi',
      projectValue: '$5M project',
      avatar: 'MO',
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 5,
      name: 'Lisa Rodriguez',
      role: 'Homeowner',
      company: 'Private Residence',
      image: 'lisa-rodriguez',
      rating: 5,
      quote: "As a homeowner, I was initially concerned about having scaffolding installed. The Alcoa team was incredibly professional and respectful of our property. They explained everything clearly and completed the work efficiently.",
      project: 'Residential Renovation - Abu Dhabi',
      projectValue: '$45K project',
      avatar: 'LR',
      color: 'from-pink-400 to-pink-600'
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-brand-warning-400 fill-current' : 'text-border-light dark:text-border-dark'
        }`}
      />
    ));
  };

  const current = testimonials[currentTestimonial];

  return (
    <section className="section-padding bg-gray-50 dark:bg-gray-900 transition-theme">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full px-4 py-2 text-sm font-medium mb-4">
            <FiMessageCircle className="w-4 h-4" />
            <span>Client Testimonials</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our valued clients 
            have to say about their experience with Alcoa Scaffolding.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
                {/* Client Info */}
                <div className="lg:col-span-1 text-center lg:text-left">
                  {/* Client Avatar */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto lg:mx-0 mb-3 sm:mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {current.avatar}
                    </span>
                  </div>

                  {/* Client Details */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {current.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-1 text-sm sm:text-base">
                    {current.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                    {current.company}
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center lg:justify-start space-x-1 mb-3 sm:mb-4">
                    {renderStars(current.rating)}
                  </div>

                  {/* Project Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm mb-1">
                      {current.project}
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                      {current.projectValue}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    {/* Quote Icon */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 text-gray-300 dark:text-gray-600 text-6xl font-serif">"</div>
                    
                    {/* Quote Text */}
                    <blockquote className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-800 dark:text-gray-200 leading-relaxed italic mb-4 sm:mb-6 relative z-10 pl-6 sm:pl-8">
                      {current.quote}
                    </blockquote>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-10"
            aria-label="Next testimonial"
          >
            <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentTestimonial
                  ? 'bg-blue-500'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-gray-200 dark:border-gray-700">
          {[
            { number: '500+', label: 'Happy Clients', description: 'Satisfied customers' },
            { number: '98%', label: 'Success Rate', description: 'Project completion' },
            { number: '4.9/5', label: 'Average Rating', description: 'Client feedback' },
            { number: '24/7', label: 'Support', description: 'Always available' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1 sm:mb-2">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
