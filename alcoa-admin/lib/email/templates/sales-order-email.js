import { getQuotationCompanyName } from "@/lib/quotation-brand";
import {
  buildDocumentCoverEmail,
  formatEmailCurrency,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

/**
 * Cover email for a sales order — same layout as quotation email; details in PDF only.
 */
export default function salesOrderEmailTemplate(order, options = {}) {
  const { logoSrc = "" } = options;
  const {
    orderNumber,
    customerName,
    orderDate,
    deliveryDate,
    status,
    total = 0,
    currency = "AED",
  } = order;

  const safeOrder = escapeEmailHtml(orderNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());

  return buildDocumentCoverEmail({
    docTypeLabel: "SALES ORDER",
    docNumber: orderNumber,
    pageTitle: `Sales Order ${orderNumber}`,
    customerName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Thank you for your order with <strong>${safeCompany}</strong>.
        This email confirms sales order <strong>${safeOrder}</strong> as detailed in the attached document.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please retain the attached PDF for your records, accounts, and site coordination. If any detail
        requires amendment, contact us promptly so we may assist you.
      </p>`,
    summaryRows: [
      { label: "Sales order no.", value: safeOrder },
      { label: "Order date", value: formatEmailDate(orderDate) },
      { label: "Delivery date", value: formatEmailDate(deliveryDate) },
      {
        label: "Status",
        value: String(status || "-").replace(/_/g, " "),
      },
      {
        label: "Order total",
        value: formatEmailCurrency(total, currency),
        valueStyle: "color:#1D3A6C;font-size:14px;font-weight:700;",
      },
    ],
  });
}
