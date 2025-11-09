/**
 * Bank Accounts with Full CRUD
 */

import { useEffect, useState } from 'react';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PageHeader from '../../components/common/PageHeader';
import { BankAccountForm } from '../../components/forms';
import { mockBankAccounts } from '../../data/mockData';
import toast from 'react-hot-toast';

const BankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setBankAccounts(mockBankAccounts);
      setLoading(false);
    }, 500);
  }, []);

  const columns = [
    { header: 'Account #', accessor: 'accountNumber', render: (row) => <span className="font-mono font-semibold text-blue-600">{row.accountNumber}</span> },
    { 
      header: 'Account', 
      accessor: 'accountName',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.accountName}</p>
          <p className="text-xs text-gray-500">{row.bankName}</p>
        </div>
      ),
    },
    { header: 'Type', accessor: 'accountType', render: (row) => <span className="capitalize text-sm">{row.accountType}</span> },
    { header: 'Balance', accessor: 'currentBalance', render: (row) => <span className="font-bold text-lg text-green-600">{row.currency} {row.currentBalance?.toLocaleString()}</span> },
    { header: 'Status', accessor: 'isActive', render: (row) => <span className={`badge ${row.isActive ? 'badge-success' : 'badge-gray'}`}>{row.isActive ? 'Active' : 'Inactive'}</span> },
  ];

  const handleAdd = () => { setEditingAccount(null); setIsModalOpen(true); };
  const handleEdit = (account) => { setEditingAccount(account); setIsModalOpen(true); };
  const handleSave = (data) => {
    if (editingAccount) {
      setBankAccounts(bankAccounts.map(a => a._id === data._id ? data : a));
      toast.success('Account updated!');
    } else {
      setBankAccounts([data, ...bankAccounts]);
      toast.success('Account added!');
    }
    setIsModalOpen(false);
    setEditingAccount(null);
  };
  const handleDelete = (account) => {
    if (window.confirm(`Delete ${account.accountName}?`)) {
      setBankAccounts(bankAccounts.filter(a => a._id !== account._id));
      toast.success('Account deleted!');
    }
  };

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Bank Accounts" description="Company bank accounts" action={<button onClick={handleAdd} className="btn btn-primary">+ Add Account</button>} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Accounts</p>
          <p className="text-3xl font-bold mt-1">{bankAccounts.length}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Total Balance</p>
          <p className="text-2xl font-bold mt-1">AED {totalBalance.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-purple-600 text-white rounded-lg shadow-sm">
          <p className="text-sm font-medium opacity-90">Active</p>
          <p className="text-3xl font-bold mt-1">{bankAccounts.filter(a => a.isActive).length}</p>
        </div>
      </div>

      <div className="card p-0">
        <Table columns={columns} data={bankAccounts} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAccount(null); }} title={editingAccount ? 'Edit Account' : 'Add Bank Account'} size="lg">
        <BankAccountForm account={editingAccount} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingAccount(null); }} />
      </Modal>
    </div>
  );
};

export default BankAccounts;
