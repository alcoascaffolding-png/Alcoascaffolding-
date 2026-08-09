/**
 * Shared inventory stock-status helpers (server + client safe).
 */

export function isOutOfStock(product) {
  if (!product || product.isActive === false) return false;
  return Number(product.currentStock ?? 0) <= 0;
}

export function isLowStock(product) {
  if (!product || product.isActive === false) return false;
  const min = Number(product.minStock) || 0;
  const current = Number(product.currentStock) || 0;
  return min > 0 && current <= min && current > 0;
}

export function isCriticalStock(product) {
  return isOutOfStock(product) || isLowStock(product);
}

export function stockStatus(product) {
  if (isOutOfStock(product)) return "out";
  if (isLowStock(product)) return "low";
  return "ok";
}

export function stockStatusLabel(status) {
  if (status === "out") return "Out of stock";
  if (status === "low") return "Low stock";
  return "In stock";
}

/* -------------------------------------------------------------------------- *
 * Mongo query fragments — single source of truth for server-side stock-status
 * filtering. Keep these in sync with the client predicates above so list
 * highlighting, stat cards, filters, notifications, and reorder logic all
 * agree on what "low" / "out" / "critical" mean. Each helper returns a fresh
 * object so it is safe to spread or nest into any query/aggregation.
 * -------------------------------------------------------------------------- */

/** Aggregation `$expr` condition: product is active. */
export function activeStockExpr() {
  return { $ne: ["$isActive", false] };
}

/** Aggregation `$expr` condition: on-hand stock is at or below zero. */
export function outOfStockExpr() {
  return { $lte: ["$currentStock", 0] };
}

/** Aggregation `$expr` condition: min set and stock at/below min but positive. */
export function lowStockExpr() {
  return {
    $and: [
      { $gt: ["$minStock", 0] },
      { $lte: ["$currentStock", "$minStock"] },
      { $gt: ["$currentStock", 0] },
    ],
  };
}

/** Aggregation `$expr` condition: min set and stock at/below min (incl. zero). */
export function atOrBelowMinExpr() {
  return {
    $and: [{ $gt: ["$minStock", 0] }, { $lte: ["$currentStock", "$minStock"] }],
  };
}

/** `.find()` / `.countDocuments()` filter for active low-stock products. */
export function lowStockQuery() {
  return { isActive: { $ne: false }, $expr: lowStockExpr() };
}

/** `.find()` / `.countDocuments()` filter for active out-of-stock products. */
export function outOfStockQuery() {
  return { isActive: { $ne: false }, currentStock: { $lte: 0 } };
}

/** `.find()` filter for active products that are low OR out of stock. */
export function criticalStockQuery() {
  return {
    isActive: { $ne: false },
    $or: [{ currentStock: { $lte: 0 } }, { $expr: atOrBelowMinExpr() }],
  };
}
