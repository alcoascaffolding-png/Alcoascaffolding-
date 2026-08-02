/**
 * Document IDs: PREFIX + ddmmyy + #### (yearly sequential).
 * e.g. QT0208260001, SO0208260001, SI0208260001, DN0208260001.
 *
 * Each sales/delivery module owns an independent yearly sequence — conversion never
 * copies the source document’s number. Traceability is via foreign keys
 * (quotation, salesOrder, etc.). Same pattern as PO/PI in purchase-service.js.
 *
 * Legacy rows may still use PREFIX + YYMMDD + 3 random digits (11 chars) or
 * PREFIX-YYYY-####; those remain readable but new creates use the format above.
 */

export const DOCUMENT_PREFIX = {
  QUOTATION: "QT",
  SALES_ORDER: "SO",
  SALES_INVOICE: "SI",
  DELIVERY_NOTE: "DN",
};

const VALID_PREFIXES = Object.values(DOCUMENT_PREFIX);

/** PREFIX + ddmmyy(6) + seq(4) — e.g. QT0208260001 (2 letters + 10 digits). */
export const DOCUMENT_NUMBER_REGEX = /^(QT|SO|SI|DN)\d{10}$/;

/** Legacy PREFIX + YYMMDD + 3 random digits — e.g. QT260802646. */
export const LEGACY_DOCUMENT_NUMBER_REGEX = /^(QT|SO|SI|DN)\d{9}$/;

