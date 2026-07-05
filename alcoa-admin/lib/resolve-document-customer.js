import { getPrimaryContact } from "@/lib/map-customer-to-quotation";

/** Mongoose populate fields for resolving email/phone from linked customer (list + detail). */
export const DOCUMENT_CUSTOMER_CONTACT_POPULATE =
  "companyName primaryEmail primaryPhone primaryWhatsApp contactPersons";

function populatedCustomer(doc) {
  const c = doc?.customer;
  return c && typeof c === "object" ? c : null;
}

function emailFromCustomer(cust) {
  const primary = cust?.primaryEmail && String(cust.primaryEmail).trim();
  if (primary) return primary;

  const pc = getPrimaryContact(cust);
  const contactEmail = pc?.email && String(pc.email).trim();
  if (contactEmail) return contactEmail;

  return "";
}

function phoneFromCustomer(cust) {
  const primary = cust?.primaryPhone && String(cust.primaryPhone).trim();
  if (primary) return primary;

  const whatsApp = cust?.primaryWhatsApp && String(cust.primaryWhatsApp).trim();
  if (whatsApp) return whatsApp;

  const pc = getPrimaryContact(cust);
  const contactPhone = pc?.phone && String(pc.phone).trim();
  if (contactPhone) return contactPhone;

  return "";
}

/** Effective email: linked customer when populated, else document snapshot. */
export function resolveDocumentCustomerEmail(doc) {
  const cust = populatedCustomer(doc);
  if (cust) {
    const fromCustomer = emailFromCustomer(cust);
    if (fromCustomer) return fromCustomer;
  }

  const snap = doc?.customerEmail && String(doc.customerEmail).trim();
  if (snap) return snap;

  return "";
}

/** Effective phone: linked customer when populated, else document snapshot. */
export function resolveDocumentCustomerPhone(doc) {
  const cust = populatedCustomer(doc);
  if (cust) {
    const fromCustomer = phoneFromCustomer(cust);
    if (fromCustomer) return fromCustomer;
  }

  const snap = doc?.customerPhone && String(doc.customerPhone).trim();
  if (snap) return snap;

  return "";
}

/** Effective company name: linked customer when populated, else document snapshot. */
export function resolveDocumentCustomerName(doc) {
  const cust = populatedCustomer(doc);
  const fromCustomer = cust?.companyName && String(cust.companyName).trim();
  if (fromCustomer) return fromCustomer;

  const snap = doc?.customerName && String(doc.customerName).trim();
  if (snap) return snap;

  return "";
}

/** Fill missing customer contact fields on a loaded document (for PDF / email APIs). */
export function enrichDocumentCustomerContact(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    customerName: resolveDocumentCustomerName(doc),
    customerEmail: resolveDocumentCustomerEmail(doc),
    customerPhone: resolveDocumentCustomerPhone(doc),
  };
}
