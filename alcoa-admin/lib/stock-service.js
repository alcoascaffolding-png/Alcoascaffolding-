import mongoose from "mongoose";
import Product from "@/models/Product";
import StockAdjustment from "@/models/StockAdjustment";
import { AppError } from "@/lib/api-error";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function generateAdjustmentNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `ADJ-${y}${m}`;
  const count = await StockAdjustment.countDocuments({
    adjustmentNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Create a stock adjustment and update product.currentStock.
 */
export async function createStockAdjustment({
  productId,
  adjustmentType,
  quantity,
  correctionNewStock,
  reason,
  notes,
  userId,
}) {
  if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new AppError("Valid product is required", 400);
  }

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  const previousStock = Number(product.currentStock) || 0;
  let newStock = previousStock;
  let qty = Math.abs(Number(quantity) || 0);

  if (adjustmentType === "increase") {
    if (qty <= 0) throw new AppError("Quantity must be greater than zero", 400);
    newStock = previousStock + qty;
  } else if (adjustmentType === "decrease") {
    if (qty <= 0) throw new AppError("Quantity must be greater than zero", 400);
    newStock = Math.max(0, previousStock - qty);
  } else if (adjustmentType === "correction") {
    newStock = Math.max(0, Number(correctionNewStock));
    if (Number.isNaN(newStock)) throw new AppError("New stock level is required for correction", 400);
    qty = Math.abs(newStock - previousStock);
  } else {
    throw new AppError("Invalid adjustment type", 400);
  }

  product.currentStock = newStock;
  await product.save();

  const adjustment = await StockAdjustment.create({
    adjustmentNumber: await generateAdjustmentNumber(),
    product: product._id,
    productName: product.name,
    adjustmentType,
    quantity: qty,
    previousStock,
    newStock,
    reason: reason || undefined,
    notes: notes || undefined,
    adjustedBy: userId,
  });

  return { adjustment, product };
}

/** Reverse a stock adjustment on delete. */
export async function reverseStockAdjustment(adjustment) {
  const product = await Product.findById(adjustment.product);
  if (!product) return;

  product.currentStock = Math.max(0, Number(adjustment.previousStock) || 0);
  await product.save();
}

async function findProductForDeliveryLine(line) {
  if (line.product && mongoose.Types.ObjectId.isValid(String(line.product))) {
    const byId = await Product.findById(line.product)
      .select("_id name itemCode currentStock")
      .lean();
    if (byId) return byId;
  }

  const label = String(line.equipmentType || line.description || "").trim();
  if (!label) return null;

  const rx = new RegExp(`^${escapeRegex(label)}$`, "i");
  return Product.findOne({
    isActive: { $ne: false },
    $or: [{ name: rx }, { itemCode: rx }],
  })
    .select("_id name itemCode currentStock")
    .lean();
}

/**
 * Build aggregated quantity map productId -> qty from delivery note lines.
 */
export async function aggregateDeliveryLineQuantities(items) {
  const map = new Map();

  for (const line of items || []) {
    const qty = Number(line.quantity) || 0;
    if (qty <= 0) continue;

    const product = await findProductForDeliveryLine(line);
    if (!product) continue;

    const id = String(product._id);
    map.set(id, {
      product,
      quantity: (map.get(id)?.quantity || 0) + qty,
    });
  }

  return map;
}

/**
 * Apply or reverse stock when delivery note status crosses delivered.
 */
export async function syncDeliveryNoteStock(prevDoc, nextDoc, userId) {
  const prevDelivered = prevDoc?.status === "delivered";
  const nextDelivered = nextDoc.status === "delivered";
  const wasApplied = !!prevDoc?.stockApplied;
  const isReturn = nextDoc.noteType === "return";
  const outboundType = isReturn ? "increase" : "decrease";
  const revertType = isReturn ? "decrease" : "increase";

  if (!prevDelivered && nextDelivered && !wasApplied) {
    const map = await aggregateDeliveryLineQuantities(nextDoc.items);
    for (const { product, quantity } of map.values()) {
      await createStockAdjustment({
        productId: product._id,
        adjustmentType: outboundType,
        quantity,
        reason: `Delivery note ${nextDoc.deliveryNoteNumber} ${isReturn ? "returned" : "delivered"}`,
        notes: isReturn ? "Auto stock increase on return" : "Auto stock decrease on delivery",
        userId,
      });
    }
    nextDoc.stockApplied = map.size > 0;
    await nextDoc.save();
    return true;
  }

  if (prevDelivered && !nextDelivered && wasApplied) {
    const map = await aggregateDeliveryLineQuantities(prevDoc.items);
    for (const { product, quantity } of map.values()) {
      await createStockAdjustment({
        productId: product._id,
        adjustmentType: revertType,
        quantity,
        reason: `Delivery note ${nextDoc.deliveryNoteNumber} reverted from delivered`,
        notes: "Auto stock restore",
        userId,
      });
    }
    nextDoc.stockApplied = false;
    await nextDoc.save();
    return true;
  }

  return false;
}
