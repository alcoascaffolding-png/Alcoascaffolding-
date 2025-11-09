/**
 * Receipts with Full CRUD
 */

import { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { ReceiptForm } from '../../components/forms';
import { mockReceipts } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setReceipts(mockReceipts);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Receipt #', accessor: 'receiptNumber', render: (row) => <span className="font-mono font-bold text-green-600">{row.receiptNumber}</span> },
    { header: 'Customer', accessor: 'customerName', render: (row) => <span className="font-semibold text-gray-900">{row.customerName}</span> },
    { header: 'Date', accessor: 'receiptDate', render: (row) => <span className="text-sm">{format(new Date(row.receiptDate), 'MMM dd, yyyy')}</span> },
    { header: 'Amount', accessor: 'amount', render: (row) => <span className="font-bold text-green-600">AED {row.amount?.toLocaleString()}</span> },
    { header: 'Mode', accessor: 'paymentMode', render: (row) => <span className="capitalize text-sm">{row.paymentMode?.replace('_', ' ')}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <span className={`badge ${row.status === 'cleared' ? 'badge-success' : row.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>{row.status}</span> },
  ];

  const handleAdd = () => { setEditingReceipt(null); setIsModalOpen(true); };
  const handleEdit = (receipt) => { setEditingReceipt(receipt); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingReceipt) {
      setReceipts(receipts.map(r => r._id === data._id ? data : r));
      toast.success('Receipt updated!');
    } else {
      setReceipts([data, ...receipts]);
      toast.success('Receipt added!');
    }
    setIsModalOpen(false);
    setEditingReceipt(null);
  };
  const handleDelete = (receipt) => {
    if (window.confirm(`Delete ${receipt.receiptNumber}?`)) {
      setReceipts(receipts.filter(r => r._id !== receipt._id));
      toast.success('Receipt deleted!');
    }
  };

  const totalReceipts = receipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Receipts" description="Money received from customers" action={<button onClick={handleAdd} className="btn btn-success">+ New Receipt</button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Receipts</p>
          <p className="text-3xl font-bold mt-1">{receipts.length}</p>
        </div>
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Received</p>
          <p className="text-2xl font-bold mt-1">AED {totalReceipts.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-purple-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Cleared</p>
          <p className="text-3xl font-bold mt-1">{receipts.filter(r => r.status === 'cleared').length}</p>
        </div>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={receipts} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingReceipt(null); }} title={editingReceipt ? 'Edit Receipt' : 'New Receipt'} size="lg">
        <ReceiptForm receipt={editingReceipt} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingReceipt(null); }} />
      </Modal>
    </div>
  );
};

export default Receipts;
