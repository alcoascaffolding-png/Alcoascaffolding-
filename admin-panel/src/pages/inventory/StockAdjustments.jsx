/**
 * Stock Adjustments with Full CRUD
 */

import { useEffect, useState } from 'react';
import { PageWrapper } from '../../components/common';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { Input, Select, Button } from '../../components/ui';
import { mockStockAdjustments } from '../../data/mockData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StockAdjustments = () => {
  const [isUnderConstruction] = useState(false);
  
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdjustment, setEditingAdjustment] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setAdjustments(mockStockAdjustments);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Adjustment #', accessor: 'adjustmentNumber', render: (row) => <span className="font-mono font-bold text-indigo-600">{row.adjustmentNumber}</span> },
    { header: 'Date', accessor: 'adjustmentDate', render: (row) => <span className="text-sm">{format(new Date(row.adjustmentDate), 'MMM dd, yyyy')}</span> },
    { header: 'Reason', accessor: 'adjustmentReason', render: (row) => <span className="capitalize text-sm">{row.adjustmentReason?.replace('_', ' ')}</span> },
    { 
      header: 'Value Impact', 
      accessor: 'totalValueImpact', 
      render: (row) => (
        <span className={`font-bold ${row.totalValueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          AED {row.totalValueImpact?.toLocaleString()}
        </span>
      )
    },
    { header: 'Status', accessor: 'status', render: (row) => <span className={`badge ${row.status === 'completed' ? 'badge-success' : row.status === 'approved' ? 'badge-info' : 'badge-warning'}`}>{row.status}</span> },
  ];

  const handleAdd = () => { setEditingAdjustment(null); setIsModalOpen(true); };
  const handleEdit = (adjustment) => { setEditingAdjustment(adjustment); setIsModalOpen(true); };
  
  const handleSave = (data) => {
    if (!data.adjustmentReason || !data.totalValueImpact) {
      toast.error('Reason and value impact are required');
      return;
    }

    if (editingAdjustment) {
      setAdjustments(adjustments.map(a => a._id === data._id ? data : a));
      toast.success('Adjustment updated!');
    } else {
      data._id = Date.now().toString();
      data.adjustmentNumber = `ADJ2025${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
      setAdjustments([data, ...adjustments]);
      toast.success('Adjustment added!');
    }
    setIsModalOpen(false);
    setEditingAdjustment(null);
  };

  const handleDelete = (adjustment) => {
    if (window.confirm(`Delete ${adjustment.adjustmentNumber}?`)) {
      setAdjustments(adjustments.filter(a => a._id !== adjustment._id));
      toast.success('Adjustment deleted!');
    }
  };

  const StockAdjustmentForm = ({ adjustment, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      adjustmentReason: 'correction',
      adjustmentDate: new Date().toISOString().split('T')[0],
      totalValueImpact: 0,
      status: 'draft',
    });

    useEffect(() => {
      if (adjustment) setFormData(adjustment);
    }, [adjustment]);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Adjustment Reason"
          name="adjustmentReason"
          value={formData.adjustmentReason}
          onChange={handleChange}
          options={[
            { value: 'physical_count', label: 'Physical Count' },
            { value: 'damage', label: 'Damage' },
            { value: 'correction', label: 'Correction' },
            { value: 'theft', label: 'Theft' },
          ]}
        />
        <Input label="Date" name="adjustmentDate" type="date" value={formData.adjustmentDate} onChange={handleChange} required />
        <Input label="Value Impact (AED)" name="totalValueImpact" type="number" step="0.01" value={formData.totalValueImpact} onChange={handleChange} required />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'approved', label: 'Approved' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">{adjustment ? 'Update' : 'Add'} Adjustment</Button>
        </div>
      </form>
    );
  };

  return (
    <PageWrapper
      isUnderConstruction={isUnderConstruction}
      constructionProps={{
        title: "Stock Adjustments",
        subtitle: "This module is currently under development and will be available soon."
      }}
    >
      <div className="space-y-6">
        <PageHeader title="Stock Adjustments" description="Inventory corrections" action={<button onClick={handleAdd} className="btn btn-primary">+ New Adjustment</button>} />

        <div className="card p-0">
          <Table columns={columns} data={adjustments} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAdjustment(null); }} title={editingAdjustment ? 'Edit Adjustment' : 'New Stock Adjustment'} size="lg">
          <StockAdjustmentForm adjustment={editingAdjustment} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingAdjustment(null); }} />
        </Modal>
      </div>
    </PageWrapper>
  );
};

export default StockAdjustments;
