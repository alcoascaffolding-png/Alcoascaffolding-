/**
 * CustomerFilters Component
 * Search and filter controls for customer list
 */

import React from 'react';

const CustomerFilters = ({
  statusFilter,
  typeFilter,
  businessTypeFilter,
  priorityFilter,
  searchTerm,
  onStatusChange,
  onTypeChange,
  onBusinessTypeChange,
  onPriorityChange,
  onSearchChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by company name, email, phone, license..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Customer Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="rental">Rental Only</option>
            <option value="sales">Sales Only</option>
            <option value="both">Rental & Sales</option>
          </select>
        </div>

        {/* Business Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Business Type
          </label>
          <select
            value={businessTypeFilter}
            onChange={(e) => onBusinessTypeChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Business Types</option>
            <option value="Construction Company">Construction Company</option>
            <option value="Contractor">Contractor</option>
            <option value="Facility Management">Facility Management</option>
            <option value="Government">Government</option>
            <option value="Individual">Individual</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="vip">VIP</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || statusFilter || typeFilter || businessTypeFilter || priorityFilter) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Search: {searchTerm}
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Status: {statusFilter}
                <button
                  onClick={() => onStatusChange('')}
                  className="ml-1 hover:text-green-600 dark:hover:text-green-400"
                >
                  ×
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                Type: {typeFilter}
                <button
                  onClick={() => onTypeChange('')}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  ×
                </button>
              </span>
            )}
            {businessTypeFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                Business: {businessTypeFilter}
                <button
                  onClick={() => onBusinessTypeChange('')}
                  className="ml-1 hover:text-yellow-600 dark:hover:text-yellow-400"
                >
                  ×
                </button>
              </span>
            )}
            {priorityFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                Priority: {priorityFilter}
                <button
                  onClick={() => onPriorityChange('')}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onSearchChange('');
                onStatusChange('');
                onTypeChange('');
                onBusinessTypeChange('');
                onPriorityChange('');
              }}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFilters;

