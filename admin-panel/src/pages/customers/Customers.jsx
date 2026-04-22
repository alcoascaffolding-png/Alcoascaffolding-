/**
 * Customers Page - Main Container
 * Manages customer list display with filters, search, and pagination
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchCustomers,
  fetchCustomerStats,
  deleteCustomer,
  setSelectedCustomer,
  clearSelectedCustomer
} from '../../store/slices/customerSlice';
import {
  StatsCards,
  CustomerFilters,
  CustomerCard,
  CustomerDetailsModal,
  AddCustomerModal,
  Pagination
} from '../../components/customers';
import { openWhatsAppChat } from '../../utils/whatsapp';
import ENV_CONFIG from '../../config/env';

const Customers = () => {
  const dispatch = useDispatch();
  const { customers, stats, pagination, loading, statsLoading, selectedCustomer } = useSelector(
    (state) => state.customers
  );

  // Local state
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Real-time updates
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pollingInterval, setPollingInterval] = useState(30000); // 30s
  const intervalRef = useRef(null);
  const noChangeCount = useRef(0);

  // Load customers
  const loadCustomers = useCallback((silent = false) => {
    const params = {
      page: currentPage,
      limit: itemsPerPage
    };

    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.customerType = typeFilter;
    if (businessTypeFilter) params.businessType = businessTypeFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (searchTerm) params.search = searchTerm;

    return dispatch(fetchCustomers(params)).then(() => {
      if (!silent) {
        setLastUpdated(new Date());
      }
    });
  }, [dispatch, currentPage, itemsPerPage, statusFilter, typeFilter, businessTypeFilter, priorityFilter, searchTerm]);

  // Load stats
  const loadStats = useCallback(() => {
    return dispatch(fetchCustomerStats());
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [loadCustomers, loadStats]);

  // Smart polling for real-time updates
  useEffect(() => {
    console.log(`🔴 LIVE: Optimized polling - checking every ${pollingInterval / 1000}s`);

    intervalRef.current = setInterval(async () => {
      try {
        const lastCheck = lastUpdated.toISOString();
        const response = await fetch(
          `${ENV_CONFIG.apiUrl}/customers/check-new?lastCheck=${lastCheck}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) throw new Error('Check failed');

        const result = await response.json();

        // Check if there are changes
        if (result.data.hasNew || result.data.totalCount !== (customers?.length || 0)) {
          console.log('✅ New changes detected, refreshing data...');
          loadCustomers(true);
          loadStats();
          noChangeCount.current = 0;

          // Speed up polling if we have changes
          if (pollingInterval > 30000) {
            setPollingInterval(30000);
          }
        } else {
          noChangeCount.current += 1;

          // Slow down polling if no changes
          if (noChangeCount.current >= 3 && pollingInterval < 60000) {
            const newInterval = Math.min(pollingInterval + 10000, 60000);
            console.log(`⏱️ No changes, slowing down to ${newInterval / 1000}s`);
            setPollingInterval(newInterval);
          }
        }
      } catch (error) {
        console.error('❌ Check error:', error);
        loadCustomers(true);
      }
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollingInterval, loadCustomers, loadStats, customers, lastUpdated]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadCustomers();
    }
  }, [statusFilter, typeFilter, businessTypeFilter, priorityFilter, searchTerm]);

  // Handle view customer
  const handleView = (customer) => {
    dispatch(setSelectedCustomer(customer));
    setShowDetailsModal(true);
  };

  // Handle delete customer
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to deactivate this customer?')) {
      dispatch(deleteCustomer({ id, hard: false })).then(() => {
        loadCustomers();
        loadStats();
      });
    }
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      dispatch(clearSelectedCustomer());
    }, 300);
  };

  // Handle add customer success
  const handleAddSuccess = () => {
    loadCustomers();
    loadStats();
    setShowAddModal(false);
  };

  // Handle update success
  const handleUpdateSuccess = () => {
    loadCustomers();
    loadStats();
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Icon */}
      <div className="py-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Customers
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Manage construction clients and contractors
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters Section - Enhanced */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <CustomerFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            businessTypeFilter={businessTypeFilter}
            priorityFilter={priorityFilter}
            searchTerm={searchTerm}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onBusinessTypeChange={setBusinessTypeFilter}
            onPriorityChange={setPriorityFilter}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Customer List - Premium Design */}
        {loading && customers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading customers...</p>
            </div>
          </div>
        ) : customers && customers.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                    {customers.map((customer) => (
                      <CustomerCard
                        key={customer._id}
                        customer={customer}
                        onView={handleView}
                        onDelete={handleDelete}
                        onWhatsApp={(phone, name) =>
                          openWhatsAppChat(
                            phone,
                            name,
                            `Hello ${name}, This is Alcoa Scaffolding. How can we help you today?`
                          )
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {customers.length > 0 && (
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
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-20">
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter || typeFilter || businessTypeFilter || priorityFilter
                    ? 'No customers match your filters'
                    : 'No customers yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center">
                  {searchTerm || statusFilter || typeFilter || businessTypeFilter || priorityFilter
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                    : 'Start building your customer base by adding your first client or contractor'}
                </p>
                {!searchTerm && !statusFilter && !typeFilter && !businessTypeFilter && !priorityFilter && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Customer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={handleCloseDetails}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {showAddModal && (
        <AddCustomerModal onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />
      )}
    </div>
  );
};

export default Customers;
