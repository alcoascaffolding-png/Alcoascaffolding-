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
  const current = Number(product.currentStock) ?? 0;
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
