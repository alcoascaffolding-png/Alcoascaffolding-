/**
 * Contact Messages Page - Optimized Component-Based Architecture
 * Displays and manages all contact form submissions from website
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchContactMessages, 
  fetchContactMessageStats,
  updateContactMessage,
  deleteContactMessage 
} from '../../store/slices/contactMessageSlice';
import { 
  StatsCards, 
  MessageCard, 
  MessageDetailsModal, 
  MessageFilters 
} from '../../components/contactMessages';
import toast from 'react-hot-toast';
import ENV_CONFIG from '../../config/env';

const ContactMessages = () => {
  // Redux state
  const dispatch = useDispatch();
  const { messages, stats, loading, error } = useSelector(state => state.contactMessages);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Initial data load
  useEffect(() => {
    loadMessages();
    loadStats();
  }, [dispatch]);

  // Reload when filters change
  useEffect(() => {
    if (searchTerm || statusFilter || typeFilter) {
      loadMessages();
    }
  }, [statusFilter, typeFilter, searchTerm]);

  // API Methods
  const loadMessages = () => {
    const params = { page: 1, limit: 100 };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    if (searchTerm) params.search = searchTerm;
    
    dispatch(fetchContactMessages(params));
  };

  const loadStats = () => {
    dispatch(fetchContactMessageStats());
  };

  // Event Handlers
  const handleView = (message) => {
    setSelectedMessage(message);
    
    // Auto-mark as read
    if (message.status === 'new') {
      handleStatusChange(message._id, 'read');
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await dispatch(updateContactMessage({ 
        id: messageId, 
        data: { status: newStatus, markAsResponded: newStatus === 'responded' } 
      })).unwrap();
      
      toast.success('Status updated successfully!');
      loadStats(); // Refresh stats
    } catch (error) {
      toast.error(error || 'Failed to update status');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteContactMessage(messageId)).unwrap();
      toast.success('Message deleted successfully!');
      setSelectedMessage(null);
      loadStats(); // Refresh stats
    } catch (error) {
      toast.error(error || 'Failed to delete message');
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
  };

  // Loading State
  if (loading && !messages.length) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading contact messages...</p>
          <p className="text-sm text-gray-500 mt-2">Connected to: {ENV_CONFIG.env}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-red-900 font-semibold mb-2">Error Loading Messages</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => {
                  loadMessages();
                  loadStats();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all contact form submissions and quote requests from your website
          </p>
        </div>
        <button
          onClick={() => {
            loadMessages();
            loadStats();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <MessageFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <MessageCard
                    key={message._id}
                    message={message}
                    onView={handleView}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-20 h-20 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xl font-medium text-gray-900 mb-2">No messages yet</p>
                      <p className="text-sm text-gray-500 max-w-sm">
                        Contact form submissions and quote requests from your website will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default ContactMessages;

