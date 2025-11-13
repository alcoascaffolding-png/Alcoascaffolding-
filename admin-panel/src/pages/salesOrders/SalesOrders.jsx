/**
 * Sales Orders Page
 * Example of Under Construction implementation
 */

import React, { useState } from 'react';
import { PageWrapper } from '../../components/common';

const SalesOrders = () => {
  // ⭐ SIMPLY CHANGE THIS TO false WHEN READY TO GO LIVE ⭐
  const [isUnderConstruction] = useState(true);

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Sales Orders",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      {/* ========================================
          YOUR ACTUAL PAGE CONTENT GOES HERE
          This will show when isUnderConstruction = false
          ======================================== */}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Sales Orders
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Manage customer orders and deliveries
                    </p>
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Order
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Your page content here */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your sales orders functionality will be implemented here...
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SalesOrders;

