import { Customer, DeliveryNote } from "@/lib/mongoose-models";
import { enrichDocumentCustomerContact } from "@/lib/resolve-document-customer";

void Customer;

const CUSTOMER_POPULATE_FIELDS =
  "companyName addresses primaryPhone primaryEmail primaryWhatsApp vatRegistrationNumber contactPersons";

export async function prepareDeliveryNoteForPdf(id) {
  const note = await DeliveryNote.findById(id)
    .populate("customer", CUSTOMER_POPULATE_FIELDS)
    .populate("salesOrder", "orderNumber")
    .lean();
  return enrichDocumentCustomerContact(note);
}
