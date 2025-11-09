/**
 * Vendor Add/Edit Form Component
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';

const VendorForm = ({ vendor, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    vendorCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    mobile: '',
    vendorType: 'distributor',
    status: 'active',
    creditLimit: 0,
    creditDays: 30,
    rating: 0,
    productCategories: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      country: 'UAE',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      setFormData(vendor);
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      billingAddress: {
        ...formData.billingAddress,
        [name]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.email) {
      toast.error('Company name and email are required');
      return;
    }

    if (!vendor) {
      formData._id = Date.now().toString();
      formData.vendorCode = `VND${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      formData.createdAt = new Date().toISOString();
      formData.totalPurchases = 0;
      formData.currentBalance = 0;
    }

    onSave(formData);
    toast.success(vendor ? 'Vendor updated!' : 'Vendor added!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />

          <Select
            label="Vendor Type"
            name="vendorType"
            value={formData.vendorType}
            onChange={handleChange}
            options={[
              { value: 'manufacturer', label: 'Manufacturer' },
              { value: 'distributor', label: 'Distributor' },
              { value: 'wholesaler', label: 'Wholesaler' },
              { value: 'retailer', label: 'Retailer' },
            ]}
          />

          <Input
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Input
            label="Rating (0-5)"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
          />

          <Input
            label="Credit Limit (AED)"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={handleChange}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Street"
            name="street"
            value={formData.billingAddress.street}
            onChange={handleAddressChange}
            className="md:col-span-2"
          />
          <Input
            label="City"
            name="city"
            value={formData.billingAddress.city}
            onChange={handleAddressChange}
          />
          <Input
            label="State"
            name="state"
            value={formData.billingAddress.state}
            onChange={handleAddressChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {vendor ? 'Update Vendor' : 'Add Vendor'}
        </Button>
      </div>
    </form>
  );
};

export default VendorForm;

