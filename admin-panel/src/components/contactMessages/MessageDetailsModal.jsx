/**
 * Message Details Modal Component
 * Displays full contact message details
 */

import { format } from 'date-fns';

const MessageDetailsModal = ({ message, onClose, onStatusChange }) => {
  if (!message) return null;

  const getStatusBadgeClass = (status) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      responded: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600'
    };
    return badges[status] || badges.read;
  };

  const getTypeBadgeClass = (type) => {
    return type === 'quote' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Message Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                Received on {format(new Date(message.createdAt), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Badges */}
            <div className="flex gap-2">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getTypeBadgeClass(message.type)}`}>
                {message.type === 'quote' ? 'Quote Request' : 'Contact Form'}
              </span>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadgeClass(message.status)}`}>
                {message.status.replace('_', ' ')}
              </span>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{message.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{message.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{message.phone}</p>
                </div>
                {message.company && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Company</p>
                    <p className="text-sm text-gray-900">{message.company}</p>
                  </div>
                )}
                {message.projectType && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Project Type</p>
                    <p className="text-sm text-gray-900 capitalize">{message.projectType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quote Details */}
            {message.type === 'quote' && (message.projectHeight || message.coverageArea || message.duration || message.startDate) && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quote Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {message.projectHeight && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Height</p>
                      <p className="text-sm text-gray-900">{message.projectHeight} meters</p>
                    </div>
                  )}
                  {message.coverageArea && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Coverage Area</p>
                      <p className="text-sm text-gray-900">{message.coverageArea} sqm</p>
                    </div>
                  )}
                  {message.duration && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Duration</p>
                      <p className="text-sm text-gray-900">{message.duration}</p>
                    </div>
                  )}
                  {message.startDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Start Date</p>
                      <p className="text-sm text-gray-900">{format(new Date(message.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Content */}
            {message.message && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            )}

            {/* Status Management */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['new', 'read', 'in_progress', 'responded', 'closed'].map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(message._id, status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      message.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <a
                href={`mailto:${message.email}?subject=Re: Your Contact Request&body=Dear ${message.name},%0D%0A%0D%0AThank you for contacting Alcoa Scaffolding.%0D%0A%0D%0A`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Reply via Email
              </a>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetailsModal;

