/**
 * Invoice Form with Line Items (Sales & Purchase)
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';
import { mockCustomers, mockVendors } from '../../data/mockData';

const InvoiceForm = ({ invoice, onSave, onCancel, type = 'sales' }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerName: '',
    vendorName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    items: [
      { id: 1, description: '', quantity: 1, unit: 'Piece', unitPrice: 0, discount: 0, total: 0 }
    ],
    subtotal: 0,
    vat: 0,
    total: 0,
    paidAmount: 0,
    balance: 0,
    paymentStatus: 'unpaid',
    status: 'draft',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        items: invoice.items || [{ id: 1, description: '', quantity: 1, unit: 'Piece', unitPrice: 0, discount: 0, total: 0 }]
      });
    }
  }, [invoice]);

  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
    const vat = subtotal * 0.05;
    const total = subtotal + vat;
    const balance = total - (formData.paidAmount || 0);
    const paymentStatus = balance <= 0 ? 'paid' : formData.paidAmount > 0 ? 'partially_paid' : 'unpaid';
    
    setFormData(prev => ({ ...prev, subtotal, vat, total, balance, paymentStatus }));
  }, [formData.items, formData.paidAmount]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), description: '', quantity: 1, unit: 'Piece', unitPrice: 0, discount: 0, total: 0 }]
    });
  };

  const removeLineItem = (id) => {
    if (formData.items.length === 1) {
      toast.error('At least one item required');
      return;
    }
    setFormData({ ...formData, items: formData.items.filter(i => i.id !== id) });
  };

  const updateLineItem = (id, field, value) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const itemTotal = updated.quantity * updated.unitPrice;
        updated.total = itemTotal - (itemTotal * updated.discount / 100);
        return updated;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameField = type === 'sales' ? 'customerName' : 'vendorName';
    if (!formData[nameField]) {
      toast.error(`${type === 'sales' ? 'Customer' : 'Vendor'} is required`);
      return;
    }

    if (!invoice) {
      formData._id = Date.now().toString();
      formData.invoiceNumber = `${type === 'sales' ? 'INV' : 'PINV'}2025${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
    }

    onSave(formData);
  };

  const dataSource = type === 'sales' ? mockCustomers : mockVendors;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={type === 'sales' ? 'Customer' : 'Vendor'}
            name={type === 'sales' ? 'customerName' : 'vendorName'}
            value={type === 'sales' ? formData.customerName : formData.vendorName}
            onChange={handleChange}
            required
            options={dataSource.map(d => ({ value: d.companyName, label: d.companyName }))}
          />
          <Input label="Invoice Date" name="invoiceDate" type="date" value={formData.invoiceDate} onChange={handleChange} required />
          <Input label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} required />
          <Input label="Paid Amount (AED)" name="paidAmount" type="number" step="0.01" value={formData.paidAmount} onChange={handleChange} />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <div className="flex justify-between mb-4 pb-2 border-b">
          <h3 className="text-base font-semibold text-gray-900">Items</h3>
          <button type="button" onClick={addLineItem} className="btn btn-primary text-sm py-2">+ Add Item</button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-24">Qty</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-28">Unit</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">Price</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-24">Disc %</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">Total</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase w-16">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {formData.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2"><input type="text" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)} placeholder="Item" className="w-full px-2 py-1.5 border rounded text-sm" /></td>
                  <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded text-sm" /></td>
                  <td className="px-3 py-2">
                    <select value={item.unit} onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm">
                      <option>Piece</option>
                      <option>Set</option>
                      <option>Meter</option>
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded text-sm" /></td>
                  <td className="px-3 py-2"><input type="number" value={item.discount} onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded text-sm" /></td>
                  <td className="px-3 py-2"><span className="font-semibold text-sm">{item.total.toFixed(2)}</span></td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={() => removeLineItem(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
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

        <div className="mt-4 flex justify-end">
          <div className="w-80 space-y-2 bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-700">Subtotal:</span><span className="font-semibold">AED {formData.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-sm font-medium text-gray-700">VAT (5%):</span><span className="font-semibold">AED {formData.vat.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t"><span className="font-bold">Grand Total:</span><span className="text-xl font-bold text-blue-600">AED {formData.total.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">Paid:</span><span className="text-green-600 font-semibold">AED {formData.paidAmount.toFixed(2)}</span></div>
            <div className="flex justify-between pt-2 border-t"><span className="font-bold text-red-600">Balance:</span><span className="text-lg font-bold text-red-600">AED {formData.balance.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary">{invoice ? 'Update' : 'Create'} Invoice</Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
