/**
 * Customer Card Component
 */

import Badge from '../ui/Badge';

const CustomerCard = ({ customer, onEdit, onDelete, onView }) => {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{customer.companyName}</h3>
            <Badge variant={customer.status === 'active' ? 'success' : 'gray'}>
              {customer.status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-1">{customer.contactPerson}</p>
          <p className="text-sm text-gray-500">{customer.email}</p>
          <p className="text-sm text-gray-500">{customer.phone}</p>
          
          <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Credit Limit</p>
              <p className="text-sm font-semibold text-gray-900">AED {customer.creditLimit?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-sm font-semibold text-orange-600">AED {customer.currentBalance?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(customer); }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;

