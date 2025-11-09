/**
 * API Services Index
 * Central export for all API services
 */

export { default as customerService } from './customerService';
export { default as dashboardService } from './dashboardService';
export { default as quoteService } from './quoteService';

export {
  salesOrderService,
  salesInvoiceService,
  vendorService,
  productService,
  purchaseOrderService,
  purchaseInvoiceService,
  stockAdjustmentService,
  bankAccountService,
  receiptService,
  paymentService
} from './commonService';

