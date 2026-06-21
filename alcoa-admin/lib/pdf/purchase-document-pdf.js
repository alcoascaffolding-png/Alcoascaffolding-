import { generateQuotationPDF } from "./quotation-pdf";
import {
  mapPurchaseOrderForPdf,
  mapPurchaseInvoiceForPdf,
} from "@/lib/map-purchase-for-pdf";

export async function generatePurchaseOrderPDF(po) {
  if (!po?.items?.length) {
    throw new Error("Purchase order has no line items — add items before downloading PDF.");
  }
  const mapped = mapPurchaseOrderForPdf(po);
  return generateQuotationPDF(mapped, { docKind: "purchaseOrder" });
}

export async function generatePurchaseInvoicePDF(inv) {
  if (!inv?.items?.length) {
    throw new Error("Purchase invoice has no line items — add items before downloading PDF.");
  }
  const mapped = mapPurchaseInvoiceForPdf(inv);
  return generateQuotationPDF(mapped, { docKind: "purchaseInvoice" });
}
