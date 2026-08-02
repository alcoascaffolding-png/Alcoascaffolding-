/**
 * Document IDs: PREFIX + YY + MM + DD + 3 random digits (e.g. QT260424837, SO260424512).
 * Each module (quotation, sales order, invoice, delivery note) gets its own independent
 * number. Conversion links documents by foreign key — numbers are never reused across types.
 */

export const DOCUMENT_PREFIX = {
  QUOTATION: "QT",
  SALES_ORDER: "SO",
  SALES_INVOICE: "SI",
  DELIVERY_NOTE: "DN",
};

const VALID_PREFIXES = Object.values(DOCUMENT_PREFIX);

/** PREFIX + YYMMDD + 3 digits — e.g. QT260802646 (2 letters + 9 digits). */
export const DOCUMENT_NUMBER_REGEX = /^(QT|SO|SI|DN)\d{9}$/;

/** YYMMDD### portion after a 2-letter prefix. */
export function documentNumberSuffix(documentNumber) {
  const s = String(documentNumber || "").trim().toUpperCase();
  if (!DOCUMENT_NUMBER_REGEX.test(s)) return null;
  return s.slice(2);
}

export function formatDocumentNumber(prefix, baseDate, randomSuffix) {
  const p = String(prefix || "").toUpperCase();
  if (!VALID_PREFIXES.includes(p)) {
    throw new Error(`Invalid document prefix: ${prefix}`);
  }
  const d = new Date(baseDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date for document number");
  }
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rnd = String(randomSuffix).padStart(3, "0").slice(-3);
  return `${p}${yy}${mm}${dd}${rnd}`;
}

export function randomDocumentSuffix() {
  return Math.floor(Math.random() * 900) + 100;
}

/**
 * @param {string} prefix QT | SO | SI
 * @param {(candidate: string) => Promise<boolean>} isAvailable
 * @param {Date|string|number} [baseDate]
 */
export async function generateUniqueDocumentNumber(prefix, isAvailable, baseDate = new Date()) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = formatDocumentNumber(prefix, baseDate, randomDocumentSuffix());
    if (await isAvailable(candidate)) return candidate;
  }
  throw new Error("Unable to generate a unique document number. Please try again.");
}

export async function isDocumentNumberTaken(candidate, models, exclude = {}) {
  const { Quotation, SalesOrder, SalesInvoice, DeliveryNote } = models;
  const filter = (field, excludeId) => {
    const q = { [field]: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  const checks = [];
  if (Quotation) checks.push(Quotation.exists(filter("quoteNumber", exclude.quotationId)));
  if (SalesOrder) checks.push(SalesOrder.exists(filter("orderNumber", exclude.salesOrderId)));
  if (SalesInvoice) checks.push(SalesInvoice.exists(filter("invoiceNumber", exclude.salesInvoiceId)));
  if (DeliveryNote) {
    checks.push(DeliveryNote.exists(filter("deliveryNoteNumber", exclude.deliveryNoteId)));
  }
  const results = await Promise.all(checks);
  return results.some(Boolean);
}

export async function createDocumentNumberAvailabilityChecker(models, exclude = {}) {
  return (candidate) =>
    isDocumentNumberTaken(candidate, models, exclude).then((taken) => !taken);
}

export async function generateNewDocumentNumber(
  models,
  prefix,
  baseDate = new Date(),
  exclude = {}
) {
  const isAvailable = await createDocumentNumberAvailabilityChecker(models, exclude);
  return generateUniqueDocumentNumber(prefix, isAvailable, baseDate);
}

/** Sales order: always a new SOYYMMDD### (manual or converted from quotation). */
export async function resolveOrderNumberForCreate(
  { orderDate, orderNumber, salesOrderId },
  models
) {
  if (orderNumber && String(orderNumber).trim()) {
    return String(orderNumber).trim();
  }
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_ORDER,
    orderDate || new Date(),
    salesOrderId ? { salesOrderId } : {}
  );
}

/** Sales invoice: always a new SIYYMMDD### (manual or converted). */
export async function resolveInvoiceNumberForCreate(
  { invoiceDate, invoiceNumber, salesInvoiceId },
  models
) {
  if (invoiceNumber && String(invoiceNumber).trim()) {
    return String(invoiceNumber).trim();
  }
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_INVOICE,
    invoiceDate || new Date(),
    salesInvoiceId ? { salesInvoiceId } : {}
  );
}

/** Delivery note: always DNYYMMDD###. */
export async function resolveDeliveryNoteNumberForCreate(
  { deliveryDate, deliveryNoteNumber },
  models
) {
  if (deliveryNoteNumber && String(deliveryNoteNumber).trim()) {
    return String(deliveryNoteNumber).trim();
  }
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.DELIVERY_NOTE,
    deliveryDate || new Date()
  );
}
