/**
 * Centralized UAE number/currency formatting for all generated PDFs.
 *
 * The business is UAE-based (currency AED). Amounts must use Western thousands
 * grouping (groups of 3, e.g. 1,234,567.89) with two decimal places — NOT the
 * Indian lakh/crore grouping (e.g. 12,34,567.89).
 *
 * Formatting runs in Node (Playwright builds the HTML string here before handing
 * it to headless Chromium), so full-ICU Intl is available. `en-AE` yields the
 * same Western grouping as `en-US`/`en-GB`.
 */

/** Shared en-AE money formatter — Western grouping, always 2 decimal places. */
const AE_MONEY_FORMAT = new Intl.NumberFormat("en-AE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount for PDFs using UAE conventions
 * (Western thousands grouping + 2 decimals, e.g. 1,234,567.89).
 * Non-finite/blank values render as "0.00".
 */
export function formatPdfNumber(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "0.00";
  return AE_MONEY_FORMAT.format(n);
}

/**
 * Format an amount with its currency label (e.g. "AED 1,234,567.89").
 */
export function formatPdfCurrency(value, currency = "AED") {
  return `${currency} ${formatPdfNumber(value)}`;
}
