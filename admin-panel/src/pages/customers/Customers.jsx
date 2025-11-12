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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Customers
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your construction company clients and contractors
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters */}
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

        {/* Customer List */}
        <div className="mt-6">
          {loading && customers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading customers...</p>
            </div>
          ) : customers && customers.length > 0 ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No customers found
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter || typeFilter || businessTypeFilter || priorityFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first customer'}
              </p>
              {!searchTerm && !statusFilter && !typeFilter && !businessTypeFilter && !priorityFilter && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add First Customer
                </button>
              )}
            </div>
          )}
        </div>
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
