/**
 * View Quote Details Modal
 */

import { format } from 'date-fns';

const ViewQuoteModal = ({ isOpen, onClose, quote }) => {
  if (!isOpen || !quote) return null;

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
              <h3 className="text-xl font-bold text-white">Quotation Details</h3>
              <p className="text-sm text-white/80 mt-0.5">{quote.quoteNumber}</p>
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
            {/* Customer & Status Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Company Name:</span>
                    <p className="text-base font-semibold text-gray-900">{quote.customerName}</p>
                  </div>
                  {quote.referenceNumber && (
                    <div>
                      <span className="text-sm text-gray-500">Reference:</span>
                      <p className="text-base text-gray-900">{quote.referenceNumber}</p>
                    </div>
                  )}
                  {quote.subject && (
                    <div>
                      <span className="text-sm text-gray-500">Subject:</span>
                      <p className="text-base text-gray-900">{quote.subject}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Quote Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Quote Date:</span>
                    <p className="text-base text-gray-900">{format(new Date(quote.quoteDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Valid Until:</span>
                    <p className="text-base text-gray-900">{format(new Date(quote.validUntil), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      quote.status === 'declined' ? 'bg-red-100 text-red-700' :
                      quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Line Items</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Disc%</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.items && quote.items.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">AED {item.unitPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.discount}%</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">AED {item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-full md:w-80 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                  <span className="text-base font-semibold text-gray-900">AED {quote.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">VAT (5%):</span>
                  <span className="text-base font-semibold text-gray-900">AED {quote.vat?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="text-base font-bold text-gray-900">Grand Total:</span>
                  <span className="text-xl font-bold text-blue-600">AED {(quote.grandTotal || quote.total)?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            {quote.termsAndConditions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Terms & Conditions</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.termsAndConditions}</p>
                </div>
              </div>
            )}
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

export default ViewQuoteModal;

