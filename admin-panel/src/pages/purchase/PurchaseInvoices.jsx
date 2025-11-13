/**
 * Purchase Invoices with Full CRUD
 */

import { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { InvoiceForm } from '../../components/forms';
import { mockPurchaseInvoices } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PurchaseInvoices = () => {
  // ⭐ TOGGLE: Set to false to show working page to client ⭐
  const [isUnderConstruction] = useState(true);
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setInvoices(mockPurchaseInvoices);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber', render: (row) => <span className="font-mono font-bold text-purple-600">{row.invoiceNumber}</span> },
    { header: 'Vendor', accessor: 'vendorName', render: (row) => <span className="font-semibold text-gray-900">{row.vendorName}</span> },
    { header: 'Date', accessor: 'invoiceDate', render: (row) => <span className="text-sm">{format(new Date(row.invoiceDate), 'MMM dd, yyyy')}</span> },
    { header: 'Total', accessor: 'total', render: (row) => <span className="font-bold text-red-600">AED {row.total?.toLocaleString()}</span> },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: (row) => (
        <span className={`badge ${row.paymentStatus === 'paid' ? 'badge-success' : row.paymentStatus === 'partially_paid' ? 'badge-warning' : 'badge-gray'}`}>
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

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Purchase Invoices",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      {/* ACTUAL WORKING PAGE (Hidden when isUnderConstruction = true) */}
      <div className="space-y-6">
        <PageHeader title="Purchase Invoices" description="Vendor invoices" action={<button onClick={handleAdd} className="btn btn-primary">+ New Invoice</button>} />

        <div className="card p-0">
          <Table columns={columns} data={invoices} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setEditingInvoice(null); }} 
          title={editingInvoice ? 'Edit Purchase Invoice' : 'New Purchase Invoice'} 
          subtitle="Create a new purchase invoice with line items"
          size="full"
        >
          <InvoiceForm invoice={editingInvoice} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingInvoice(null); }} type="purchase" />
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default PurchaseInvoices;