const PREFIX_FIELD = {
  QT: { modelKey: "Quotation", field: "quoteNumber", excludeKey: "quotationId" },
  SO: { modelKey: "SalesOrder", field: "orderNumber", excludeKey: "salesOrderId" },
  SI: { modelKey: "SalesInvoice", field: "invoiceNumber", excludeKey: "salesInvoiceId" },
  DN: { modelKey: "DeliveryNote", field: "deliveryNoteNumber", excludeKey: "deliveryNoteId" },
};

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** dd + mm + yy from document date — e.g. 2 Aug 2026 → 020826 */
export function documentDatePart(baseDate) {
  const d = new Date(baseDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date for document number");
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

/** ddmmyy#### portion after a 2-letter prefix (diagnostic / tooling helper). */
export function documentNumberSuffix(documentNumber) {
  const s = String(documentNumber || "").trim().toUpperCase();
  if (!DOCUMENT_NUMBER_REGEX.test(s)) return null;
  return s.slice(2);
}

/**
 * @param {string} prefix QT | SO | SI | DN
 * @param {Date|string|number} baseDate
 * @param {number|string} sequence yearly 1-based counter (zero-padded to 4)
 */
export function formatDocumentNumber(prefix, baseDate, sequence) {
  const p = String(prefix || "").toUpperCase();
  if (!VALID_PREFIXES.includes(p)) {
    throw new Error(`Invalid document prefix: ${prefix}`);
  }
  const datePart = documentDatePart(baseDate);
  const seq = String(sequence).padStart(4, "0").slice(-4);
  return `${p}${datePart}${seq}`;
}

/**
 * Next 4-digit sequence for the calendar year (resets each year), per module.
 * Considers new PREFIXddmmyy#### and legacy PREFIX-YYYY-####.
 * Old random YYMMDD### IDs are ignored for the counter (different shape; no collision).
 */
export async function nextYearlyDocumentSequence(Model, field, prefix, year) {
  const yy = String(year).slice(-2);
  const newFmt = new RegExp(`^${prefix}\\d{4}${yy}\\d{4}$`);
  const legacyFmt = new RegExp(`^${prefix}-${year}-(\\d{4})$`);
  const docs = await Model.find({
    $or: [
      { [field]: { $regex: newFmt } },
      { [field]: { $regex: `^${escapeRegex(`${prefix}-${year}-`)}` } },
    ],
  })
    .select(field)
    .lean();

  let max = 0;
  for (const doc of docs) {
    const v = String(doc[field] || "");
    let seq = 0;
    if (newFmt.test(v)) {
      seq = parseInt(v.slice(-4), 10) || 0;
    } else {
      const m = v.match(legacyFmt);
      if (m) seq = parseInt(m[1], 10) || 0;
    }
    if (seq > max) max = seq;
  }
  return max + 1;
}

/**
 * Uniqueness is scoped to the candidate’s own module (prefix → collection).
 * QT / SO / SI / DN sequences are independent.
 */
export async function isDocumentNumberTaken(candidate, models, exclude = {}) {
  const c = String(candidate || "").trim().toUpperCase();
  const prefix = c.slice(0, 2);
  const meta = PREFIX_FIELD[prefix];

  const filter = (field, excludeId) => {
    const q = { [field]: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    return q;
  };

  if (meta) {
    const Model = models?.[meta.modelKey];
    if (!Model) return false;
    return Boolean(await Model.exists(filter(meta.field, exclude[meta.excludeKey])));
  }

  // Legacy / unknown format: check every provided collection.
  const { Quotation, SalesOrder, SalesInvoice, DeliveryNote } = models || {};
  const checks = [];
  if (Quotation) checks.push(Quotation.exists(filter("quoteNumber", exclude.quotationId)));
  if (SalesOrder) checks.push(SalesOrder.exists(filter("orderNumber", exclude.salesOrderId)));
  if (SalesInvoice) checks.push(SalesInvoice.exists(filter("invoiceNumber", exclude.salesInvoiceId)));
  if (DeliveryNote) {
    checks.push(DeliveryNote.exists(filter("deliveryNoteNumber", exclude.deliveryNoteId)));
  }
  if (!checks.length) return false;
  const results = await Promise.all(checks);
  return results.some(Boolean);
}

export async function createDocumentNumberAvailabilityChecker(models, exclude = {}) {
  return (candidate) =>
    isDocumentNumberTaken(candidate, models, exclude).then((taken) => !taken);
}

/**
 * Allocate next PREFIXddmmyy#### for the module of `prefix`.
 * Sequence is yearly and independent per QT / SO / SI / DN.
 */
export async function generateNewDocumentNumber(
  models,
  prefix,
  baseDate = new Date(),
  exclude = {}
) {
  const p = String(prefix || "").toUpperCase();
  const meta = PREFIX_FIELD[p];
  if (!meta) throw new Error(`Invalid document prefix: ${prefix}`);

  const Model = models?.[meta.modelKey];
  if (!Model) throw new Error(`Model not provided for prefix ${p}`);

  const d = new Date(baseDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date for document number");
  }

  const isAvailable = await createDocumentNumberAvailabilityChecker(models, exclude);
  let seq = await nextYearlyDocumentSequence(Model, meta.field, p, d.getFullYear());

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = formatDocumentNumber(p, d, seq);
    if (await isAvailable(candidate)) return candidate;
    seq += 1;
  }
  throw new Error("Unable to generate a unique document number. Please try again.");
}

function acceptedModuleNumber(value, prefix) {
  const trimmed = value != null ? String(value).trim() : "";
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  // New PREFIXddmmyy#### or legacy PREFIXYYMMDD### — never inherit peer-module IDs.
  if (new RegExp(`^${prefix}\\d{10}$`).test(upper)) return upper;
  if (new RegExp(`^${prefix}\\d{9}$`).test(upper)) return upper;
  return null;
}

/** Sales order: always a new SOddmmyy#### (manual or converted from quotation). */
export async function resolveOrderNumberForCreate(
  { orderDate, orderNumber, salesOrderId },
  models
) {
  const accepted = acceptedModuleNumber(orderNumber, DOCUMENT_PREFIX.SALES_ORDER);
  if (accepted) return accepted;
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_ORDER,
    orderDate || new Date(),
    salesOrderId ? { salesOrderId } : {}
  );
}

/** Sales invoice: always a new SIddmmyy#### (manual or converted). */
export async function resolveInvoiceNumberForCreate(
  { invoiceDate, invoiceNumber, salesInvoiceId },
  models
) {
  const accepted = acceptedModuleNumber(invoiceNumber, DOCUMENT_PREFIX.SALES_INVOICE);
  if (accepted) return accepted;
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.SALES_INVOICE,
    invoiceDate || new Date(),
    salesInvoiceId ? { salesInvoiceId } : {}
  );
}

/** Delivery note: always DNddmmyy#### (independent of sales order / quotation). */
export async function resolveDeliveryNoteNumberForCreate(
  { deliveryDate, deliveryNoteNumber },
  models
) {
  const accepted = acceptedModuleNumber(deliveryNoteNumber, DOCUMENT_PREFIX.DELIVERY_NOTE);
  if (accepted) return accepted;
  return generateNewDocumentNumber(
    models,
    DOCUMENT_PREFIX.DELIVERY_NOTE,
    deliveryDate || new Date()
  );
}
