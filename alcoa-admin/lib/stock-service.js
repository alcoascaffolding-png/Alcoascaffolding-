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
 * Given a starting stock level and an adjustment request, compute the resulting
 * stock level and the effective (absolute) quantity. Single source of truth for
 * both create and edit so the two paths can never diverge.
 */
export function computeStockChange({
  baseStock,
  adjustmentType,
  quantity,
  correctionNewStock,
  rejectBelowZero = false,
  productName = "this product",
}) {
  const base = Number(baseStock) || 0;
  let qty = Math.abs(Number(quantity) || 0);
  let newStock;

  if (adjustmentType === "increase") {
    if (qty <= 0) throw new AppError("Quantity must be greater than zero", 400);
    newStock = base + qty;
  } else if (adjustmentType === "decrease") {
    if (qty <= 0) throw new AppError("Quantity must be greater than zero", 400);
    if (rejectBelowZero && qty > base) {
      throw new AppError(
        `Cannot remove ${qty} units — only ${base} in stock for ${productName}.`,
        400
      );
    }
    newStock = Math.max(0, base - qty);
  } else if (adjustmentType === "correction") {
    newStock = Number(correctionNewStock);
    if (Number.isNaN(newStock)) {
      throw new AppError("New stock level is required for correction", 400);
    }
    newStock = Math.max(0, newStock);
    qty = Math.abs(newStock - base);
  } else {
    throw new AppError("Invalid adjustment type", 400);
  }

  return { newStock, quantity: qty };
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
  sourceType = "manual",
  sourceId,
  sourceNumber,
  rejectBelowZero = false,
}) {
  if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new AppError("Valid product is required", 400);
  }

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  const previousStock = Number(product.currentStock) || 0;
  const { newStock, quantity: qty } = computeStockChange({
    baseStock: previousStock,
    adjustmentType,
    quantity,
    correctionNewStock,
    rejectBelowZero,
    productName: product.name,
  });

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
    sourceType: sourceType || "manual",
    sourceId: sourceId ? String(sourceId) : undefined,
    sourceNumber: sourceNumber || undefined,
    adjustedBy: userId,
  });

  return { adjustment, product };
}

/**
 * Reverse a stock adjustment (used on delete). Applies the INVERSE of the
 * adjustment's original delta to the product's *current* stock rather than
 * resetting to the historical `previousStock`. This keeps stock correct even
 * when later adjustments have since been recorded for the same product.
 */
export async function reverseStockAdjustment(adjustment) {
  const product = await Product.findById(adjustment.product);
  if (!product) return;

  const delta = (Number(adjustment.newStock) || 0) - (Number(adjustment.previousStock) || 0);
  const current = Number(product.currentStock) || 0;
  product.currentStock = Math.max(0, current - delta);
  await product.save();
}

/**
 * Edit a *manual* stock adjustment while keeping product stock consistent.
 *
 * Strategy: reverse the original delta, then apply the new delta. Because both
 * operations act on the product's *current* stock (not a historical snapshot),
 * the product's `currentStock` stays correct regardless of any adjustments
 * recorded after this one. System-generated adjustments (delivery notes, POs,
 * product-form edits) are immutable ledger entries and cannot be edited here.
 */
export async function editStockAdjustment({
  adjustmentId,
  productId,
  adjustmentType,
  quantity,
  correctionNewStock,
  reason,
  notes,
  rejectBelowZero = true,
}) {
  const adjustment = await StockAdjustment.findById(adjustmentId);
  if (!adjustment) throw new AppError("Stock Adjustment not found", 404);

  if (adjustment.sourceType && adjustment.sourceType !== "manual") {
    throw new AppError(
      "System-generated stock adjustments cannot be edited. Delete the source document instead.",
      400
    );
  }

  const targetProductId = productId ? String(productId) : String(adjustment.product);
  if (!mongoose.Types.ObjectId.isValid(targetProductId)) {
    throw new AppError("Valid product is required", 400);
  }
  const productChanged = targetProductId !== String(adjustment.product);
  const originalDelta =
    (Number(adjustment.newStock) || 0) - (Number(adjustment.previousStock) || 0);

  const targetProduct = await Product.findById(targetProductId);
  if (!targetProduct) throw new AppError("Product not found", 404);

  // Determine the base stock the new adjustment is applied on top of, having
  // removed the effect of the original adjustment.
  let oldProduct = null;
  let baseStock;

  if (productChanged) {
    oldProduct = await Product.findById(adjustment.product);
    if (oldProduct) {
      const reversed = (Number(oldProduct.currentStock) || 0) - originalDelta;
      if (reversed < 0) {
        throw new AppError(
          `Cannot move this adjustment — reversing it would drive ${oldProduct.name} stock negative.`,
          400
        );
      }
      oldProduct.currentStock = Math.max(0, reversed);
    }
    baseStock = Number(targetProduct.currentStock) || 0;
  } else {
    baseStock = (Number(targetProduct.currentStock) || 0) - originalDelta;
    if (baseStock < 0) {
      throw new AppError(
        `Cannot edit this adjustment — reversing the original change would drive ${targetProduct.name} stock negative.`,
        400
      );
    }
  }

  const { newStock, quantity: qty } = computeStockChange({
    baseStock,
    adjustmentType,
    quantity,
    correctionNewStock,
    rejectBelowZero,
    productName: targetProduct.name,
  });

  // Persist stock changes (validated above so this cannot half-apply into an
  // invalid negative state).
  if (oldProduct) await oldProduct.save();
  targetProduct.currentStock = newStock;
  await targetProduct.save();

  adjustment.product = targetProduct._id;
  adjustment.productName = targetProduct.name;
  adjustment.adjustmentType = adjustmentType;
  adjustment.quantity = qty;
  adjustment.previousStock = baseStock;
  adjustment.newStock = newStock;
  adjustment.reason = reason || undefined;
  adjustment.notes = notes || undefined;
  await adjustment.save();

  return { adjustment, product: targetProduct };
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
        sourceType: "delivery_note",
        sourceId: String(nextDoc._id),
        sourceNumber: nextDoc.deliveryNoteNumber,
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
        sourceType: "delivery_note",
        sourceId: String(nextDoc._id),
        sourceNumber: nextDoc.deliveryNoteNumber,
      });
    }
    nextDoc.stockApplied = false;
    await nextDoc.save();
    return true;
  }

  return false;
}
