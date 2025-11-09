/**
 * Bank Account Form Component
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';

const BankAccountForm = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    accountType: 'current',
    currency: 'AED',
    currentBalance: 0,
    isActive: true,
  });

  useEffect(() => {
    if (account) {
      setFormData(account);
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.accountNumber || !formData.accountName || !formData.bankName) {
      toast.error('Account number, name, and bank are required');
      return;
    }

    if (!account) {
      formData._id = Date.now().toString();
      formData.isPrimary = false;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Account Number"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          required
          placeholder="1234567890"
        />

        <Input
          label="Account Name"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          required
          placeholder="Operating Account"
        />

        <Input
          label="Bank Name"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          required
          placeholder="Emirates NBD"
        />

        <Select
          label="Account Type"
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          options={[
            { value: 'current', label: 'Current' },
            { value: 'savings', label: 'Savings' },
            { value: 'cash', label: 'Cash' },
          ]}
        />

        <Select
          label="Currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={[
            { value: 'AED', label: 'AED - UAE Dirham' },
            { value: 'USD', label: 'USD - US Dollar' },
            { value: 'EUR', label: 'EUR - Euro' },
          ]}
        />

        <Input
          label="Current Balance"
          name="currentBalance"
          type="number"
          step="0.01"
          value={formData.currentBalance}
          onChange={handleChange}
          required
        />

        <div className="flex items-center space-x-2 pt-8">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active Account
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">
          {account ? 'Update Account' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
};

export default BankAccountForm;

