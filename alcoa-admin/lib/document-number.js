/**
 * Document IDs: PREFIX + YY + MM + DD + 3 random digits (e.g. QT260424837, SO260424512).
 * - Quotation: always QT
 * - Standalone sales order: SO
 * - Standalone sales invoice: SI
 * When linked, child documents reuse the parent's number (QT from quote, or SO from order).
 */

export const DOCUMENT_PREFIX = {
  QUOTATION: "QT",
  SALES_ORDER: "SO",
  SALES_INVOICE: "SI",
  DELIVERY_NOTE: "DN",
};

const VALID_PREFIXES = Object.values(DOCUMENT_PREFIX);

/** @type {RegExp} */
export const DOCUMENT_NUMBER_REGEX = /^(QT|SO|SI|DN)\d{11}$/;

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

  const checks = [
    Quotation.exists(filter("quoteNumber", exclude.quotationId)),
    SalesOrder.exists(filter("orderNumber", exclude.salesOrderId)),
    SalesInvoice.exists(filter("invoiceNumber", exclude.salesInvoiceId)),
  ];
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

/** Sales order: reuse quotation ID when linked; otherwise SOYYMMDD###. */
export async function resolveOrderNumberForCreate(
  { quotationId, orderDate, orderNumber },
  models
) {
  if (orderNumber && String(orderNumber).trim()) {
    return String(orderNumber).trim();
  }
  if (quotationId) {
    const q = await models.Quotation.findById(quotationId).select("quoteNumber").lean();
    if (q?.quoteNumber) {
      const conflict = await models.SalesOrder.exists({ orderNumber: q.quoteNumber });
      if (conflict) {
        throw new Error(
          `Quotation ${q.quoteNumber} is already linked to another sales order. Use that order or unlink it first.`
        );
      }
      return q.quoteNumber;
    }
  }
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_ORDER,
    orderDate || new Date()
  );
}

/** Sales invoice: reuse sales order ID when linked; otherwise SIYYMMDD###. */
export async function resolveInvoiceNumberForCreate(
  { salesOrderId, invoiceDate, invoiceNumber },
  models
) {
  if (invoiceNumber && String(invoiceNumber).trim()) {
    return String(invoiceNumber).trim();
  }
  if (salesOrderId) {
    const o = await models.SalesOrder.findById(salesOrderId)
      .select("orderNumber quotation")
      .populate("quotation", "quoteNumber")
      .lean();
    const linked =
      o?.orderNumber ||
      (o?.quotation && typeof o.quotation === "object" ? o.quotation.quoteNumber : null);
    if (linked) {
      const existingInv = await models.SalesInvoice.findOne({ invoiceNumber: linked })
        .select("salesOrder")
        .lean();
      if (existingInv) {
        const sameOrder =
          salesOrderId &&
          existingInv.salesOrder &&
          String(existingInv.salesOrder) === String(salesOrderId);
        if (!sameOrder) {
          throw new Error(
            `Document ${linked} is already used by another tax invoice. Open that invoice or unlink the order.`
          );
        }
      }
      return linked;
    }
  }
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_INVOICE,
    invoiceDate || new Date()
  );
}

/** Delivery note: always DNYYMMDD### (never reuse SO number). */
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
