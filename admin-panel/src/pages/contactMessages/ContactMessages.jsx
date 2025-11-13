/**
 * Contact Messages Page - Optimized Component-Based Architecture
 * Displays and manages all contact form submissions from website
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageWrapper } from '../../components/common';
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
  // Toggle this to show/hide construction page
  const [isUnderConstruction] = useState(true);
  
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Contact Messages</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading contact messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Contact Messages</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error loading data</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200 dark:border-red-800 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">Failed to Load Messages</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => {
                    loadMessages();
                    loadStats();
                  }}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Contact Messages",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Modern Header with Gradient */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Contact Messages
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border border-green-200 dark:border-green-800">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                      LIVE
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Auto-refresh: {pollingInterval/1000}s • Last: {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                Real-time monitoring of customer inquiries and quote requests
              </p>
            </div>
            <button
              onClick={() => {
                loadMessages();
                loadStats();
                noChangeCount.current = 0;
                setPollingInterval(30000);
              }}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Statistics Cards */}
        <StatsCards stats={stats} />

        {/* Filters Section - Enhanced */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <MessageFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
          />
        </div>

        {/* Messages Table - Premium Design */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
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
                    <td colSpan="8" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-4">
                          <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No messages found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchTerm || statusFilter || typeFilter
                            ? 'Try adjusting your search or filter criteria'
                            : 'New messages will appear here automatically'}
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
              setCurrentPage(1);
            }}
          />
        )}
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
    </PageWrapper>
  );
};

export default ContactMessages;

