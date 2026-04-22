/**
 * Sales Invoices with Full CRUD
 */

import { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { InvoiceForm } from '../../components/forms';
import { mockSalesInvoices } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SalesInvoices = () => {
  const [isUnderConstruction] = useState(false);
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setInvoices(mockSalesInvoices);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber', render: (row) => <span className="font-mono font-bold text-indigo-600">{row.invoiceNumber}</span> },
    { header: 'Customer', accessor: 'customerName', render: (row) => <span className="font-semibold text-gray-900">{row.customerName}</span> },
    { 
      header: 'Date', 
      accessor: 'invoiceDate', 
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">{format(new Date(row.invoiceDate), 'MMM dd, yyyy')}</p>
          <p className="text-xs text-gray-500">Due: {format(new Date(row.dueDate), 'MMM dd')}</p>
        </div>
      )
    },
    { header: 'Total', accessor: 'total', render: (row) => <span className="font-bold text-gray-900">AED {row.total?.toLocaleString()}</span> },
    { header: 'Paid', accessor: 'paidAmount', render: (row) => <span className="font-semibold text-green-600">AED {row.paidAmount?.toLocaleString()}</span> },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`badge ${
          row.paymentStatus === 'paid' ? 'badge-success' :
          row.paymentStatus === 'partially_paid' ? 'badge-warning' :
          row.paymentStatus === 'overdue' ? 'badge-danger' : 'badge-gray'
        }`}>
          {row.paymentStatus?.replace('_', ' ')}
        </span>
      ),
    },
  ];

  const handleAdd = () => { setEditingInvoice(null); setIsModalOpen(true); };
  const handleEdit = (invoice) => { setEditingInvoice(invoice); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingInvoice) {
      setInvoices(invoices.map(i => i._id === data._id ? data : i));
      toast.success('Invoice updated!');
    } else {
      setInvoices([data, ...invoices]);
      toast.success('Invoice added!');
    }
    setIsModalOpen(false);
    setEditingInvoice(null);
  };
  const handleDelete = (invoice) => {
    if (window.confirm(`Delete ${invoice.invoiceNumber}?`)) {
      setInvoices(invoices.filter(i => i._id !== invoice._id));
      toast.success('Invoice deleted!');
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Sales Invoices",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      <div className="space-y-6">
        <PageHeader title="Sales Invoices" description="Customer invoices" action={<button onClick={handleAdd} className="btn btn-primary">+ New Invoice</button>} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Total Invoices</p>
            <p className="text-3xl font-bold mt-1">{invoices.length}</p>
          </div>
          <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Paid</p>
            <p className="text-2xl font-bold mt-1">AED {paidAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-yellow-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Pending</p>
            <p className="text-2xl font-bold mt-1">AED {(totalAmount - paidAmount).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-red-600 text-white rounded-lg shadow-sm">
            <p className="text-sm font-medium opacity-90">Overdue</p>
            <p className="text-3xl font-bold mt-1">{invoices.filter(i => i.paymentStatus === 'overdue').length}</p>
          </div>
        </div>

        <div className="card p-0">
          <Table columns={columns} data={invoices} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingInvoice(null); }} 
          title={editingInvoice ? 'Edit Invoice' : 'New Sales Invoice'} 
          subtitle="Create a new sales invoice with line items"
          size="full"
        >
          <InvoiceForm invoice={editingInvoice} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingInvoice(null); }} type="sales" />
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default SalesInvoices;
