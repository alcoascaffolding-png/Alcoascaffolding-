import mongoose from "mongoose";
import Customer from "@/models/Customer";
import { AppError } from "@/lib/api-error";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function coerceQuotationDate(value, fallback) {
  if (value == null || value === "") return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

/**
 * Resolves Mongo customer id: explicit id from body, else match by company name (case-insensitive),
 * else create a prospect Customer so quotations always satisfy `customer` ref.
 */
export async function resolveQuotationCustomerId(body, userId) {
  const raw = body.customer;
  if (raw) {
    const id = typeof raw === "object" && raw !== null && raw._id != null ? String(raw._id) : String(raw);
    if (mongoose.Types.ObjectId.isValid(id)) {
      const found = await Customer.findById(id).select("_id").lean();
      if (found) return new mongoose.Types.ObjectId(id);
    }
  }
  const name = (body.customerName || "").trim();
  if (!name) throw new AppError("Customer / company name is required", 400);
  const existing = await Customer.findOne({
    companyName: new RegExp(`^${escapeRegex(name)}$`, "i"),
  })
    .select("_id")
    .lean();
  if (existing) return existing._id;
  const doc = await Customer.create({
    companyName: name,
    displayName: name,
    primaryEmail: body.customerEmail || undefined,
    primaryPhone: body.customerPhone || undefined,
    status: "prospect",
    businessType: "Other",
    source: "Website",
    createdBy: userId,
  });
  return doc._id;
}

/** Strip fields that must not be overwritten from arbitrary JSON. */
const PATCH_DENY = new Set([
  "_id",
  "__v",
  "createdAt",
  "updatedAt",
  "createdBy",
  "lastModifiedBy",
  "quoteNumber",
  "emailsSent",
  "whatsappSent",
  "convertedToOrder",
  "orderId",
  "convertedAt",
]);

export function applyQuotationPatch(doc, body) {
  for (const [key, val] of Object.entries(body)) {
    if (PATCH_DENY.has(key) || key === "customer" || key === "quoteDate" || key === "validUntil") continue;
    if (val === undefined) continue;
    doc.set(key, val);
  }
  if (body.quoteDate != null && body.quoteDate !== "") {
    doc.quoteDate = coerceQuotationDate(body.quoteDate, doc.quoteDate);
  }
  if (body.validUntil != null && body.validUntil !== "") {
    doc.validUntil = coerceQuotationDate(body.validUntil, doc.validUntil);
  }
  if (
    body.customer != null &&
    body.customer !== "" &&
    body.customer !== "__none__" &&
    mongoose.Types.ObjectId.isValid(String(body.customer))
  ) {
    doc.customer = new mongoose.Types.ObjectId(String(body.customer));
  }
}
