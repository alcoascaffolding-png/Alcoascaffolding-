/**
 * Purchase Orders with Full CRUD
 */

import { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { SalesOrderForm } from '../../components/forms';
import { mockPurchaseOrders } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  // ⭐ TOGGLE: Set to false to show working page to client ⭐
  const [isUnderConstruction] = useState(true);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockPurchaseOrders);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'PO #', accessor: 'poNumber', render: (row) => <span className="font-mono font-bold text-purple-600">{row.poNumber}</span> },
    { header: 'Vendor', accessor: 'vendorName', render: (row) => <span className="font-semibold text-gray-900">{row.vendorName}</span> },
    { header: 'Date', accessor: 'poDate', render: (row) => <span className="text-sm">{format(new Date(row.poDate), 'MMM dd, yyyy')}</span> },
    { header: 'Total', accessor: 'total', render: (row) => <span className="font-bold text-orange-600">AED {row.total?.toLocaleString()}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <span className="badge badge-info">{row.status?.replace('_', ' ')}</span> },
  ];

  const handleAdd = () => { setEditingOrder(null); setIsModalOpen(true); };
  const handleEdit = (order) => { setEditingOrder(order); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingOrder) {
      setOrders(orders.map(o => o._id === data._id ? data : o));
      toast.success('PO updated!');
    } else {
      data.poNumber = `PO2025${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      setOrders([data, ...orders]);
      toast.success('PO added!');
    }
    setIsModalOpen(false);
    setEditingOrder(null);
  };
  const handleDelete = (order) => {
    if (window.confirm(`Delete ${order.poNumber}?`)) {
      setOrders(orders.filter(o => o._id !== order._id));
      toast.success('PO deleted!');
    }
  };

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Purchase Orders",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      {/* ACTUAL WORKING PAGE (Hidden when isUnderConstruction = true) */}
      <div className="space-y-6">
        <PageHeader title="Purchase Orders" description="Vendor purchase orders" action={<button onClick={handleAdd} className="btn btn-primary">+ New PO</button>} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Total POs</p>
            <p className="text-3xl font-bold mt-1">{orders.length}</p>
          </div>
          <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Received</p>
            <p className="text-3xl font-bold mt-1">{orders.filter(o => o.status === 'received').length}</p>
          </div>
          <div className="p-4 bg-orange-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Total Value</p>
            <p className="text-2xl font-bold mt-1">AED {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="card p-0">
          <Table columns={columns} data={orders} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingOrder(null); }} 
          title={editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'} 
          subtitle="Create a new purchase order with line items"
          size="full"
        >
          <SalesOrderForm order={editingOrder} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingOrder(null); }} />
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default PurchaseOrders;
