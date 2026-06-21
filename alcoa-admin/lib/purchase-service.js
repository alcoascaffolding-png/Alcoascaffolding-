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

export async function generatePONumber(baseDate = new Date()) {
  const y = new Date(baseDate).getFullYear();
  const prefix = `PO-${y}-`;
  const count = await PurchaseOrder.countDocuments({
    poNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function generatePurchaseInvoiceNumber(baseDate = new Date()) {
  const y = new Date(baseDate).getFullYear();
  const prefix = `PI-${y}-`;
  const count = await PurchaseInvoice.countDocuments({
    invoiceNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
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
      });
    }
    nextDoc.stockApplied = false;
    await nextDoc.save();
    return true;
  }

  return false;
}

export async function createPurchaseInvoiceFromPO(po, userId) {
  const existing = await PurchaseInvoice.findOne({ purchaseOrder: po._id });
  if (existing) return existing;

  const { items, subtotal, vatAmount, total } = recalculatePurchaseTotals(po.items);

  return PurchaseInvoice.create({
    invoiceNumber: await generatePurchaseInvoiceNumber(po.orderDate || new Date()),
    vendor: po.vendor,
    vendorName: po.vendorName,
    purchaseOrder: po._id,
    invoiceDate: new Date(),
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
