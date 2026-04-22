/**
 * Quotations Page - Main Container
 * Manages quotation list display with filters, search, and pagination
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchQuotations,
  fetchQuotationStats,
  deleteQuotation,
  setSelectedQuotation,
  clearSelectedQuotation
} from '../../store/slices/quotationSlice';
import {
  StatsCards,
  QuotationFilters,
  QuotationCard,
  QuotationDetailsModal,
  QuotationFormModal,
  Pagination
} from '../../components/quotations';

const Quotations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quotations, stats, pagination, loading, statsLoading, selectedQuotation } = useSelector(
    (state) => state.quotations
  );

  // Local state
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  // Load quotations
  const loadQuotations = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage
    };

    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.quoteType = typeFilter;
    if (searchTerm) params.search = searchTerm;

    return dispatch(fetchQuotations(params));
  }, [dispatch, currentPage, itemsPerPage, statusFilter, typeFilter, searchTerm]);

  // Load stats
  const loadStats = useCallback(() => {
    return dispatch(fetchQuotationStats());
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    loadQuotations();
    loadStats();
  }, [loadQuotations, loadStats]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [statusFilter, typeFilter, searchTerm]);

  // Handle view quotation
  const handleView = (quotation) => {
    dispatch(setSelectedQuotation(quotation));
    setShowDetailsModal(true);
  };

  // Handle delete quotation
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      dispatch(deleteQuotation(id)).then(() => {
        loadQuotations();
        loadStats();
      });
    }
  };

  // Handle create new quotation
  const handleCreateNew = () => {
    setEditingQuotation(null);
    setShowFormModal(true);
  };

  // Handle edit quotation
  const handleEdit = (quotation) => {
    setEditingQuotation(quotation);
    setShowFormModal(true);
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setTimeout(() => {
      dispatch(clearSelectedQuotation());
    }, 300);
  };

  // Handle form success
  const handleFormSuccess = () => {
    loadQuotations();
    loadStats();
    setShowFormModal(false);
    setEditingQuotation(null);
  };

  // Handle update from details modal
  const handleUpdateSuccess = () => {
    loadQuotations();
    loadStats();
  };

  // Handle convert to order
  const handleConvertToOrder = (quotation) => {
    toast('Convert to Rental Order - Will be available after Rental Orders module is built', {
      icon: 'ℹ️',
      duration: 4000,
    });
    // TODO: Implement after Rental Orders module is built
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Icon */}
      <div className="py-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Quotations
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Create and manage equipment rental & sales quotes
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Quotation
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StatsCards stats={stats} loading={statsLoading} />

        {/* Filters Section - Enhanced */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6">
          <QuotationFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            searchTerm={searchTerm}
            onStatusChange={setStatusFilter}
            onTypeChange={setTypeFilter}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Quotation List - Premium Design */}
        {loading && quotations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-6 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading quotations...</p>
            </div>
          </div>
        ) : quotations && quotations.length > 0 ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Quote #
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Valid Until
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                    {quotations.map((quotation) => (
                      <QuotationCard
                        key={quotation._id}
                        quotation={quotation}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {quotations.length > 0 && (
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mb-5">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter || typeFilter
                    ? 'No quotations match your filters'
                    : 'No quotations yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center">
                  {searchTerm || statusFilter || typeFilter
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                    : 'Start creating professional quotes for your customers'}
                </p>
                {!searchTerm && !statusFilter && !typeFilter && (
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Quotation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetailsModal && selectedQuotation && (
        <QuotationDetailsModal
          quotation={selectedQuotation}
          onClose={handleCloseDetails}
          onUpdate={handleUpdateSuccess}
          onEdit={handleEdit}
          onConvert={handleConvertToOrder}
        />
      )}

      {showFormModal && (
        <QuotationFormModal
          quotation={editingQuotation}
          onClose={() => {
            setShowFormModal(false);
            setEditingQuotation(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default Quotations;
