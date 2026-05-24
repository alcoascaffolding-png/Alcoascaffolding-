import {
  buildDocumentCoverEmail,
  formatEmailCurrency,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

/**
 * Professional cover email for a quotation. Full line items and terms are in the PDF attachment only.
 */
export default function quotationEmailTemplate(quotation, options = {}) {
  const { logoCid = "", logoUrl = "", logoDataUri = "" } = options;
  const {
    quoteNumber,
    customerName,
    quoteDate,
    validUntil,
    subject = "",
    salesExecutive,
    preparedBy,
    totalAmount = 0,
    currency = "AED",
  } = quotation;

  const contactName = salesExecutive || preparedBy || undefined;

  return buildDocumentCoverEmail({
    docTypeLabel: "QUOTATION",
    docNumber: quoteNumber,
    pageTitle: `Quotation ${quoteNumber}`,
    customerName,
    subject,
    contactName,
    logoCid,
    logoUrl,
    logoDataUri,
    introHtml: `<p style="margin:0 0 16px;font-size:14px;color:#0f172a;line-height:1.65;">
        Thank you for your interest. Please find attached our formal quotation
        <strong>${escapeEmailHtml(quoteNumber)}</strong> in PDF format for your review.
      </p>`,
    summaryRows: [
      { label: "Quote date", value: formatEmailDate(quoteDate) },
      {
        label: "Valid until",
        value: formatEmailDate(validUntil),
        valueStyle: "color:#dc2626;",
      },
      {
        label: "Quoted amount",
        value: formatEmailCurrency(totalAmount, currency),
        valueStyle: `color:#1D3A6C;font-size:14px;font-weight:700;`,
      },
    ],
  });
}
