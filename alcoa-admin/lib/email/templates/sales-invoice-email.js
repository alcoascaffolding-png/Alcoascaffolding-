import { getQuotationCompanyName } from "@/lib/quotation-brand";
import {
  buildDocumentCoverEmail,
  formatEmailCurrency,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

/**
 * Cover email for a sales invoice — same layout as quotation email; details in PDF only.
 */
export default function salesInvoiceEmailTemplate(invoice, options = {}) {
  const { logoSrc = "" } = options;
  const {
    invoiceNumber,
    customerName,
    invoiceDate,
    dueDate,
    paymentStatus,
    total = 0,
    paidAmount = 0,
    balance,
    currency = "AED",
  } = invoice;

  const displayBalance =
    balance != null
      ? Number(balance)
      : Math.max(0, Number(total || 0) - Number(paidAmount || 0));

  const safeInvoice = escapeEmailHtml(invoiceNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());

  return buildDocumentCoverEmail({
    docTypeLabel: "TAX INVOICE",
    docNumber: invoiceNumber,
    pageTitle: `Invoice ${invoiceNumber}`,
    customerName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please find attached the tax invoice from <strong>${safeCompany}</strong>
        for your attention and payment processing.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Invoice <strong>${safeInvoice}</strong> is issued in accordance with our agreement. Kindly quote the
        invoice number on all remittances. Bank details and full particulars are shown in the attached PDF.
      </p>`,
    summaryRows: [
      { label: "Invoice no.", value: safeInvoice },
      { label: "Invoice date", value: formatEmailDate(invoiceDate) },
      { label: "Due date", value: formatEmailDate(dueDate) },
      {
        label: "Payment status",
        value: String(paymentStatus || "-").replace(/_/g, " "),
      },
      {
        label: "Invoice total",
        value: formatEmailCurrency(total, currency),
        valueStyle: "color:#1D3A6C;font-size:14px;font-weight:700;",
      },
      { label: "Amount paid", value: formatEmailCurrency(paidAmount, currency) },
      {
        label: "Balance due",
        value: formatEmailCurrency(displayBalance, currency),
        valueStyle: "color:#dc2626;font-weight:700;",
      },
    ],
  });
}
