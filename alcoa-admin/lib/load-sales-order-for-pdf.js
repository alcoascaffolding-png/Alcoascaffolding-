import { Customer, SalesOrder } from "@/lib/mongoose-models";
import { enrichDocumentCustomerContact } from "@/lib/resolve-document-customer";
import { enrichDocumentWithBankDetails } from "@/lib/resolve-document-bank-details";

void Customer;

const CUSTOMER_POPULATE_FIELDS =
  "companyName addresses primaryPhone primaryEmail primaryWhatsApp vatRegistrationNumber contactPersons";

export async function loadSalesOrderForPdf(id) {
  return SalesOrder.findById(id)
    .populate("customer", CUSTOMER_POPULATE_FIELDS)
    .lean();
}

export async function prepareSalesOrderForPdf(id) {
  const order = await loadSalesOrderForPdf(id);
  const enriched = enrichDocumentCustomerContact(order);
  return enrichDocumentWithBankDetails(enriched);
}
