import { generateQuotationPDF } from "./quotation-pdf";
import {
  mapSalesOrderForQuotationPdf,
  mapSalesInvoiceForQuotationPdf,
} from "@/lib/map-sales-order-for-quotation-pdf";

/**
 * Sales order and tax invoice PDFs reuse the quotation PDF engine and styles
 * (`quotation-pdf.js` + `quotation-pdf-styles.js`). Layout/styling changes there
 * apply automatically to download, email, and WhatsApp attachments.
 */

/** Sales order PDF — same branded layout as quotations. */
export async function generateSalesOrderPDF(order) {
  if (!order?.items?.length) {
    throw new Error("Sales order has no line items — add items before downloading PDF.");
  }
  const mapped = mapSalesOrderForQuotationPdf(order);
  return generateQuotationPDF(mapped, { docKind: "salesOrder" });
}

/** Sales invoice PDF — same branded layout as quotations. */
export async function generateSalesInvoicePDF(invoice) {
  if (!invoice?.items?.length) {
    throw new Error("Tax invoice has no line items — add items before downloading PDF.");
  }
  const mapped = mapSalesInvoiceForQuotationPdf(invoice);
  return generateQuotationPDF(mapped, { docKind: "salesInvoice" });
}
