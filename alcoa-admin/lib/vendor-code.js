/**
 * Vendor codes: VND + ddmmyy + #### (yearly sequential).
 * e.g. VND0208260001 (2 Aug 2026, seq 1).
 *
 * Legacy rows may still use VND-### (e.g. VND-013); those remain readable.
 * New creates / auto-import use the format above.
 */

import Vendor from "@/models/Vendor";
import { documentDatePart } from "@/lib/document-number";

export const VENDOR_CODE_PREFIX = "VND";

/** VND + ddmmyy(6) + seq(4) — e.g. VND0208260001 */
export const VENDOR_CODE_REGEX = /^VND\d{10}$/;

/** Legacy VND-### — e.g. VND-013 */
export const LEGACY_VENDOR_CODE_REGEX = /^VND-\d+$/;

/**
 * Next 4-digit sequence for the calendar year (resets each year).
 * Only new-format VNDddmmyy#### codes count toward the counter.
 * Legacy VND-### IDs are ignored (different shape; no collision).
 */
export async function nextYearlyVendorSequence(year) {
  const yy = String(year).slice(-2);
  const newFmt = new RegExp(`^${VENDOR_CODE_PREFIX}\\d{4}${yy}\\d{4}$`);
  const vendors = await Vendor.find({
    vendorCode: { $regex: newFmt },
  })
    .select("vendorCode")
    .lean();

  let max = 0;
  for (const vendor of vendors) {
    const seq = parseInt(String(vendor.vendorCode || "").slice(-4), 10) || 0;
    if (seq > max) max = seq;
  }
  return max + 1;
}

export function formatVendorCode(baseDate, sequence) {
  const datePart = documentDatePart(baseDate);
  const seq = String(sequence).padStart(4, "0").slice(-4);
  return `${VENDOR_CODE_PREFIX}${datePart}${seq}`;
}

/**
 * Allocate next VNDddmmyy#### for today (or baseDate).
 * Sequence is yearly and independent of other document modules.
 */
export async function generateVendorCode(baseDate = new Date()) {
  const d = new Date(baseDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date for vendor code");
  }

  let seq = await nextYearlyVendorSequence(d.getFullYear());

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = formatVendorCode(d, seq);
    const taken = await Vendor.exists({ vendorCode: candidate });
    if (!taken) return candidate;
    seq += 1;
  }

  throw new Error("Unable to generate a unique vendor code. Please try again.");
}
