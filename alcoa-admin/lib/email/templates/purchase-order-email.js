import { getQuotationCompanyName } from "@/lib/quotation-brand";
import {
  buildDocumentCoverEmail,
  formatEmailCurrency,
  formatEmailDate,
  escapeEmailHtml,
} from "./shared-document-email";

export default function purchaseOrderEmailTemplate(po, options = {}) {
  const { logoSrc = "" } = options;
  const {
    poNumber,
    vendorName,
    orderDate,
    deliveryDate,
    status,
    total = 0,
    currency = "AED",
  } = po;

  const safePo = escapeEmailHtml(poNumber);
  const safeCompany = escapeEmailHtml(getQuotationCompanyName());

  return buildDocumentCoverEmail({
    docTypeLabel: "PURCHASE ORDER",
    docNumber: poNumber,
    pageTitle: `Purchase Order ${poNumber}`,
    customerName: vendorName,
    logoSrc,
    introHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Please find attached purchase order <strong>${safePo}</strong> from <strong>${safeCompany}</strong>.
      </p>`,
    bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#0f172a;line-height:1.7;">
        Kindly confirm receipt and advise expected delivery. Contact us if any line item needs clarification.
      </p>`,
    summaryRows: [
      { label: "PO no.", value: safePo },
      { label: "Order date", value: formatEmailDate(orderDate) },
      { label: "Expected delivery", value: formatEmailDate(deliveryDate) },
      { label: "Status", value: String(status || "-").replace(/_/g, " ") },
      { label: "Order total", value: formatEmailCurrency(total, currency) },
    ],
  });
}
