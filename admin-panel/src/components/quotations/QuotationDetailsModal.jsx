/**
 * QuotationDetailsModal Component
 * Full details view for a quotation
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateQuotation } from '../../store/slices/quotationSlice';
import quotationService from '../../services/api/quotationService';
import { downloadProfessionalPDF, shareQuotationViaWhatsApp } from '../../utils/professionalQuotationPDF';
import toast from 'react-hot-toast';

const QuotationDetailsModal = ({ quotation, onClose, onUpdate, onEdit, onConvert }) => {
  const dispatch = useDispatch();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      converted: 'bg-teal-100 text-teal-800'
    };
    return colors[status] || colors.draft;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await dispatch(updateQuotation({
        id: quotation._id,
        data: { status: newStatus }
      })).unwrap();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF with images...', { id: 'pdf-loading' });
      await downloadProfessionalPDF(quotation);
      toast.success('Professional PDF downloaded successfully!', { id: 'pdf-loading' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-loading' });
    }
  };

  // Send via Email
  const handleSendEmail = async () => {
    // Get email from quotation or fallback to customer object
    const customerEmail = quotation.customerEmail || quotation.customer?.primaryEmail || quotation.contactPersonEmail;
    
    if (!customerEmail) {
      toast.error('Customer email not available. Please add customer email first.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await quotationService.sendEmail(quotation._id, {
        recipientEmail: customerEmail,
        message: `Please find attached quotation ${quotation.quoteNumber}`
      });
      toast.success(`Quotation sent to ${customerEmail}`);
      onUpdate();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    // Get phone from quotation or fallback to customer object
    const customerPhone = quotation.customerPhone || quotation.customer?.primaryPhone || quotation.contactPersonPhone;
    
    if (!customerPhone) {
      toast.error('Customer phone number not available. Please add customer phone first.');
      return;
    }

    try {
      // Create quotation object with phone for WhatsApp
      const quotationWithPhone = {
        ...quotation,
        customerPhone: customerPhone
      };
      shareQuotationViaWhatsApp(quotationWithPhone);
      toast.success('Opening WhatsApp...');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast.error(error.message || 'Failed to open WhatsApp');
    }
  };

  // Helper functions to check if email/phone is available
  const hasCustomerEmail = () => {
    return !!(quotation.customerEmail || quotation.customer?.primaryEmail || quotation.contactPersonEmail);
  };

  const hasCustomerPhone = () => {
    return !!(quotation.customerPhone || quotation.customer?.primaryPhone || quotation.contactPersonPhone);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quotation.quoteNumber}
              </h2>
              <span
                className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  quotation.status
                )}`}
              >
                {quotation.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Edit Button */}
              {quotation.status !== 'converted' && onEdit && (
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => onEdit(quotation), 300);
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Customer Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Company:</span>
                  <span className="text-sm text-gray-900 dark:text-white font-semibold">{quotation.customerName}</span>
                </div>
                {quotation.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{quotation.customerEmail}</span>
                  </div>
                )}
                {quotation.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{quotation.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quotation Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Quotation Details
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Quote Date</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(quotation.quoteDate)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Valid Until</span>
                  <span className="text-sm text-gray-900 dark:text-white">{formatDate(quotation.validUntil)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Type</span>
                  <span className="text-sm text-gray-900 dark:text-white capitalize">{quotation.quoteType}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">Currency</span>
                  <span className="text-sm text-gray-900 dark:text-white">{quotation.currency || 'AED'}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Items ({quotation.items?.length || 0})
              </h3>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quotation.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.equipmentType}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                          {item.rentalDuration && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {item.rentalDuration.value} {item.rentalDuration.unit}(s)
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">AED {item.ratePerUnit.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">AED {item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Financial Summary
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="text-sm text-gray-900 dark:text-white">AED {quotation.subtotal.toLocaleString()}</span>
                </div>
                {quotation.deliveryCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Charges:</span>
                    <span className="text-sm text-gray-900 dark:text-white">AED {quotation.deliveryCharges.toLocaleString()}</span>
                  </div>
                )}
                {quotation.installationCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Installation Charges:</span>
                    <span className="text-sm text-gray-900 dark:text-white">AED {quotation.installationCharges.toLocaleString()}</span>
                  </div>
                )}
                {quotation.pickupCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pickup Charges:</span>
                    <span className="text-sm text-gray-900 dark:text-white">AED {quotation.pickupCharges.toLocaleString()}</span>
                  </div>
                )}
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="text-sm">Discount:</span>
                    <span className="text-sm">
                      - AED {quotation.discount.toLocaleString()}
                      {quotation.discountType === 'percentage' && '%'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">VAT ({quotation.vatPercentage}%):</span>
                  <span className="text-sm text-gray-900 dark:text-white">AED {quotation.vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">AED {quotation.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quotation.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
                  {quotation.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Change Status */}
              {quotation.status !== 'converted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Status
                  </label>
                  <select
                    value={quotation.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Download PDF */}
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span className="hidden sm:inline">PDF</span>
                </button>

                {/* Send Email */}
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !hasCustomerEmail()}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Email</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={handleWhatsAppShare}
                  disabled={!hasCustomerPhone()}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                {/* Convert to Order */}
                {quotation.status === 'approved' && !quotation.convertedToOrder && (
                  <button
                    onClick={() => onConvert(quotation)}
                    className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Convert</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsModal;

