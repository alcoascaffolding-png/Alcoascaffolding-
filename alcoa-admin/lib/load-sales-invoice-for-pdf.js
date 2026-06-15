import SalesInvoice from "@/models/SalesInvoice";

const CUSTOMER_POPULATE_FIELDS =
  "companyName addresses primaryPhone primaryEmail vatRegistrationNumber";

/** Load tax invoice with customer fields needed for PDF generation. */
export async function loadSalesInvoiceForPdf(id) {
  return SalesInvoice.findById(id)
    .populate("customer", CUSTOMER_POPULATE_FIELDS)
    .lean();
}
