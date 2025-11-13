/**
 * QuotationCard Component
 * Displays a single quotation row in the table
 */

import React from 'react';

const QuotationCard = ({ quotation, onView, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      converted: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
    };
    return colors[status] || colors.draft;
  };

  const getTypeIcon = (type) => {
    const icons = {
      rental: '🏗️',
      sales: '🛒',
      service: '🔧',
      both: '📦'
    };
    return icons[type] || '📋';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = () => {
    const validUntil = new Date(quotation.validUntil);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0 && quotation.status === 'sent';
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {/* Quote Number */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg mr-2">{getTypeIcon(quotation.quoteType)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {quotation.quoteNumber}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(quotation.quoteDate)}
            </div>
          </div>
        </div>
      </td>

      {/* Customer */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{quotation.customerName}</div>
        {quotation.customerEmail && (
          <div className="text-sm text-gray-500 dark:text-gray-400">{quotation.customerEmail}</div>
        )}
      </td>

      {/* Amount */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          AED {quotation.totalAmount.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {quotation.items?.length || 0} items
        </div>
      </td>

      {/* Valid Until */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {formatDate(quotation.validUntil)}
        </div>
        {isExpiringSoon() && (
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
            ⚠️ Expiring soon
          </div>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            quotation.status
          )}`}
        >
          {quotation.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          {/* View Button */}
          <button
            onClick={() => onView(quotation)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="View details"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(quotation)}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
            title="Edit quotation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(quotation._id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Delete quotation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default QuotationCard;

