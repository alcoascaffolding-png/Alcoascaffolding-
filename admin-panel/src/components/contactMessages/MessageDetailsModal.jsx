/**
 * Message Details Modal Component
 * Displays full contact message details
 */

import { format } from 'date-fns';
import { openWhatsAppChat } from '../../utils/whatsapp';

const MessageDetailsModal = ({ message, onClose, onStatusChange }) => {
  if (!message) return null;
  
  // Determine message type for WhatsApp template
  const messageType = message.type === 'quote' ? 'quote' : 'contact';

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
              <div className="text-sm text-gray-600 mb-3">
                Current status: <span className={`px-2 py-1 rounded-full font-semibold ${
                  message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  message.status === 'read' ? 'bg-gray-100 text-gray-800' :
                  message.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  message.status === 'responded' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {message.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['new', 'read', 'in_progress', 'responded', 'closed'].map(status => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(message._id, status)}
                    disabled={message.status === status}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      message.status === status
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions - Email and WhatsApp */}
            <div className="pt-4 border-t space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Contact Customer</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Reply Button */}
                <a
                  href={`mailto:${message.email}?subject=Re: Your ${message.type === 'quote' ? 'Quote Request' : 'Contact Request'}&body=Dear ${message.name},%0D%0A%0D%0AThank you for contacting Alcoa Scaffolding.%0D%0A%0D%0A`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Reply via Email</span>
                </a>
                
                {/* WhatsApp Button */}
                <button
                  onClick={() => openWhatsAppChat(message.phone, message.name, messageType)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Contact on WhatsApp</span>
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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

