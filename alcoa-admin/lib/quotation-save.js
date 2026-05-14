import mongoose from "mongoose";
import crypto from "node:crypto";
import Customer from "@/models/Customer";
import { AppError } from "@/lib/api-error";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Returns the absolute base URL to use for public links shared with customers.
 * Reads PUBLIC_APP_URL → NEXTAUTH_URL → VERCEL_URL → localhost fallback.
 */
export function getPublicAppUrl() {
  const explicit = process.env.PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Idempotently ensure the quotation has a publicToken; returns the token + URL. */
export async function ensureQuotationPublicToken(quotationId, Quotation) {
  const existing = await Quotation.findById(quotationId).select("publicToken").lean();
  if (existing?.publicToken) {
    return {
      token: existing.publicToken,
      url: `${getPublicAppUrl()}/q/${existing.publicToken}`,
    };
  }
  const token = crypto.randomBytes(24).toString("hex");
  await Quotation.findByIdAndUpdate(quotationId, { publicToken: token });
  return { token, url: `${getPublicAppUrl()}/q/${token}` };
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

/**
 * Side-effects of a status transition. Stamps `sentDate` / `viewedDate` /
 * `convertedAt` automatically so timeline fields stay consistent with status.
 */
export function applyStatusSideEffects(doc, nextStatus) {
  if (!nextStatus || nextStatus === doc.status) return;
  const now = new Date();
  if (nextStatus === "sent" && !doc.sentDate) doc.sentDate = now;
  if (nextStatus === "viewed" && !doc.viewedDate) doc.viewedDate = now;
  if (nextStatus === "converted" && !doc.convertedAt) doc.convertedAt = now;
}

export function applyQuotationPatch(doc, body) {
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    applyStatusSideEffects(doc, body.status);
  }
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
  if (Object.prototype.hasOwnProperty.call(body, "customer")) {
    const raw = body.customer;
    if (raw == null || raw === "" || raw === "__none__") {
      doc.set("customer", null);
    } else if (mongoose.Types.ObjectId.isValid(String(raw))) {
      doc.customer = new mongoose.Types.ObjectId(String(raw));
    }
  }
}
