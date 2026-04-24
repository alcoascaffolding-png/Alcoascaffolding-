import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as AED currency
 */
export function formatCurrency(amount, currency = "AED") {
  if (amount == null || isNaN(amount)) return `${currency} 0.00`;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to DD/MM/YYYY
 */
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a date to relative time (e.g. "2 hours ago")
 */
export function formatRelativeTime(date) {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Generate a short reference ID
 */
export function generateRef(prefix = "REF") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Truncate a string to a max length
 */
export function truncate(str, maxLength = 50) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

/**
 * Capitalise the first letter of each word
 */
export function titleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Deep-clean an object — remove undefined/null fields for API payloads
 */
export function cleanPayload(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
}

/**
 * Parse a features flag string like "whatsapp,pdf-email"
 */
export function isFeatureEnabled(featureName) {
  const features = (process.env.NEXT_PUBLIC_FEATURES || "").split(",").map((f) => f.trim());
  return features.includes(featureName);
}
