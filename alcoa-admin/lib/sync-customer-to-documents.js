import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import DeliveryNote from "@/models/DeliveryNote";
import Receipt from "@/models/Receipt";
import {
  customerSnapshotToQuotationFormPatch,
  getPrimaryContact,
} from "@/lib/map-customer-to-quotation";

/** Build denormalized customer fields stored on sales documents. */
export function buildCustomerDocumentSnapshot(customer) {
  const snap = customerSnapshotToQuotationFormPatch(customer);
  const pc = getPrimaryContact(customer);

  return {
    customerName: snap.customerName || "",
    customerEmail: snap.customerEmail || "",
    customerPhone: snap.customerPhone || "",
    customerTRN: snap.customerTRN || "",
    customerAddress: snap.customerAddress || "",
    contactPersonName: snap.contactPersonName || "",
    contactPersonPhone: (pc?.phone && String(pc.phone).trim()) || "",
    contactPersonEmail: (pc?.email && String(pc.email).trim()) || "",
  };
}

/**
 * Propagate customer master data to linked quotations, orders, invoices,
 * delivery notes, and receipts so list/detail views stay in sync.
 */
export async function syncCustomerSnapshotsToDocuments(customer) {
  const customerId = customer?._id;
  if (!customerId) return {};

  const fields = buildCustomerDocumentSnapshot(customer);
  const filter = { customer: customerId };

  const corePatch = {
    customerName: fields.customerName,
    customerEmail: fields.customerEmail,
    customerPhone: fields.customerPhone,
    customerTRN: fields.customerTRN,
    customerAddress: fields.customerAddress,
  };

  const quotationPatch = {
    ...corePatch,
    contactPersonName: fields.contactPersonName,
    contactPersonPhone: fields.contactPersonPhone,
    contactPersonEmail: fields.contactPersonEmail,
  };

  const deliveryNotePatch = {
    customerName: fields.customerName,
    customerEmail: fields.customerEmail,
    customerPhone: fields.customerPhone,
    customerAddress: fields.customerAddress,
    contactPersonName: fields.contactPersonName,
    contactPersonPhone: fields.contactPersonPhone,
  };

  const [quotations, salesOrders, salesInvoices, deliveryNotes, receipts] =
    await Promise.all([
      Quotation.updateMany(filter, { $set: quotationPatch }),
      SalesOrder.updateMany(filter, { $set: corePatch }),
      SalesInvoice.updateMany(filter, { $set: corePatch }),
      DeliveryNote.updateMany(filter, { $set: deliveryNotePatch }),
      Receipt.updateMany(filter, { $set: { customerName: fields.customerName } }),
    ]);

  return {
    quotations: quotations.modifiedCount,
    salesOrders: salesOrders.modifiedCount,
    salesInvoices: salesInvoices.modifiedCount,
    deliveryNotes: deliveryNotes.modifiedCount,
    receipts: receipts.modifiedCount,
  };
}
