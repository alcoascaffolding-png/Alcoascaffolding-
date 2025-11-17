/**
 * Professional Quotation Form
 * Comprehensive form matching professional invoice format
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createQuotation, updateQuotation } from '../../store/slices/quotationSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import toast from 'react-hot-toast';

const ProfessionalQuotationForm = ({ quotation = null, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customers);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, items, charges, terms

  // Form state
  const [formData, setFormData] = useState({
    customer: quotation?.customer?._id || quotation?.customer || '',
    customerAddress: quotation?.customerAddress || '',
    customerTRN: quotation?.customerTRN || '',
    contactPersonName: quotation?.contactPersonName || '',
    contactPersonDesignation: quotation?.contactPersonDesignation || '',
    contactPersonEmail: quotation?.contactPersonEmail || '',
    contactPersonPhone: quotation?.contactPersonPhone || '',
    quoteType: quotation?.quoteType || 'rental',
    quoteDate: quotation?.quoteDate ? new Date(quotation.quoteDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: quotation?.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
    subject: quotation?.subject || '',
    salesExecutive: quotation?.salesExecutive || '',
    preparedBy: quotation?.preparedBy || '',
    customerPONumber: quotation?.customerPONumber || '',
    referenceNumber: quotation?.referenceNumber || '',
    paymentTerms: quotation?.paymentTerms || 'Cash/CDC',
    deliveryTerms: quotation?.deliveryTerms || '7-10 days from date of order',
    projectDuration: quotation?.projectDuration || '',
    deliveryCharges: quotation?.deliveryCharges || 0,
    installationCharges: quotation?.installationCharges || 0,
    pickupCharges: quotation?.pickupCharges || 0,
    discount: quotation?.discount || 0,
    discountType: quotation?.discountType || 'fixed',
    vatPercentage: quotation?.vatPercentage || 5,
    notes: quotation?.notes || '',
    termsAndConditions: quotation?.termsAndConditions || ''
  });

  const [items, setItems] = useState(quotation?.items || []);
  const [currentItem, setCurrentItem] = useState({
    equipmentType: '',
    equipmentCode: '',
    description: '',
    specifications: '',
    size: '',
    weight: 0,
    cbm: 0,
    quantity: 1,
    unit: 'Nos',
    rentalDuration: { value: 1, unit: 'day' },
    ratePerUnit: 0,
    subtotal: 0,
    itemImage: '' // Image URL or base64
  });

  // Load customers on mount
  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers({ limit: 100 }));
    }
  }, [dispatch, customers.length]);

  // Auto-fill customer details when customer is selected
  useEffect(() => {
    if (formData.customer && customers.length > 0) {
      const selectedCustomer = customers.find(c => c._id === formData.customer);
      if (selectedCustomer && !quotation) { // Only auto-fill for new quotations
        const primaryAddress = selectedCustomer.addresses?.find(a => a.isPrimary) || selectedCustomer.addresses?.[0];
        const primaryContact = selectedCustomer.contactPersons?.find(c => c.isPrimary) || selectedCustomer.contactPersons?.[0];
        
        setFormData(prev => ({
          ...prev,
          customerAddress: primaryAddress ? `${primaryAddress.addressLine1}, ${primaryAddress.city}, ${primaryAddress.emirate}` : '',
          customerTRN: selectedCustomer.vatRegistrationNumber || '',
          contactPersonName: primaryContact?.name || '',
          contactPersonDesignation: primaryContact?.designation || '',
          contactPersonEmail: primaryContact?.email || selectedCustomer.primaryEmail || '',
          contactPersonPhone: primaryContact?.phone || selectedCustomer.primaryPhone || ''
        }));
      }
    }
  }, [formData.customer, customers, quotation]);

  // Calculate item subtotal
  useEffect(() => {
    const subtotal = currentItem.quantity * currentItem.ratePerUnit;
    if (formData.quoteType === 'rental' && currentItem.rentalDuration) {
      const duration = currentItem.rentalDuration.value || 1;
      setCurrentItem(prev => ({ ...prev, subtotal: subtotal * duration }));
    } else {
      setCurrentItem(prev => ({ ...prev, subtotal }));
    }
  }, [currentItem.quantity, currentItem.ratePerUnit, currentItem.rentalDuration, formData.quoteType]);

  // Add item to list
  const handleAddItem = () => {
    if (!currentItem.equipmentType || currentItem.quantity <= 0 || currentItem.ratePerUnit <= 0) {
      toast.error('Please fill required fields: Equipment Type, Quantity, and Rate');
      return;
    }

    setItems([...items, { ...currentItem }]);
    setCurrentItem({
      equipmentType: '',
      equipmentCode: '',
      description: '',
      specifications: '',
      size: '',
      weight: 0,
      cbm: 0,
      quantity: 1,
      unit: 'Nos',
      rentalDuration: { value: 1, unit: 'day' },
      ratePerUnit: 0,
      subtotal: 0,
      itemImage: ''
    });
    toast.success('Item added!');
    
    // Auto-switch to items tab to see the added item
    setActiveTab('items');
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    toast.success('Item removed');
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    let beforeVAT = subtotal + 
                    (parseFloat(formData.deliveryCharges) || 0) + 
                    (parseFloat(formData.installationCharges) || 0) + 
                    (parseFloat(formData.pickupCharges) || 0);

    // Apply discount
    if (formData.discount > 0) {
      if (formData.discountType === 'percentage') {
        beforeVAT -= (beforeVAT * formData.discount / 100);
      } else {
        beforeVAT -= parseFloat(formData.discount);
      }
    }

    const vatAmount = (beforeVAT * formData.vatPercentage / 100);
    const total = beforeVAT + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const totals = calculateTotals();

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Please add at least one item to the quotation');
      setActiveTab('items');
      return;
    }

    if (!formData.customer) {
      toast.error('Please select a customer');
      setActiveTab('basic');
      return;
    }

    if (!formData.validUntil) {
      toast.error('Please set valid until date');
      setActiveTab('basic');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        items,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        totalAmount: totals.total
      };

      if (quotation) {
        await dispatch(updateQuotation({ id: quotation._id, data: submitData })).unwrap();
      } else {
        await dispatch(createQuotation(submitData)).unwrap();
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving quotation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quotation ? `Edit Quotation: ${quotation.quoteNumber}` : 'Create Professional Quotation'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex space-x-4">
              {[
                { id: 'basic', label: 'Basic Info', icon: '📋' },
                { id: 'items', label: `Items (${items.length})`, icon: '📦' },
                { id: 'charges', label: 'Charges & VAT', icon: '💰' },
                { id: 'terms', label: 'Terms', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <form id="quotationForm" onSubmit={handleSubmit} className="space-y-6">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Customer Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Select Customer *
                        </label>
                        <select
                          name="customer"
                          value={formData.customer}
                          onChange={handleChange}
                          required
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-- Select Customer --</option>
                          {customers.map(customer => (
                            <option key={customer._id} value={customer._id}>
                              {customer.companyName} ({customer.primaryEmail})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Customer Address
                        </label>
                        <textarea
                          name="customerAddress"
                          value={formData.customerAddress}
                          onChange={handleChange}
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Street, Area, City, Emirate"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Customer TRN
                        </label>
                        <input
                          type="text"
                          name="customerTRN"
                          value={formData.customerTRN}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="100123456700003"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactPersonName"
                          value={formData.contactPersonName}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Contact person name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Designation
                        </label>
                        <input
                          type="text"
                          name="contactPersonDesignation"
                          value={formData.contactPersonDesignation}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Project Manager"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="contactPersonPhone"
                          value={formData.contactPersonPhone}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="+971 XX XXXXXXX"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quotation Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quote Type *
                        </label>
                        <select
                          name="quoteType"
                          value={formData.quoteType}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="rental">HIRE/RENTAL</option>
                          <option value="sales">SALE</option>
                          <option value="service">SERVICE</option>
                          <option value="both">HIRE & SALE</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valid Until *
                        </label>
                        <input
                          type="date"
                          name="validUntil"
                          value={formData.validUntil}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Sales Executive
                        </label>
                        <input
                          type="text"
                          name="salesExecutive"
                          value={formData.salesExecutive}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Customer PO Number
                        </label>
                        <input
                          type="text"
                          name="customerPONumber"
                          value={formData.customerPONumber}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Customer's PO reference"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject / Project Description
                        </label>
                        <textarea
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., HIRE OF ALUMINIUM SCAFFOLDING FOR CONSTRUCTION PROJECT"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Duration (for rentals)
                        </label>
                        <input
                          type="text"
                          name="projectDuration"
                          value={formData.projectDuration}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 1 Month (01-11-2025 to 01-12-2025)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Payment Terms
                        </label>
                        <select
                          name="paymentTerms"
                          value={formData.paymentTerms}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="Cash/CDC">Cash/CDC</option>
                          <option value="Cash">Cash on Delivery</option>
                          <option value="7 Days Credit">7 Days Credit</option>
                          <option value="15 Days Credit">15 Days Credit</option>
                          <option value="30 Days Credit">30 Days Credit</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ITEMS */}
              {activeTab === 'items' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Add Equipment / Service Items
                    </h3>
                    
                    {/* Quick Add Item Form with CLEAR LABELS */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        💡 <strong>Required fields:</strong> Equipment Name, Quantity, Rate | 
                        <strong className="ml-2">Optional:</strong> All other fields for detailed quotations
                      </p>
                      
                      {/* ROW 1: Basic Item Info */}
                      <div className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-3">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Equipment Name *
                          </label>
                          <input
                            type="text"
                            name="equipmentType"
                            value={currentItem.equipmentType}
                            onChange={handleItemChange}
                            placeholder="e.g., Single Width Scaffolding"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Code
                          </label>
                          <input
                            type="text"
                            name="equipmentCode"
                            value={currentItem.equipmentCode}
                            onChange={handleItemChange}
                            placeholder="SWS-001"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Description/Specs
                          </label>
                          <input
                            type="text"
                            name="description"
                            value={currentItem.description}
                            onChange={handleItemChange}
                            placeholder="Mobile tower, 3m working height"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Weight (KG)
                          </label>
                          <input
                            type="number"
                            name="weight"
                            value={currentItem.weight || ''}
                            onChange={handleItemChange}
                            placeholder="85.5"
                            min="0"
                            step="0.01"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            CBM
                          </label>
                          <input
                            type="number"
                            name="cbm"
                            value={currentItem.cbm || ''}
                            onChange={handleItemChange}
                            placeholder="0.45"
                            min="0"
                            step="0.01"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Size/Dimensions
                          </label>
                          <input
                            type="text"
                            name="size"
                            value={currentItem.size}
                            onChange={handleItemChange}
                            placeholder="3m x 2m x 1.5m"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* ROW 1.5: Image Upload */}
                      <div className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-12">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Item Image (Optional)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="itemImage"
                              value={currentItem.itemImage}
                              onChange={handleItemChange}
                              placeholder="Paste image URL or upload file below"
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded cursor-pointer inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setCurrentItem({ ...currentItem, itemImage: reader.result });
                                      toast.success('Image loaded!');
                                    };
                                    reader.onerror = () => {
                                      toast.error('Failed to load image');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            {currentItem.itemImage && (
                              <button
                                type="button"
                                onClick={() => setCurrentItem({ ...currentItem, itemImage: '' })}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                title="Remove image"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          {currentItem.itemImage && (
                            <div className="mt-2">
                              <img 
                                src={currentItem.itemImage} 
                                alt="Item preview" 
                                className="h-20 w-20 object-cover border border-gray-300 dark:border-gray-600 rounded"
                                onError={() => {
                                  toast.error('Failed to load image. Please check the URL.');
                                  setCurrentItem({ ...currentItem, itemImage: '' });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ROW 2: Quantity, Duration, Rate */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Quantity * 
                          </label>
                          <input
                            type="number"
                            name="quantity"
                            value={currentItem.quantity}
                            onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                            placeholder="1"
                            min="1"
                            required
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            name="unit"
                            value={currentItem.unit}
                            onChange={handleItemChange}
                            placeholder="Nos"
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        {formData.quoteType === 'rental' && (
                          <>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Rental Duration
                              </label>
                              <input
                                type="number"
                                value={currentItem.rentalDuration.value}
                                onChange={(e) => setCurrentItem({
                                  ...currentItem,
                                  rentalDuration: {...currentItem.rentalDuration, value: parseInt(e.target.value) || 1}
                                })}
                                placeholder="30"
                                min="1"
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Period
                              </label>
                              <select
                                value={currentItem.rentalDuration.unit}
                                onChange={(e) => setCurrentItem({
                                  ...currentItem,
                                  rentalDuration: {...currentItem.rentalDuration, unit: e.target.value}
                                })}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="day">Day(s)</option>
                                <option value="week">Week(s)</option>
                                <option value="month">Month(s)</option>
                              </select>
                            </div>
                          </>
                        )}
                        
                        <div className={formData.quoteType === 'rental' ? 'col-span-2' : 'col-span-4'}>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Rate per Unit (AED) *
                          </label>
                          <input
                            type="number"
                            name="ratePerUnit"
                            value={currentItem.ratePerUnit}
                            onChange={(e) => setCurrentItem({...currentItem, ratePerUnit: parseFloat(e.target.value) || 0})}
                            placeholder="150.00"
                            min="0"
                            step="0.01"
                            required
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className={formData.quoteType === 'rental' ? 'col-span-2' : 'col-span-4'}>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Subtotal (Auto) 🧮
                          </label>
                          <input
                            type="number"
                            value={currentItem.subtotal}
                            placeholder="0.00"
                            disabled
                            className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
                          />
                        </div>
                        
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            &nbsp;
                          </label>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="w-full px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                          >
                            ➕ Add
                          </button>
                        </div>
                      </div>
                      
                      {/* Help Text */}
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded p-2">
                        <strong>💡 Quick Guide:</strong>
                        <ul className="ml-4 mt-1 space-y-0.5">
                          <li>• <strong>Equipment Name</strong> = What you're renting/selling (e.g., "Cuplock Ledger")</li>
                          <li>• <strong>Code</strong> = Internal product code (e.g., "CL-2.5M")</li>
                          <li>• <strong>Description</strong> = Details (e.g., "48.3mm x 2.5M Painted")</li>
                          <li>• <strong>Weight & CBM</strong> = For logistics (optional)</li>
                          <li>• <strong>Size</strong> = Dimensions (e.g., "3m x 2m")</li>
                          <li>• <strong>Item Image</strong> = Upload image or paste URL (optional, will appear in PDF)</li>
                          <li>• <strong>Quantity</strong> = How many units</li>
                          <li>• <strong>Unit</strong> = Nos/Set/Service/Meter (default: Nos)</li>
                          {formData.quoteType === 'rental' && (
                            <li>• <strong>Duration</strong> = Rental period (30 days, 2 weeks, 1 month)</li>
                          )}
                          <li>• <strong>Rate</strong> = Price per unit {formData.quoteType === 'rental' && '(daily/weekly/monthly)'}</li>
                          <li>• <strong>Subtotal</strong> = Auto-calculated (Qty × Rate {formData.quoteType === 'rental' && '× Duration'})</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  {items.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">
                        Added Items ({items.length})
                      </h4>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SN</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Equipment</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Image</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                                {formData.quoteType === 'rental' && (
                                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Duration</th>
                                )}
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Rate</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-3 py-2 text-sm text-center">{index + 1}</td>
                                  <td className="px-3 py-2">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.equipmentType}</div>
                                    {item.description && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                    )}
                                    {item.size && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400">Size: {item.size}</div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {item.itemImage ? (
                                      <img 
                                        src={item.itemImage} 
                                        alt={item.equipmentType}
                                        className="h-12 w-12 object-cover border border-gray-300 dark:border-gray-600 rounded mx-auto"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-400">No image</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center text-sm">{item.quantity} {item.unit}</td>
                                  {formData.quoteType === 'rental' && (
                                    <td className="px-3 py-2 text-center text-sm text-blue-600 dark:text-blue-400">
                                      {item.rentalDuration.value} {item.rentalDuration.unit}(s)
                                    </td>
                                  )}
                                  <td className="px-3 py-2 text-right text-sm">{item.ratePerUnit.toFixed(2)}</td>
                                  <td className="px-3 py-2 text-right text-sm font-semibold">{item.subtotal.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(index)}
                                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CHARGES & VAT */}
              {activeTab === 'charges' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Additional Charges
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Delivery Charges (AED)
                        </label>
                        <input
                          type="number"
                          name="deliveryCharges"
                          value={formData.deliveryCharges}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Installation/Assembly Charges (AED)
                        </label>
                        <input
                          type="number"
                          name="installationCharges"
                          value={formData.installationCharges}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Pickup/Disassembly Charges (AED)
                        </label>
                        <input
                          type="number"
                          name="pickupCharges"
                          value={formData.pickupCharges}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Discount
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleChange}
                            className="block w-24 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="fixed">AED</option>
                            <option value="percentage">%</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          VAT Percentage
                        </label>
                        <input
                          type="number"
                          name="vatPercentage"
                          value={formData.vatPercentage}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="0.01"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Summary - Large Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Financial Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 dark:text-gray-300">Items Subtotal:</span>
                        <span className="text-gray-900 dark:text-white font-semibold">AED {totals.subtotal.toLocaleString()}</span>
                      </div>
                      {(formData.deliveryCharges > 0 || formData.installationCharges > 0 || formData.pickupCharges > 0) && (
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Additional Charges:</span>
                          <span>AED {((parseFloat(formData.deliveryCharges) || 0) + (parseFloat(formData.installationCharges) || 0) + (parseFloat(formData.pickupCharges) || 0)).toLocaleString()}</span>
                        </div>
                      )}
                      {formData.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                          <span>Discount:</span>
                          <span>- AED {parseFloat(formData.discount).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base">
                        <span className="text-gray-700 dark:text-gray-300">VAT ({formData.vatPercentage}%):</span>
                        <span className="text-gray-900 dark:text-white font-semibold">AED {totals.vatAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-blue-300 dark:border-blue-600">
                        <span className="text-gray-900 dark:text-white">TOTAL AMOUNT:</span>
                        <span className="text-blue-600 dark:text-blue-400">AED {totals.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TERMS */}
              {activeTab === 'terms' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Delivery & Payment
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Delivery Terms
                        </label>
                        <input
                          type="text"
                          name="deliveryTerms"
                          value={formData.deliveryTerms}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 7-10 days from date of order"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes / Special Instructions
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Any special notes or instructions for this quotation..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      name="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={handleChange}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Standard terms and conditions..."
                    ></textarea>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {items.length} item(s) • Total: <span className="font-bold text-blue-600 dark:text-blue-400">AED {totals.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="quotationForm"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {quotation ? 'Update Quotation' : 'Create Quotation'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalQuotationForm;

