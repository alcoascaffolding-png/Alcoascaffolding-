import { Customer, SalesInvoice } from "@/lib/mongoose-models";
import { enrichDocumentCustomerContact } from "@/lib/resolve-document-customer";

// Customer must be imported in this bundle before populate("customer") (Vercel serverless).
void Customer;

const CUSTOMER_POPULATE_FIELDS =
  "companyName addresses primaryPhone primaryEmail primaryWhatsApp vatRegistrationNumber contactPersons";

/** Load tax invoice with customer fields needed for PDF generation. */
export async function loadSalesInvoiceForPdf(id) {
  return SalesInvoice.findById(id)
    .populate("customer", CUSTOMER_POPULATE_FIELDS)
    .lean();
}

/** Load and enrich invoice contact fields for PDF / email / WhatsApp. */
export async function prepareSalesInvoiceForPdf(id) {
  const invoice = await loadSalesInvoiceForPdf(id);
  return enrichDocumentCustomerContact(invoice);
}
