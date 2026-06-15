import { Customer, Quotation } from "@/lib/mongoose-models";

// Customer must be imported in this bundle before populate("customer") (Vercel serverless).
void Customer;
import {
  getPrimaryAddress,
  formatCustomerAddressLines,
} from "@/lib/map-customer-to-quotation";
import { enrichDocumentCustomerContact } from "@/lib/resolve-document-customer";

export const QUOTATION_CUSTOMER_POPULATE_FIELDS =
  "companyName addresses primaryPhone primaryEmail vatRegistrationNumber contactPersons";

/** Load quotation with customer fields needed for PDF generation and detail fallbacks. */
export async function loadQuotationForPdf(id) {
  return Quotation.findById(id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .lean();
}

/** Fill missing customer snapshot fields from the linked Customer record. */
export function enrichQuotationForPdf(quotation) {
  if (!quotation) return quotation;
  const cust =
    quotation.customer && typeof quotation.customer === "object" ? quotation.customer : null;
  const addrFromCust = formatCustomerAddressLines(getPrimaryAddress(cust));

  return enrichDocumentCustomerContact({
    ...quotation,
    customerAddress:
      (quotation.customerAddress && String(quotation.customerAddress).trim()) ||
      addrFromCust ||
      "",
    customerTRN:
      (quotation.customerTRN && String(quotation.customerTRN).trim()) ||
      (cust?.vatRegistrationNumber && String(cust.vatRegistrationNumber).trim()) ||
      "",
  });
}

/** Load and enrich a quotation for PDF / outbound attachments. */
export async function prepareQuotationForPdf(id) {
  const quotation = await loadQuotationForPdf(id);
  return enrichQuotationForPdf(quotation);
}
