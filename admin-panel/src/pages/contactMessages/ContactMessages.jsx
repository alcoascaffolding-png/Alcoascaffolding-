/**
 * Contact Messages Page - Optimized Component-Based Architecture
 * Displays and manages all contact form submissions from website
 */

import { useEffect, useState, useRef, useCallback } from 'react';
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
  MessageFilters,
  Pagination 
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
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pollingInterval, setPollingInterval] = useState(30000); // Smart interval
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Refs
  const intervalRef = useRef(null);
  const lastFetchTime = useRef(Date.now());
  const noChangeCount = useRef(0);
  
  // Get pagination from Redux
  const pagination = useSelector(state => state.contactMessages.pagination) || {
    page: 1,
    limit: 25,
    total: 0,
    pages: 1
  };

  // API Methods - DECLARE FIRST before using in useEffect
  const loadMessages = useCallback((silent = false) => {
    const params = { 
      page: currentPage, 
      limit: itemsPerPage 
    };
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;
    if (searchTerm) params.search = searchTerm;
    
    if (!silent) {
      console.log('📥 Loading messages...', params);
    }
    
    setLastUpdated(new Date()); // Update timestamp
    return dispatch(fetchContactMessages(params));
  }, [dispatch, currentPage, itemsPerPage, statusFilter, typeFilter, searchTerm]);

  const loadStats = useCallback(() => {
    return dispatch(fetchContactMessageStats());
  }, [dispatch]);

  // Initial data load
  useEffect(() => {
    loadMessages();
    loadStats();
  }, [loadMessages, loadStats]);

  // Reload when filters change
  useEffect(() => {
    if (searchTerm || statusFilter || typeFilter) {
      loadMessages();
    }
  }, [statusFilter, typeFilter, searchTerm, loadMessages]);

  // ULTRA-EFFICIENT POLLING - Uses lightweight check endpoint
  useEffect(() => {
    console.log(`🔴 LIVE: Optimized polling - checking every ${pollingInterval/1000}s`);
    
    // Set up lightweight polling
    intervalRef.current = setInterval(async () => {
      try {
        // STEP 1: Lightweight check (< 1KB response)
        const lastCheck = lastUpdated.toISOString();
        const response = await fetch(`${ENV_CONFIG.apiUrl}/contact-messages/check-new?lastCheck=${lastCheck}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Check failed');
        
        const result = await response.json();
        console.log(`🔍 Lightweight check: ${result.data.hasNew ? `${result.data.newCount} new!` : 'No changes'}`);
        
        // STEP 2: Only fetch full data if changes detected
        if (result.data.hasNew || result.data.totalCount !== (messages?.length || 0)) {
          console.log('⚡ Changes detected! Fetching full data...');
          loadMessages(true);
          loadStats();
          
          // Speed up polling
          noChangeCount.current = 0;
          if (pollingInterval > 30000) {
            setPollingInterval(30000);
          }
        } else {
          // No changes - slow down polling
          noChangeCount.current += 1;
          
          if (noChangeCount.current >= 3 && pollingInterval < 60000) {
            const newInterval = Math.min(pollingInterval + 10000, 60000);
            setPollingInterval(newInterval);
            console.log(`⏱️ No changes. Slowing to ${newInterval/1000}s`);
          }
        }
      } catch (error) {
        console.error('❌ Check error:', error);
        // Fallback to full fetch on error
        loadMessages(true);
      }
    }, pollingInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 Auto-refresh stopped');
      }
    };
  }, [pollingInterval, loadMessages, loadStats, messages, lastUpdated]);

  // Detect and notify about new messages
  useEffect(() => {
    if (messages && messages.length > lastMessageCount && lastMessageCount > 0) {
      const newCount = messages.length - lastMessageCount;
      
      // Play notification sound (optional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore if autoplay blocked
      
      // Show toast notification
      toast.success(`📬 ${newCount} new message${newCount > 1 ? 's' : ''} received!`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: 'white',
          fontWeight: 'bold',
        },
      });
    }
    setLastMessageCount(messages?.length || 0);
  }, [messages, lastMessageCount]);


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
      const updatedMessage = await dispatch(updateContactMessage({ 
        id: messageId, 
        data: { status: newStatus, markAsResponded: newStatus === 'responded' } 
      })).unwrap();
      
      // Update the selected message in modal if it's open
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(updatedMessage.data);
      }
      
      toast.success('Status updated successfully!');
      loadStats(); // Refresh stats
      loadMessages(true); // Refresh message list
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
      {/* Header with Live Indicator */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          {/* Live indicator - subtle pulsing dot */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>🔄 Smart refresh every {pollingInterval/1000}s</span>
            <span>•</span>
            <span>{messages?.length || 0} total</span>
            <span>•</span>
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            {noChangeCount.current > 0 && (
              <>
                <span>•</span>
                <span className="text-xs text-blue-600">
                  Optimized ({noChangeCount.current} unchanged)
                </span>
              </>
            )}
          </div>
          {/* Manual refresh button */}
          <button
            onClick={() => {
              loadMessages();
              loadStats();
              noChangeCount.current = 0;
              setPollingInterval(30000); // Reset to fast
            }}
            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium inline-flex items-center border border-blue-200"
            title="Force refresh now"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
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

      {/* Pagination */}
      {messages && messages.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1); // Reset to first page when changing limit
          }}
        />
      )}

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

