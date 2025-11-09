/**
 * Sales Orders with Full CRUD
 */

import { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { SalesOrderForm } from '../../components/forms';
import { mockSalesOrders } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setOrders(mockSalesOrders);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Order #', accessor: 'orderNumber', render: (row) => <span className="font-mono font-bold text-blue-600">{row.orderNumber}</span> },
    { header: 'Customer', accessor: 'customerName', render: (row) => <span className="font-semibold text-gray-900">{row.customerName}</span> },
    { header: 'Date', accessor: 'orderDate', render: (row) => <span className="text-sm">{format(new Date(row.orderDate), 'MMM dd, yyyy')}</span> },
    { header: 'Total', accessor: 'total', render: (row) => <span className="font-bold text-green-600">AED {row.total?.toLocaleString()}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'invoiced' ? 'badge-success' : row.status === 'delivered' ? 'badge-info' : 'badge-warning'}`}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  const handleAdd = () => { setEditingOrder(null); setIsModalOpen(true); };
  const handleEdit = (order) => { setEditingOrder(order); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingOrder) {
      setOrders(orders.map(o => o._id === data._id ? data : o));
      toast.success('Order updated!');
    } else {
      setOrders([data, ...orders]);
      toast.success('Order added!');
    }
    setIsModalOpen(false);
    setEditingOrder(null);
  };
  const handleDelete = (order) => {
    if (window.confirm(`Delete ${order.orderNumber}?`)) {
      setOrders(orders.filter(o => o._id !== order._id));
      toast.success('Order deleted!');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Orders" description="Customer orders" action={<button onClick={handleAdd} className="btn btn-primary">+ New Order</button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Orders</p>
          <p className="text-3xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Completed</p>
          <p className="text-3xl font-bold mt-1">{orders.filter(o => o.status === 'invoiced' || o.status === 'delivered').length}</p>
        </div>
        <div className="p-4 bg-purple-600 text-white rounded-lg shadow-sm">
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
        title={editingOrder ? 'Edit Sales Order' : 'New Sales Order'} 
        subtitle="Create a new sales order with line items"
        size="full"
      >
        <SalesOrderForm order={editingOrder} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingOrder(null); }} />
      </Modal>
    </div>
  );
};

export default SalesOrders;
