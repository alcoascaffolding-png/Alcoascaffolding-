/**
 * Enhanced Customer Form - Matches Screenshot
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';

const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    taxRegistrationNumber: '',
    email: '',
    phone: '',
    mobile: '',
    city: '',
    address: '',
    creditLimit: 100000,
    paymentTerms: 30,
    status: 'active',
  });

  useEffect(() => {
    if (customer) {
      setFormData(customer);
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.companyName) {
      toast.error('Company Name is required');
      return;
    }
    if (!formData.contactPerson) {
      toast.error('Contact Person is required');
      return;
    }
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone) {
      toast.error('Phone is required');
      return;
    }

    const customerData = { ...formData };

    if (!customer) {
      // New customer
      customerData._id = Date.now().toString();
      customerData.customerCode = `CUST${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      customerData.balance = 0;
      customerData.createdAt = new Date().toISOString();
    }

    onSave(customerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Information */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Company Information</h3>
        <div className="space-y-4">
          <div>
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Dubai Construction LLC"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="e.g., Ahmed Mohammed"
              required
            />
            <Input
              label="Tax Registration Number"
              name="taxRegistrationNumber"
              value={formData.taxRegistrationNumber}
              onChange={handleChange}
              placeholder="TRN-123456789"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@company.ae"
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+971 4 123 4567"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+971 50 123 4567"
            />
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Dubai"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Address</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Street address, building number, area"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Financial Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Credit Limit (AED)"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={handleChange}
            placeholder="100000"
          />
          <Select
            label="Payment Terms (Days)"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            options={[
              { value: 7, label: '7 Days' },
              { value: 15, label: '15 Days' },
              { value: 30, label: '30 Days' },
              { value: 45, label: '45 Days' },
              { value: 60, label: '60 Days' },
              { value: 90, label: '90 Days' },
            ]}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>{customer ? 'Update Customer' : 'Save Customer'}</span>
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
