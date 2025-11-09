/**
 * Product Add/Edit Form Component
 */

import { useState, useEffect } from 'react';
import { Input, Select, Button } from '../ui';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    description: '',
    category: 'scaffolding',
    subcategory: '',
    primaryUnit: 'pcs',
    barcode: '',
    sku: '',
    purchasePrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStockLevel: 0,
    reorderLevel: 0,
    isActive: true,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.itemName) {
      toast.error('Item name is required');
      return;
    }

    if (!product) {
      formData._id = Date.now().toString();
      formData.itemCode = `ITM${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      formData.createdAt = new Date().toISOString();
    }

    onSave(formData);
    toast.success(product ? 'Product updated!' : 'Product added!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Item Name"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            required
            className="md:col-span-2"
          />

          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: 'scaffolding', label: 'Scaffolding' },
              { value: 'ladders', label: 'Ladders' },
              { value: 'accessories', label: 'Accessories' },
              { value: 'safety_equipment', label: 'Safety Equipment' },
              { value: 'spare_parts', label: 'Spare Parts' },
            ]}
          />

          <Input
            label="Subcategory"
            name="subcategory"
            value={formData.subcategory}
            onChange={handleChange}
          />

          <Input
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="SKU-CODE"
          />

          <Input
            label="Barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="1234567890123"
          />

          <Input
            label="Primary Unit"
            name="primaryUnit"
            value={formData.primaryUnit}
            onChange={handleChange}
            placeholder="pcs, kg, meter, etc."
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Purchase Price (AED)"
            name="purchasePrice"
            type="number"
            step="0.01"
            value={formData.purchasePrice}
            onChange={handleChange}
          />

          <Input
            label="Selling Price (AED)"
            name="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleChange}
          />

          <Input
            label="Current Stock"
            name="currentStock"
            type="number"
            value={formData.currentStock}
            onChange={handleChange}
          />

          <Input
            label="Min Stock Level"
            name="minStockLevel"
            type="number"
            value={formData.minStockLevel}
            onChange={handleChange}
          />

          <Input
            label="Reorder Level"
            name="reorderLevel"
            type="number"
            value={formData.reorderLevel}
            onChange={handleChange}
          />

          <div className="flex items-center space-x-2 pt-8">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

