/**
 * Payments with Full CRUD
 */

import { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { PaymentForm } from '../../components/forms';
import { mockPayments } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Payment #', accessor: 'paymentNumber', render: (row) => <span className="font-mono font-bold text-red-600">{row.paymentNumber}</span> },
    { header: 'Vendor', accessor: 'vendorName', render: (row) => <span className="font-semibold text-gray-900">{row.vendorName}</span> },
    { header: 'Date', accessor: 'paymentDate', render: (row) => <span className="text-sm">{format(new Date(row.paymentDate), 'MMM dd, yyyy')}</span> },
    { header: 'Amount', accessor: 'amount', render: (row) => <span className="font-bold text-red-600">AED {row.amount?.toLocaleString()}</span> },
    { header: 'Mode', accessor: 'paymentMode', render: (row) => <span className="capitalize text-sm">{row.paymentMode?.replace('_', ' ')}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <span className={`badge ${row.status === 'cleared' ? 'badge-success' : row.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>{row.status}</span> },
  ];

  const handleAdd = () => { setEditingPayment(null); setIsModalOpen(true); };
  const handleEdit = (payment) => { setEditingPayment(payment); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingPayment) {
      setPayments(payments.map(p => p._id === data._id ? data : p));
      toast.success('Payment updated!');
    } else {
      setPayments([data, ...payments]);
      toast.success('Payment added!');
    }
    setIsModalOpen(false);
    setEditingPayment(null);
  };
  const handleDelete = (payment) => {
    if (window.confirm(`Delete ${payment.paymentNumber}?`)) {
      setPayments(payments.filter(p => p._id !== payment._id));
      toast.success('Payment deleted!');
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Money paid to vendors" action={<button onClick={handleAdd} className="btn btn-danger">+ New Payment</button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-red-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Payments</p>
          <p className="text-3xl font-bold mt-1">{payments.length}</p>
        </div>
        <div className="p-4 bg-orange-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Paid</p>
          <p className="text-2xl font-bold mt-1">AED {totalPayments.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Cleared</p>
          <p className="text-3xl font-bold mt-1">{payments.filter(p => p.status === 'cleared').length}</p>
        </div>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={payments} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPayment(null); }} title={editingPayment ? 'Edit Payment' : 'New Payment'} size="lg">
        <PaymentForm payment={editingPayment} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingPayment(null); }} />
      </Modal>
    </div>
  );
};

export default Payments;
