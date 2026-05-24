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
  const { logoCid = "", logoUrl = "", logoDataUri = "" } = options;
  const {
    orderNumber,
    customerName,
    orderDate,
    deliveryDate,
    status,
    total = 0,
    currency = "AED",
  } = order;

  return buildDocumentCoverEmail({
    docTypeLabel: "SALES ORDER",
    docNumber: orderNumber,
    pageTitle: `Sales Order ${orderNumber}`,
    customerName,
    logoCid,
    logoUrl,
    logoDataUri,
    introHtml: `<p style="margin:0 0 16px;font-size:14px;color:#0f172a;line-height:1.65;">
        Please find attached sales order <strong>${escapeEmailHtml(orderNumber)}</strong> in PDF format for your records.
      </p>`,
    summaryRows: [
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
