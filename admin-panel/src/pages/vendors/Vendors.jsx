/**
 * Vendors Page with Working CRUD
 */

import { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import ExportButtons from '../../components/common/ExportButtons';
import { VendorForm } from '../../components/forms';
import { mockVendors } from '../../data/mockData';
import toast from 'react-hot-toast';

const Vendors = () => {
  // ⭐ TOGGLE: Set to false to show working page to client ⭐
  const [isUnderConstruction] = useState(true);
  
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setVendors(mockVendors);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { 
      header: 'Code', 
      accessor: 'vendorCode',
      render: (row) => <span className="font-mono font-semibold text-purple-600 text-sm">{row.vendorCode}</span>
    },
    { 
      header: 'Company', 
      accessor: 'companyName',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.companyName}</p>
          <p className="text-xs text-gray-500">{row.contactPerson}</p>
        </div>
      ),
    },
    { 
      header: 'Contact', 
      accessor: 'email',
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{row.email}</p>
          <p className="text-xs text-gray-500">{row.phone}</p>
        </div>
      ),
    },
    { 
      header: 'Type', 
      accessor: 'vendorType',
      render: (row) => <span className="capitalize text-sm">{row.vendorType}</span>
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">⭐</span>
          <span className="font-semibold text-gray-900">{row.rating}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
          {row.status}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleSave = (vendorData) => {
    if (editingVendor) {
      setVendors(vendors.map(v => v._id === vendorData._id ? vendorData : v));
    } else {
      setVendors([vendorData, ...vendors]);
    }
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const handleDelete = (vendor) => {
    if (window.confirm(`Delete ${vendor.companyName}?`)) {
      setVendors(vendors.filter(v => v._id !== vendor._id));
      toast.success('Vendor deleted!');
    }
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendorCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Vendor Management",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      {/* ACTUAL WORKING PAGE (Hidden when isUnderConstruction = true) */}
      <div className="space-y-6">
        <PageHeader
          title="Vendors"
          description="Manage supplier database"
          action={
            <button onClick={handleAdd} className="btn btn-primary">
              + Add Vendor
            </button>
          }
        />

        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors..."
          onExport={<ExportButtons data={filteredVendors} columns={columns} title="Vendors" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Total Vendors</p>
            <p className="text-3xl font-bold mt-1">{vendors.length}</p>
          </div>
          <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Active</p>
            <p className="text-3xl font-bold mt-1">{vendors.filter(v => v.status === 'active').length}</p>
          </div>
          <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Total Purchases</p>
            <p className="text-2xl font-bold mt-1">AED {vendors.reduce((sum, v) => sum + v.totalPurchases, 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="card p-0">
          <Table
            columns={columns}
            data={filteredVendors}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingVendor(null);
          }} 
          title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'} 
          size="xl"
        >
          <VendorForm
            vendor={editingVendor}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingVendor(null);
            }}
          />
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default Vendors;
