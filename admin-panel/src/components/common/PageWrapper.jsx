/**
 * Page Wrapper Component
 * Easily toggle between Under Construction and actual page content
 */

import React from 'react';
import UnderConstruction from './UnderConstruction';

const PageWrapper = ({ 
  isUnderConstruction = false,
  constructionProps = {},
  children 
}) => {
  if (isUnderConstruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {constructionProps.title || "Page Under Construction"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UnderConstruction {...constructionProps} />
        </div>
      </div>
    );
  }

  return children;
};

export default PageWrapper;

