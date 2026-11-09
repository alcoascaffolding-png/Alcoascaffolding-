import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Ahmed Al Rashidi',
      role: 'Site Manager',
      company: 'Premier Construction LLC',
      image: 'ahmed-al-rashidi',
      rating: 5,
      quote: "Alcoa delivered cuplock and mobile towers to our Yas Island site within four hours. Pricing was transparent in AED and every unit passed our HSE checklist.",
      project: 'High-Rise Façade — Yas Island, Abu Dhabi',
      avatar: 'AR',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      role: 'Operations Director', 
      company: 'Gulf Build Contractors',
      image: 'rajesh-kumar',
      rating: 5,
      quote: "We rent cuplock and prop jacks monthly from Alcoa's Musaffah warehouse. Stock is always available and their team responds on WhatsApp within minutes.",
      project: 'Industrial Warehouse — Musaffah M-45',
      avatar: 'RK',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 3,
      name: 'Fatima Hassan',
      role: 'Project Engineer',
      company: 'Emirates Facade Solutions',
      image: 'fatima-hassan',
      rating: 5,
      quote: "For our Yas Island façade project we needed fast tower delivery without compromising HSE standards. Alcoa's aluminium systems were inspection-ready and their Musaffah team coordinated perfectly with our schedule.",
      project: 'Commercial Façade — Yas Island, Abu Dhabi',
      avatar: 'FH',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 4,
      name: 'Khalid Al Mansoori',
      role: 'Operations Manager',
      company: 'KIZAD Industrial Services',
      image: 'khalid-mansoori',
      rating: 5,
      quote: "In industrial maintenance, safety is non-negotiable. Alcoa's cuplock systems and inspection documentation satisfied our ADNOC-zone requirements without delays.",
      project: 'Plant Maintenance — KIZAD, Abu Dhabi',
      avatar: 'KM',
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
    <section className="bg-white py-14 dark:bg-surface-dark sm:py-16">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">What Our Clients Say</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-600 dark:text-gray-300">
            Feedback from contractors and facility teams we supply.
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
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-10 border border-gray-200 dark:border-gray-700"
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
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                      {current.project}
                    </h4>
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
        <div className="flex justify-center gap-1 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={index === currentTestimonial ? 'true' : undefined}
            >
              <span
                className={`block h-3 w-3 rounded-full transition-colors ${
                  index === currentTestimonial
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
