/**
 * Payment Form Component
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';

const PaymentForm = ({ payment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    paymentNumber: '',
    vendorName: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    paymentMode: 'bank_transfer',
    status: 'confirmed',
  });

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    }
  }, [payment]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vendorName || !formData.amount) {
      toast.error('Vendor name and amount are required');
      return;
    }

    if (!payment) {
      formData._id = Date.now().toString();
      formData.paymentNumber = `PMT2025${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Vendor Name" name="vendorName" value={formData.vendorName} onChange={handleChange} required />
        <Input label="Payment Date" name="paymentDate" type="date" value={formData.paymentDate} onChange={handleChange} required />
        <Input label="Amount (AED)" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} required />
        
        <Select
          label="Payment Mode"
          name="paymentMode"
          value={formData.paymentMode}
          onChange={handleChange}
          options={[
            { value: 'cash', label: 'Cash' },
            { value: 'bank_transfer', label: 'Bank Transfer' },
            { value: 'cheque', label: 'Cheque' },
          ]}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'cleared', label: 'Cleared' },
          ]}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="danger">{payment ? 'Update' : 'Add'} Payment</Button>
      </div>
    </form>
  );
};

export default PaymentForm;

