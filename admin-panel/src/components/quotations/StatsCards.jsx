/**
 * StatsCards Component for Quotations
 * Displays quotation statistics in card format
 */

import React from 'react';

const StatsCards = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Quotations',
      value: stats?.total || 0,
      icon: '📋',
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: '✅',
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Total Value',
      value: `AED ${(stats?.totalValue || 0).toLocaleString()}`,
      icon: '💰',
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'This Month',
      value: stats?.thisMonth?.count || 0,
      subtitle: `AED ${(stats?.thisMonth?.value || 0).toLocaleString()}`,
      icon: '📈',
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </p>
              <p className={`mt-2 text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              {card.subtitle && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>
              )}
            </div>
            <div className={`${card.bgColor} rounded-full p-3 text-2xl`}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

