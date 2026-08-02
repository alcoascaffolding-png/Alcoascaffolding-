import mongoose from "mongoose";
import Product from "@/models/Product";
import PurchaseOrder from "@/models/PurchaseOrder";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { AppError } from "@/lib/api-error";
import { createStockAdjustment } from "@/lib/stock-service";

const VAT_RATE = 0.05;

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** dd + mm + yy from document date — e.g. 2 Aug 2026 → 020826 */
function purchaseDocDatePart(baseDate) {
  const d = new Date(baseDate);
  if (Number.isNaN(d.getTime())) {
    throw new AppError("Invalid date for purchase document number", 400);
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

/**
 * Next 4-digit sequence for the calendar year (resets each year).
 * Considers new POddmmyy#### / PIddmmyy#### and legacy PO-YYYY-#### / PI-YYYY-####.
 */
async function nextYearlyPurchaseSequence(Model, field, prefix, year) {
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

/** Yearly sequential PO numbers: POddmmyy#### e.g. PO0208260001 (independent of PI / sales docs). */
export async function generatePONumber(baseDate = new Date()) {
  const d = new Date(baseDate);
  const datePart = purchaseDocDatePart(d);
  const seq = await nextYearlyPurchaseSequence(
    PurchaseOrder,
    "poNumber",
    "PO",
    d.getFullYear()
  );
  return `PO${datePart}${String(seq).padStart(4, "0")}`;
}

/** Yearly sequential PI numbers: PIddmmyy#### e.g. PI0208260001 (never copies the source PO number). */
export async function generatePurchaseInvoiceNumber(baseDate = new Date()) {
  const d = new Date(baseDate);
  const datePart = purchaseDocDatePart(d);
  const seq = await nextYearlyPurchaseSequence(
    PurchaseInvoice,
    "invoiceNumber",
    "PI",
    d.getFullYear()
  );
  return `PI${datePart}${String(seq).padStart(4, "0")}`;
}

export function normalizePurchaseLineItems(items = []) {
  return (items || []).map((row) => {
    const quantity = Number(row.quantity) || 0;
    const unitPrice = Number(row.unitPrice) || 0;
    const total = Math.round(quantity * unitPrice * 100) / 100;
    return {
      description: String(row.description || "").trim(),
      quantity,
      unit: row.unit || "Nos",
      unitPrice,
      total,
      product: row.product || undefined,
    };
  }).filter((row) => row.description && row.quantity > 0);
}

export function recalculatePurchaseTotals(items, vatRate = VAT_RATE) {
  const normalized = normalizePurchaseLineItems(items);
  const subtotal = normalized.reduce((s, row) => s + row.total, 0);
  const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
  const total = Math.round((subtotal + vatAmount) * 100) / 100;
  return { items: normalized, subtotal, vatAmount, total };
}

async function findProductForLine(line) {
  if (line.product && mongoose.Types.ObjectId.isValid(String(line.product))) {
    return Product.findById(line.product).select("_id name itemCode").lean();
  }
  const label = String(line.description || "").trim();
  if (!label) return null;
  const rx = new RegExp(`^${escapeRegex(label)}$`, "i");
  return Product.findOne({
    isActive: { $ne: false },
    $or: [{ name: rx }, { itemCode: rx }],
  })
    .select("_id name itemCode")
    .lean();
}

async function aggregatePOLineQuantities(items) {
  const map = new Map();
  for (const line of items || []) {
    const qty = Number(line.quantity) || 0;
    if (qty <= 0) continue;
    const product = await findProductForLine(line);
    if (!product) continue;
    const id = String(product._id);
    map.set(id, { product, quantity: (map.get(id)?.quantity || 0) + qty });
  }
  return map;
}

export async function syncPurchaseOrderStock(prevDoc, nextDoc, userId) {
  const prevReceived = prevDoc?.status === "received";
  const nextReceived = nextDoc.status === "received";
  const wasApplied = !!prevDoc?.stockApplied;

  if (!prevReceived && nextReceived && !wasApplied) {
    const map = await aggregatePOLineQuantities(nextDoc.items);
    for (const { product, quantity } of map.values()) {
      await createStockAdjustment({
        productId: product._id,
        adjustmentType: "increase",
        quantity,
        reason: `Purchase order ${nextDoc.poNumber} received`,
        notes: "Auto stock increase on PO received",
        userId,
        sourceType: "purchase_order",
        sourceId: String(nextDoc._id),
        sourceNumber: nextDoc.poNumber,
      });
    }
    nextDoc.stockApplied = map.size > 0;
    await nextDoc.save();
    return true;
  }

  if (prevReceived && !nextReceived && wasApplied) {
    const map = await aggregatePOLineQuantities(prevDoc.items);
    for (const { product, quantity } of map.values()) {
      await createStockAdjustment({
        productId: product._id,
        adjustmentType: "decrease",
        quantity,
        reason: `Purchase order ${nextDoc.poNumber} reverted from received`,
        notes: "Auto stock reversal",
        userId,
        sourceType: "purchase_order",
        sourceId: String(nextDoc._id),
        sourceNumber: nextDoc.poNumber,
      });
    }
    nextDoc.stockApplied = false;
    await nextDoc.save();
    return true;
  }

  return false;
}

/** Convert PO → PI: fresh PIddmmyy####, linked via purchaseOrder FK. */
export async function createPurchaseInvoiceFromPO(po, userId) {
  const existing = await PurchaseInvoice.findOne({ purchaseOrder: po._id });
  if (existing) return existing;

  const { items, subtotal, vatAmount, total } = recalculatePurchaseTotals(po.items);
  const invoiceDate = new Date();

  return PurchaseInvoice.create({
    invoiceNumber: await generatePurchaseInvoiceNumber(invoiceDate),
    vendor: po.vendor,
    vendorName: po.vendorName,
    purchaseOrder: po._id,
    invoiceDate,
    dueDate: po.deliveryDate,
    paymentStatus: "unpaid",
    items,
    subtotal,
    vatAmount,
    total,
    paidAmount: 0,
    balance: total,
    currency: po.currency || "AED",
    notes: po.notes ? `From PO ${po.poNumber}: ${po.notes}` : `From PO ${po.poNumber}`,
    createdBy: userId,
  });
}

export async function syncPurchaseOrderReceived(po, prevSnapshot, userId) {
  const stockSaved = await syncPurchaseOrderStock(prevSnapshot, po, userId);
  if (po.status === "received") {
    await createPurchaseInvoiceFromPO(po, userId);
  }
  return stockSaved;
}
