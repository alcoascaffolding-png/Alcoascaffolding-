/**
 * View Customer Details Modal
 */

const ViewCustomerModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Customer Details</h3>
              <p className="text-sm text-white/80 mt-0.5">{customer.customerCode}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Company Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Company Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-gray-500">Company Name:</span>
                  <p className="text-base font-semibold text-gray-900 mt-1">{customer.companyName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Customer Code:</span>
                  <p className="text-base font-mono text-blue-600 mt-1">{customer.customerCode}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Contact Person:</span>
                  <p className="text-base text-gray-900 mt-1">{customer.contactPerson}</p>
                </div>
                {customer.taxRegistrationNumber && (
                  <div>
                    <span className="text-sm text-gray-500">Tax Registration Number:</span>
                    <p className="text-base text-gray-900 mt-1">{customer.taxRegistrationNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="text-base text-gray-900 mt-1">
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a>
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone:</span>
                  <p className="text-base text-gray-900 mt-1">{customer.phone}</p>
                </div>
                {customer.mobile && (
                  <div>
                    <span className="text-sm text-gray-500">Mobile:</span>
                    <p className="text-base text-gray-900 mt-1">{customer.mobile}</p>
                  </div>
                )}
                {customer.city && (
                  <div>
                    <span className="text-sm text-gray-500">City:</span>
                    <p className="text-base text-gray-900 mt-1">{customer.city}</p>
                  </div>
                )}
              </div>
              {customer.address && (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Address:</span>
                  <p className="text-base text-gray-900 mt-1">{customer.address}</p>
                </div>
              )}
            </div>

            {/* Financial Information */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">Financial Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <span className="text-sm text-green-700 font-medium">Credit Limit:</span>
                  <p className="text-2xl font-bold text-green-700 mt-1">AED {customer.creditLimit?.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <span className="text-sm text-red-700 font-medium">Balance:</span>
                  <p className="text-2xl font-bold text-red-700 mt-1">AED {customer.balance?.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">Payment Terms:</span>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{customer.paymentTerms} Days</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomerModal;

