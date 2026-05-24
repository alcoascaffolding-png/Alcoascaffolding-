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
  const { logoCid = "", logoUrl = "", logoDataUri = "" } = options;
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

  return buildDocumentCoverEmail({
    docTypeLabel: "INVOICE",
    docNumber: invoiceNumber,
    pageTitle: `Invoice ${invoiceNumber}`,
    customerName,
    logoCid,
    logoUrl,
    logoDataUri,
    introHtml: `<p style="margin:0 0 16px;font-size:14px;color:#0f172a;line-height:1.65;">
        Please find attached invoice <strong>${escapeEmailHtml(invoiceNumber)}</strong> in PDF format for your review and payment.
      </p>`,
    summaryRows: [
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
      { label: "Paid", value: formatEmailCurrency(paidAmount, currency) },
      {
        label: "Balance due",
        value: formatEmailCurrency(displayBalance, currency),
        valueStyle: "color:#dc2626;font-weight:700;",
      },
    ],
  });
}
