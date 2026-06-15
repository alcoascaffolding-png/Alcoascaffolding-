import { getPrimaryContact } from "@/lib/map-customer-to-quotation";

/** Mongoose populate fields for resolving email/phone from linked customer (list + detail). */
export const DOCUMENT_CUSTOMER_CONTACT_POPULATE =
  "companyName primaryEmail primaryPhone primaryWhatsApp contactPersons";

function populatedCustomer(doc) {
  const c = doc?.customer;
  return c && typeof c === "object" ? c : null;
}

/** Effective email: document snapshot, then linked customer primary / contact email. */
export function resolveDocumentCustomerEmail(doc) {
  const snap = doc?.customerEmail && String(doc.customerEmail).trim();
  if (snap) return snap;

  const cust = populatedCustomer(doc);
  const primary = cust?.primaryEmail && String(cust.primaryEmail).trim();
  if (primary) return primary;

  const pc = getPrimaryContact(cust);
  const contactEmail = pc?.email && String(pc.email).trim();
  if (contactEmail) return contactEmail;

  return "";
}

/** Effective phone: document snapshot, then linked customer primary / WhatsApp / contact phone. */
export function resolveDocumentCustomerPhone(doc) {
  const snap = doc?.customerPhone && String(doc.customerPhone).trim();
  if (snap) return snap;

  const cust = populatedCustomer(doc);
  const primary = cust?.primaryPhone && String(cust.primaryPhone).trim();
  if (primary) return primary;

  const whatsApp = cust?.primaryWhatsApp && String(cust.primaryWhatsApp).trim();
  if (whatsApp) return whatsApp;

  const pc = getPrimaryContact(cust);
  const contactPhone = pc?.phone && String(pc.phone).trim();
  if (contactPhone) return contactPhone;

  return "";
}

/** Fill missing customerEmail / customerPhone on a loaded document (for PDF / email APIs). */
export function enrichDocumentCustomerContact(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    customerEmail: resolveDocumentCustomerEmail(doc),
    customerPhone: resolveDocumentCustomerPhone(doc),
  };
}
