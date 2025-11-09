/**
 * Advanced Quote Form with Line Items
 * Matches the screenshot design
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';
import { mockCustomers } from '../../data/mockData';

const QuoteForm = ({ quote, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    quoteNumber: '',
    customerName: '',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    subject: '',
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        unit: 'Piece',
        unitPrice: 0,
        discount: 0,
        total: 0
      }
    ],
    subtotal: 0,
    vat: 0,
    grandTotal: 0,
    termsAndConditions: '',
    status: 'draft',
  });

  useEffect(() => {
    if (quote) {
      setFormData({
        ...quote,
        items: quote.items || [{ id: 1, description: '', quantity: 1, unit: 'Piece', unitPrice: 0, discount: 0, total: 0 }]
      });
    }
  }, [quote]);

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [formData.items]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new line item
  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: 'Piece',
      unitPrice: 0,
      discount: 0,
      total: 0
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  // Remove line item
  const removeLineItem = (id) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  // Update line item
  const updateLineItem = (id, field, value) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate line total
        const itemTotal = updatedItem.quantity * updatedItem.unitPrice;
        const discountAmount = (itemTotal * updatedItem.discount) / 100;
        updatedItem.total = itemTotal - discountAmount;
        
        return updatedItem;
      }
      return item;
    });

    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vat = subtotal * 0.05; // 5% UAE VAT
    const grandTotal = subtotal + vat;

    setFormData(prev => ({
      ...prev,
      subtotal,
      vat,
      grandTotal,
      total: grandTotal // For compatibility with table display
    }));
  };

  const handleSubmit = (status) => (e) => {
    e.preventDefault();

    if (!formData.customerName) {
      toast.error('Please select a customer');
      return;
    }

    if (!formData.items.some(item => item.description)) {
      toast.error('Please add at least one item with description');
      return;
    }

    const quoteData = {
      ...formData,
      status,
    };

    if (!quote) {
      quoteData._id = Date.now().toString();
      quoteData.quoteNumber = `QT2025${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      quoteData.createdAt = new Date().toISOString();
    }

    onSave(quoteData);
  };

  return (
    <form className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Customer"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            options={mockCustomers.map(c => ({ value: c.companyName, label: c.companyName }))}
            placeholder="Select Customer"
          />

          <Input
            label="Reference Number"
            name="referenceNumber"
            value={formData.referenceNumber || ''}
            onChange={handleChange}
            placeholder="REF-001 (Auto-generated if empty)"
          />

          <Input
            label="Quotation Date"
            name="quoteDate"
            type="date"
            value={formData.quoteDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Valid Until"
            name="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={handleChange}
            required
          />

          <div className="md:col-span-2">
            <Input
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Quotation for Construction Materials"
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
          <button
            type="button"
            onClick={addLineItem}
            className="btn btn-primary text-sm py-2"
          >
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-24">Quantity</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-28">Unit</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">Unit Price (AED)</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-24">Disc. (%)</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">Total (AED)</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-16">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="1"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={item.unit}
                      onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Piece</option>
                      <option>Set</option>
                      <option>Meter</option>
                      <option>Kg</option>
                      <option>Box</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-gray-900 text-sm">
                      {item.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="mt-4 flex justify-end">
          <div className="w-full md:w-80 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-base font-semibold text-gray-900">AED {formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">VAT (5%):</span>
              <span className="text-base font-semibold text-gray-900">AED {formData.vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-300">
              <span className="text-base font-bold text-gray-900">Grand Total:</span>
              <span className="text-xl font-bold text-blue-600">AED {formData.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Terms & Conditions / Notes
        </label>
        <textarea
          name="termsAndConditions"
          value={formData.termsAndConditions}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Enter any additional terms, conditions, or notes..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <button
          type="button"
          onClick={handleSubmit('draft')}
          className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>Save as Draft</span>
        </button>
        <button
          type="button"
          onClick={handleSubmit('sent')}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>Send to Customer</span>
        </button>
      </div>
    </form>
  );
};

export default QuoteForm;
