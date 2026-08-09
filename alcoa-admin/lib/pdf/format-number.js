/**
 * Centralized number/currency formatting for all generated PDFs.
 *
 * Amounts always use 2 decimal places with NO thousand separators / grouping
 * (e.g. 1234567.89, not 1,234,567.89 or 12,34,567.89).
 */

/**
 * Format a numeric amount for PDFs: 2 decimals, no grouping.
 * Non-finite/blank values render as "0.00".
 */
export function formatPdfNumber(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

/**
 * Format an amount with its currency label (e.g. "AED 1234567.89").
 */
export function formatPdfCurrency(value, currency = "AED") {
  return `${currency} ${formatPdfNumber(value)}`;
}
