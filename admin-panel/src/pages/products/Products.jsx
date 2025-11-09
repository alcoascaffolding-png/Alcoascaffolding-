/**
 * Products Page with Working CRUD
 */

import { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import ExportButtons from '../../components/common/ExportButtons';
import { ProductForm } from '../../components/forms';
import { mockProducts } from '../../data/mockData';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { 
      header: 'Code', 
      accessor: 'itemCode',
      render: (row) => <span className="font-mono font-semibold text-indigo-600 text-sm">{row.itemCode}</span>
    },
    { 
      header: 'Item', 
      accessor: 'itemName',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.itemName}</p>
          <p className="text-xs text-gray-500 capitalize">{row.category?.replace('_', ' ')}</p>
        </div>
      ),
    },
    { 
      header: 'SKU', 
      accessor: 'sku',
      render: (row) => <span className="font-mono text-xs text-gray-600">{row.sku}</span>
    },
    { 
      header: 'Stock', 
      accessor: 'currentStock',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span className={`font-bold ${
            row.currentStock === 0 ? 'text-red-600' :
            row.currentStock <= row.reorderLevel ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {row.currentStock}
          </span>
          <span className="text-xs text-gray-500">{row.primaryUnit}</span>
          {row.currentStock === 0 && (
            <span className="badge badge-danger text-xs">Out</span>
          )}
          {row.currentStock > 0 && row.currentStock <= row.reorderLevel && (
            <span className="badge badge-warning text-xs">Low</span>
          )}
        </div>
      ),
    },
    { 
      header: 'Price', 
      accessor: 'sellingPrice', 
      render: (row) => <span className="font-semibold text-green-600">AED {row.sellingPrice?.toFixed(2)}</span>
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-gray'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      setProducts(products.map(p => p._id === productData._id ? productData : p));
    } else {
      setProducts([productData, ...products]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (product) => {
    if (window.confirm(`Delete ${product.itemName}?`)) {
      setProducts(products.filter(p => p._id !== product._id));
      toast.success('Product deleted!');
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const outOfStock = products.filter(p => p.currentStock === 0).length;
  const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage product inventory"
        action={
          <button onClick={handleAdd} className="btn btn-primary">
            + Add Product
          </button>
        }
      />

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search products..."
        onExport={<ExportButtons data={filteredProducts} columns={columns} title="Products" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-indigo-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Products</p>
          <p className="text-3xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">In Stock</p>
          <p className="text-3xl font-bold mt-1">{products.filter(p => p.currentStock > p.reorderLevel).length}</p>
        </div>
        <div className="p-4 bg-yellow-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Low Stock</p>
          <p className="text-3xl font-bold mt-1">{lowStock}</p>
        </div>
        <div className="p-4 bg-red-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Out of Stock</p>
          <p className="text-3xl font-bold mt-1">{outOfStock}</p>
        </div>
      </div>

      <div className="card p-0">
        <Table
          columns={columns}
          data={filteredProducts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'} 
        size="xl"
      >
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Products;
