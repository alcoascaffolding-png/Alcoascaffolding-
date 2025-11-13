/**
 * Under Construction Component
 * Simple, professional work-in-progress page
 */

import React from 'react';

const UnderConstruction = ({ 
  title = "Under Construction",
  subtitle = "This module is currently being developed"
}) => {
  return (
    <div className="flex items-center justify-center min-h-[600px] px-4">
      <div className="max-w-lg w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Decorative Top Border */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
          
          {/* Content */}
          <div className="p-12 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-6">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {subtitle}
            </p>
            
            {/* Simple Message */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                This feature is currently under development and will be available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;

