import { getQuotationCompanyName } from "@/lib/quotation-brand";
import {
  buildDocumentCoverEmail,
  formatEmailCurrency,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

export default function purchaseInvoiceEmailTemplate(inv, options = {}) {
  const { logoSrc = "" } = options;
  const {
    invoiceNumber,
    vendorName,
    invoiceDate,
    dueDate,
    paymentStatus,
    total = 0,
    balance,
    currency = "AED",
  } = inv;

  const safeInv = escapeEmailHtml(invoiceNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());
  const displayBalance =
    balance != null ? Number(balance) : Math.max(0, Number(total || 0));

  return buildDocumentCoverEmail({
    docTypeLabel: "PURCHASE INVOICE",
    docNumber: invoiceNumber,
    pageTitle: `Purchase Invoice ${invoiceNumber}`,
    customerName: vendorName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please find attached purchase invoice <strong>${safeInv}</strong> from <strong>${safeCompany}</strong>.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Retain this for your accounts payable records. Contact us if the details require amendment.
      </p>`,
    summaryRows: [
      { label: "Invoice no.", value: safeInv },
      { label: "Invoice date", value: formatEmailDate(invoiceDate) },
      { label: "Due date", value: formatEmailDate(dueDate) },
      {
        label: "Payment status",
        value: String(paymentStatus || "-").replace(/_/g, " "),
      },
      { label: "Invoice total", value: formatEmailCurrency(total, currency) },
      { label: "Balance due", value: formatEmailCurrency(displayBalance, currency) },
    ],
  });
}
