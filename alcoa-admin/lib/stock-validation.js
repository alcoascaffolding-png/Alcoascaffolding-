import mongoose from "mongoose";
import Product from "@/models/Product";
import { AppError } from "@/lib/api-error";

/**
 * Sum line quantities by linked product id (skips lines without a product ref).
 */
export function aggregateProductQuantitiesFromLines(items = []) {
  const map = new Map();

  for (const line of items) {
    const productId = line?.product;
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) continue;
    const qty = Number(line.quantity) || 0;
    if (qty <= 0) continue;
    const id = String(productId);
    map.set(id, (map.get(id) || 0) + qty);
  }

  return map;
}

/**
 * Ensure each linked product has enough on-hand stock for the requested quantities.
 */
export async function assertSufficientStockForLines(items, { context = "This action" } = {}) {
  const qtyMap = aggregateProductQuantitiesFromLines(items);
  if (qtyMap.size === 0) return;

  const productIds = [...qtyMap.keys()];
  const products = await Product.find({ _id: { $in: productIds } })
    .select("itemCode name currentStock isActive")
    .lean();
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));

  const errors = [];
  for (const [id, required] of qtyMap) {
    const p = byId[id];
    if (!p) {
      errors.push("A line item references a product that no longer exists.");
      continue;
    }
    if (p.isActive === false) {
      errors.push(`${p.itemCode} — ${p.name}: product is inactive.`);
      continue;
    }
    const available = Number(p.currentStock) || 0;
    if (required > available) {
      errors.push(
        `${p.itemCode} — ${p.name}: need ${required}, only ${available} in stock.`
      );
    }
  }

  if (errors.length) {
    throw new AppError(`${context} — insufficient stock. ${errors.join(" ")}`, 400);
  }
}
