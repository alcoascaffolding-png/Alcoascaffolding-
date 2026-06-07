import { getQuotationCompanyName } from "@/lib/quotation-brand";
import {
  buildDocumentCoverEmail,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

/**
 * Cover email for a delivery note — no pricing; details in PDF only.
 */
export default function deliveryNoteEmailTemplate(note, options = {}) {
  const { logoSrc = "" } = options;
  const {
    deliveryNoteNumber,
    customerName,
    deliveryDate,
    status,
    salesOrder,
  } = note;

  const salesOrderNumber =
    salesOrder && typeof salesOrder === "object"
      ? salesOrder.orderNumber
      : note.salesOrderNumber || "";

  const safeDn = escapeEmailHtml(deliveryNoteNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());

  const summaryRows = [
    { label: "Delivery note no.", value: safeDn },
    { label: "Delivery date", value: formatEmailDate(deliveryDate) },
    {
      label: "Status",
      value: String(status || "-").replace(/_/g, " "),
    },
  ];
  if (salesOrderNumber) {
    summaryRows.splice(2, 0, {
      label: "Order ref",
      value: escapeEmailHtml(salesOrderNumber),
    });
  }

  return buildDocumentCoverEmail({
    docTypeLabel: "DELIVERY NOTE",
    docNumber: deliveryNoteNumber,
    pageTitle: `Delivery Note ${deliveryNoteNumber}`,
    customerName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please find delivery note <strong>${safeDn}</strong> from <strong>${safeCompany}</strong>
        attached for your delivery and site verification.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        This document lists the goods being delivered. It does not contain pricing or payment information.
        Please retain the attached PDF for driver and gate security verification.
      </p>`,
    summaryRows,
  });
}
