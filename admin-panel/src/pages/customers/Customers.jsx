/**
 * Customers Page - Dynamic with API Integration
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ViewCustomerModal, DeleteConfirmationModal } from '../../components/common';
import { CustomerForm } from '../../components/forms';
import { 
  fetchCustomers, 
  fetchCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer 
} from '../../store/slices/customerSlice';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Customers = () => {
  // Redux
  const dispatch = useDispatch();
  const { customers, stats, loading, error } = useSelector(state => state.customer);

  // Local state
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Load data on mount - only once
  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 100 }));
    dispatch(fetchCustomerStats());
  }, []); // Empty dependency array - load only on mount

  // Update filtered customers when data changes
  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(c => 
        c.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleView = (customer) => {
    setViewingCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleSave = async (customerData) => {
    try {
      if (editingCustomer) {
        await dispatch(updateCustomer({ 
          id: editingCustomer._id, 
          data: customerData 
        })).unwrap();
        toast.success('Customer updated successfully!');
      } else {
        await dispatch(createCustomer(customerData)).unwrap();
        toast.success('Customer added successfully!');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      // Refresh stats
      dispatch(fetchCustomerStats());
    } catch (error) {
      toast.error(error || 'Operation failed');
    }
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCustomer) {
      try {
        await dispatch(deleteCustomer(deletingCustomer._id)).unwrap();
        toast.success('Customer deleted successfully!');
        setIsDeleteModalOpen(false);
        setDeletingCustomer(null);
        // Refresh stats
        dispatch(fetchCustomerStats());
      } catch (error) {
        toast.error(error || 'Failed to delete customer');
      }
    }
  };

  const handleExportPDF = () => {
    toast.success('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting to Excel...');
  };

  const totalCustomers = stats?.totalCustomers || 0;
  const activeCustomers = stats?.activeCustomers || 0;
  const totalCreditLimit = stats?.totalCreditLimit || 0;
  const totalOutstanding = stats?.totalOutstanding || 0;

  return (
    <div className="space-y-6">
      {/* Search Bar & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search customers"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Excel</span>
          </button>
          <button onClick={handleAdd} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Total</p>
          <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Active</p>
          <p className="text-3xl font-bold mt-2">{activeCustomers}</p>
        </div>
        <div className="bg-orange-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Credit Limit</p>
          <p className="text-2xl font-bold mt-2">AED {totalCreditLimit.toLocaleString()}</p>
        </div>
        <div className="bg-purple-600 text-white rounded-lg p-5 shadow-sm">
          <p className="text-sm font-medium opacity-90">Outstanding</p>
          <p className="text-2xl font-bold mt-2">AED {totalOutstanding.toLocaleString()}</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => dispatch(fetchCustomers({ page: 1, limit: 100 }))}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Credit Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No customers found matching your search' : 'No customers yet. Add your first customer!'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleView(customer)}
                          className="text-blue-600 hover:text-blue-800 font-mono font-semibold text-sm"
                        >
                          {customer.customerCode}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{customer.companyName}</p>
                          <p className="text-xs text-gray-500">{customer.contactPerson}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          AED {customer.creditLimit?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-semibold ${
                          customer.balance > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          AED {customer.balance?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {/* View */}
                          <button
                            onClick={() => handleView(customer)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
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

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }} 
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'} 
        subtitle="Enter customer information"
        size="lg"
      >
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>

      {/* View Modal */}
      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCustomer(null);
        }}
        customer={viewingCustomer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingCustomer(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        entityName={deletingCustomer?.companyName}
        warningText="This action cannot be undone."
      />
    </div>
  );
};

export default Customers;
