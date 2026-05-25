import { getQuotationCompanyName } from "@/lib/quotation-brand";
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
  const { logoSrc = "" } = options;
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
  const safeQuote = escapeEmailHtml(quoteNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());

  return buildDocumentCoverEmail({
    docTypeLabel: "QUOTATION",
    docNumber: quoteNumber,
    pageTitle: `Quotation ${quoteNumber}`,
    customerName,
    subject,
    contactName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Thank you for your enquiry and for considering <strong>${safeCompany}</strong> as your scaffolding partner.
        We are pleased to submit our formal quotation <strong>${safeQuote}</strong> for your review.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please find the quotation document attached in PDF format. We trust the proposal meets your project
        requirements and remain available to discuss scope, delivery, or pricing at your convenience.
      </p>`,
    summaryRows: [
      { label: "Quotation no.", value: safeQuote },
      { label: "Quotation date", value: formatEmailDate(quoteDate) },
      {
        label: "Valid until",
        value: formatEmailDate(validUntil),
        valueStyle: "color:#dc2626;font-weight:700;",
      },
      {
        label: "Quoted amount",
        value: formatEmailCurrency(totalAmount, currency),
        valueStyle: "color:#1D3A6C;font-size:14px;font-weight:700;",
      },
    ],
  });
}
