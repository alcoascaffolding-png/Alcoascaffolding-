/**
 * Quotes Page - Dynamic with API Integration
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PageWrapper, Modal, ViewQuoteModal, DeleteConfirmationModal } from '../../components/common';
import { QuoteForm } from '../../components/forms';
import { fetchQuotes, fetchQuoteStats, createQuote, updateQuote, deleteQuote } from '../../store/slices/quoteSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Quotes = () => {
  const [isUnderConstruction] = useState(true);
  
  const dispatch = useDispatch();
  const { items: quotes, stats, loading, error } = useSelector(state => state.quotes);

  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [viewingQuote, setViewingQuote] = useState(null);
  const [deletingQuote, setDeletingQuote] = useState(null);

  useEffect(() => {
    dispatch(fetchQuotes({ page: 1, limit: 100 }));
    dispatch(fetchQuoteStats());
  }, []);

  useEffect(() => {
    setFilteredQuotes(quotes);
  }, [quotes]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = quotes.filter(q => 
        q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuotes(filtered);
    } else {
      setFilteredQuotes(quotes);
    }
  }, [searchTerm, quotes]);

  const handleAdd = () => {
    setEditingQuote(null);
    setIsModalOpen(true);
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setIsModalOpen(true);
  };

  const handleView = (quote) => {
    setViewingQuote(quote);
    setIsViewModalOpen(true);
  };

  const handleSave = async (quoteData) => {
    try {
      if (editingQuote) {
        await dispatch(updateQuote({ id: editingQuote._id, data: quoteData })).unwrap();
        toast.success('Quote updated successfully!');
      } else {
        await dispatch(createQuote(quoteData)).unwrap();
        toast.success('Quote created successfully!');
      }
      setIsModalOpen(false);
      setEditingQuote(null);
      dispatch(fetchQuoteStats());
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleDeleteClick = (quote) => {
    setDeletingQuote(quote);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingQuote) {
      try {
        await dispatch(deleteQuote(deletingQuote._id)).unwrap();
        toast.success('Quote deleted successfully!');
        setIsDeleteModalOpen(false);
        setDeletingQuote(null);
        dispatch(fetchQuoteStats());
      } catch (error) {
        toast.error(error || 'Failed to delete quote');
      }
    }
  };

  const handleSend = (quote) => {
    const updatedQuote = { ...quote, status: 'sent' };
    dispatch(updateQuote({ id: quote._id, data: updatedQuote }));
    toast.success(`Quote ${quote.quoteNumber} sent to customer!`);
  };

  const handleExport = () => {
    toast.success('Exporting quotes...');
  };

  const totalQuotes = stats?.total || 0;
  const acceptedQuotes = stats?.accepted || 0;
  const pendingQuotes = stats?.pending || 0;
  const totalValue = stats?.totalValue || 0;

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Sales Quotes",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage customer quotations</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
          <button onClick={handleAdd} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Quote</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Quotes</p>
          <p className="text-3xl font-bold mt-2">{totalQuotes}</p>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Accepted</p>
          <p className="text-3xl font-bold mt-2">{acceptedQuotes}</p>
        </div>
        <div className="bg-orange-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Pending</p>
          <p className="text-3xl font-bold mt-2">{pendingQuotes}</p>
        </div>
        <div className="bg-purple-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Value</p>
          <p className="text-2xl font-bold mt-2">AED {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">No quotations found</td>
                  </tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <tr key={quote._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => handleView(quote)} className="text-blue-600 hover:text-blue-800 font-mono font-semibold">
                          {quote.quoteNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{quote.customerName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{format(new Date(quote.quoteDate), 'yyyy-MM-dd')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{format(new Date(quote.validUntil), 'yyyy-MM-dd')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{quote.items?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          AED {(quote.total || quote.grandTotal || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          quote.status === 'rejected' || quote.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleView(quote)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="View Details">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEdit(quote)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleSend(quote)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Send to Customer">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteClick(quote)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingQuote(null); }} 
        title={editingQuote ? 'Edit Quotation' : 'New Quotation'} 
        subtitle="Create a new customer quotation"
        size="full"
      >
        <QuoteForm quote={editingQuote} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingQuote(null); }} />
      </Modal>

      <ViewQuoteModal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setViewingQuote(null); }} quote={viewingQuote} />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingQuote(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message="Are you sure you want to delete this quotation?"
        entityName={deletingQuote?.quoteNumber}
        warningText="This action cannot be undone. All associated transactions will be archived."
      />
      </div>
    </PageWrapper>
  );
};

export default Quotes;
