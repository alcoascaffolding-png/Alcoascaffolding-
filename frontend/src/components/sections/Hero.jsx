import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPlay, 
  FiCheck, 
  FiAward, 
  FiUsers, 
  FiTool 
} from 'react-icons/fi';

const Hero = () => {
  const stats = [
    { 
      icon: FiAward, 
      number: '15+', 
      label: 'Years Experience',
      color: 'text-brand-accent-500'
    },
    { 
      icon: FiUsers, 
      number: '500+', 
      label: 'Projects Done',
      color: 'text-brand-primary-500'
    },
    { 
      icon: FiTool, 
      number: '24/7', 
      label: 'Always Available',
      color: 'text-brand-success-500'
    },
  ];

  const features = [
    'Safe & Certified',
    'Fully Insured',
    'Expert Team',
    'Best Prices',
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 overflow-hidden">
      {/* Industrial Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20.5V18h-2v2.5h-2.5v2h2.5v2.5h2v-2.5h2.5v-2H20zM20 2V0h-2v2h-2.5v2h2.5v2h2V4h2.5V2H20zM2 20.5v-2H0v2H-2.5v2H0v2.5h2v-2.5h2.5v-2H2zM2 2V0H0v2H-2.5v2H0v2h2V4h2.5V2H2z'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Scaffolding Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000000' stroke-width='1'%3E%3Cpath d='M0 0h80v80H0z'/%3E%3Cpath d='M0 0v80M80 0v80M0 0h80M0 80h80'/%3E%3Cpath d='M0 20h80M0 40h80M0 60h80M20 0v80M40 0v80M60 0v80'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 xl:gap-16 items-center min-h-screen py-6 sm:py-8 lg:py-12 xl:py-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-2 sm:space-y-3 lg:space-y-4 xl:space-y-6 2xl:space-y-8 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-slate-600 text-white backdrop-blur-sm rounded-lg px-3 xs:px-4 py-1.5 xs:py-2 shadow-lg border border-blue-500/20"
            >
              <FiAward className="w-3 h-3 xs:w-4 xs:h-4" />
              <span className="text-xs xs:text-sm font-semibold">
                UAE's Best Scaffolding Company
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              <span className="text-slate-800 dark:text-slate-200">Heavy-Duty</span>
              <br />
              <span className="text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">Aluminium</span>
              <br />
              <span className="text-blue-500 dark:text-blue-300">Scaffolding</span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">Systems &</span>
              <br />
              <span className="text-slate-800 dark:text-slate-200">Solutions</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs xs:text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              We provide strong, safe scaffolding for all your building projects. 
              Our aluminium scaffolding is light, strong, and easy to use. 
              Serving Abu Dhabi and all of UAE.
            </motion.p>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 max-w-sm xs:max-w-md mx-auto lg:mx-0"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white rounded-lg p-2 xs:p-3 border border-gray-200 shadow-sm">
                  <div className="w-4 h-4 xs:w-5 xs:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-white" />
                  </div>
                  <span className="text-gray-800 text-xs font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col xs:flex-row gap-2 xs:gap-3 justify-center lg:justify-start"
            >
              <Link 
                to="/contact-us" 
                className="inline-flex items-center justify-center px-4 xs:px-6 py-2 xs:py-3 bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs xs:text-sm"
              >
                Get Free Quote
              </Link>
              <button className="inline-flex items-center justify-center px-4 xs:px-6 py-2 xs:py-3 bg-white/90 hover:bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:border-slate-400 transition-all duration-200 shadow-lg hover:shadow-xl group transform hover:-translate-y-0.5 text-xs xs:text-sm">
                <FiPlay className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2 group-hover:text-blue-600" />
                See Our Work
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3 pt-4 sm:pt-6"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white rounded-lg p-2 xs:p-3 border border-gray-200 shadow-sm">
                  <div className={`w-8 h-8 xs:w-10 xs:h-10 mx-auto mb-1 xs:mb-2 rounded-lg bg-gradient-to-br shadow-sm flex items-center justify-center ${
                    index === 0 ? 'from-orange-500 to-red-500' :
                    index === 1 ? 'from-blue-500 to-blue-600' : 'from-green-500 to-emerald-500'
                  }`}>
                    <stat.icon className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                  </div>
                  <div className="text-sm xs:text-lg font-bold text-gray-900">{stat.number}</div>
                  <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Clean Professional Scaffolding Display */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end order-first lg:order-last"
          >
            {/* Main Display Container */}
            <div className="relative w-full max-w-[280px] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
              {/* Clean Professional Display Panel */}
              <div className="aspect-[4/3] bg-white dark:bg-gray-900 rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
                
                {/* Clean White Background */}
                <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>
                
                {/* Professional Badge - Top Left */}
                <div className="absolute top-1 xs:top-2 sm:top-4 left-1 xs:left-2 sm:left-4 bg-blue-600 text-white text-xs font-bold px-2 xs:px-3 py-1 rounded-full shadow-sm z-10">
                  PROFESSIONAL
                </div>
                
                {/* Load Capacity Card - Top Right */}
                <div className="absolute top-1 xs:top-2 sm:top-4 right-1 xs:right-2 sm:right-4 bg-white rounded-lg shadow-lg p-1.5 xs:p-2 sm:p-3 border border-gray-200 z-10">
                  <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 bg-white rounded-sm"></div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">Load Capacity</div>
                      <div className="text-xs text-gray-600">250kg/m²</div>
                    </div>
                  </div>
                </div>

                
                {/* Clean Scaffolding Structure - Center */}
                <div className="absolute inset-0 flex items-center justify-center p-2 xs:p-4 sm:p-6 lg:p-8 z-0">
                  <div className="relative w-24 h-32 xs:w-32 xs:h-40 sm:w-40 sm:h-48 md:w-48 md:h-64">
                    
                    {/* Main Structure */}
                    <div className="relative w-full h-full">
                      
                      {/* Vertical Columns */}
                      <div className="absolute left-8 top-0 bottom-0 w-2 bg-gray-400 rounded-sm"></div>
                      <div className="absolute right-8 top-0 bottom-0 w-2 bg-gray-400 rounded-sm"></div>
                      
                      {/* Horizontal Beams - 8 Levels */}
                      <div className="absolute top-8 left-8 right-8 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-16 left-8 right-8 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-24 left-8 right-8 h-1 bg-blue-200 rounded-sm"></div>
                      <div className="absolute top-32 left-8 right-8 h-1 bg-blue-200 rounded-sm"></div>
                      <div className="absolute top-40 left-8 right-8 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-48 left-8 right-8 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-56 left-8 right-8 h-1 bg-gray-400 rounded-sm"></div>
                      <div className="absolute top-64 left-8 right-8 h-1 bg-green-200 rounded-sm"></div>
                      
                      {/* Red Connection Points */}
                      <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-16 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-16 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-24 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-24 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-32 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-32 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-40 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-40 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-48 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-48 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-56 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-56 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-64 left-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <div className="absolute top-64 right-8 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      
                      {/* Diagonal Staircase Elements */}
                      <div className="absolute left-4 top-24 w-6 h-8">
                        <div className="absolute top-0 left-0 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-1 left-1 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-2 left-2 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-3 left-3 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-4 left-4 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-5 left-5 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                      </div>
                      
                      <div className="absolute left-4 top-32 w-6 h-8">
                        <div className="absolute top-0 left-0 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-1 left-1 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-2 left-2 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-3 left-3 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-4 left-4 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                        <div className="absolute top-5 left-5 w-0.5 h-1 bg-gray-500 transform rotate-12"></div>
                      </div>
                      
                      {/* Base Supports */}
                      <div className="absolute -bottom-2 left-6 w-4 h-2 bg-black rounded-sm"></div>
                      <div className="absolute -bottom-2 right-6 w-4 h-2 bg-black rounded-sm"></div>
                      <div className="absolute -bottom-1 left-7 w-0.5 h-1 bg-red-500"></div>
                      <div className="absolute -bottom-1 right-7 w-0.5 h-1 bg-red-500"></div>
                      
                      {/* Additional Supports */}
                      <div className="absolute -bottom-2 left-32 w-4 h-2 bg-black rounded-sm"></div>
                      <div className="absolute -bottom-2 right-32 w-4 h-2 bg-black rounded-sm"></div>
                      <div className="absolute -bottom-1 left-33 w-0.5 h-1 bg-red-500"></div>
                      <div className="absolute -bottom-1 right-33 w-0.5 h-1 bg-red-500"></div>
                    </div>
                  </div>
                  </div>
                </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
