import mongoose from "mongoose";
import Customer from "@/models/Customer";
import { AppError } from "@/lib/api-error";
import { getLinkedCustomerId } from "@/lib/map-customer-to-quotation";

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

/**
 * Side-effects of a status transition. Stamps `sentDate` / `viewedDate` /
 * `convertedAt` automatically so timeline fields stay consistent with status.
 */
export function applyStatusSideEffects(doc, nextStatus) {
  if (!nextStatus || nextStatus === doc.status) return;
  const now = new Date();
  if (nextStatus === "sent" && !doc.sentDate) doc.sentDate = now;
  if (nextStatus === "viewed" && !doc.viewedDate) doc.viewedDate = now;
  if (
    ["converted", "converted_to_sales_order", "converted_to_invoice"].includes(nextStatus) &&
    !doc.convertedAt
  ) {
    doc.convertedAt = now;
  }
}

/** Quotation fields allowed on PATCH (explicit list — avoids silent drops from deny-list gaps). */
const PATCH_SCALAR_FIELDS = [
  "customerName",
  "customerAddress",
  "customerEmail",
  "customerPhone",
  "customerTRN",
  "contactPersonName",
  "contactPersonDesignation",
  "contactPersonEmail",
  "contactPersonPhone",
  "quoteType",
  "status",
  "subject",
  "salesExecutive",
  "preparedBy",
  "customerPONumber",
  "referenceNumber",
  "paymentTerms",
  "deliveryTerms",
  "projectDuration",
  "subtotal",
  "deliveryCharges",
  "installationCharges",
  "pickupCharges",
  "discount",
  "discountType",
  "vatPercentage",
  "vatAmount",
  "totalAmount",
  "currency",
  "notes",
  "internalNotes",
  "termsAndConditions",
  "followUpNotes",
  "deliveryDate",
  "followUpDate",
];

/**
 * Normalize `customer` on the PATCH body to a Mongo ObjectId (or omit to keep existing).
 * Call before {@link applyQuotationPatch}.
 */
export async function normalizeQuotationPatchCustomer(body, userId) {
  if (!Object.prototype.hasOwnProperty.call(body, "customer")) return body;

  const linked = getLinkedCustomerId(body.customer);
  const next = { ...body };

  if (linked === "__none__") {
    if (String(next.customerName || "").trim()) {
      next.customer = await resolveQuotationCustomerId(next, userId);
    } else {
      delete next.customer;
    }
    return next;
  }

  if (mongoose.Types.ObjectId.isValid(linked)) {
    next.customer = new mongoose.Types.ObjectId(linked);
  } else {
    delete next.customer;
  }
  return next;
}

export function applyQuotationPatch(doc, body) {
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    applyStatusSideEffects(doc, body.status);
  }

  for (const key of PATCH_SCALAR_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      doc.set(key, body[key]);
    }
  }

  if (body.deliveryAddress !== undefined) {
    doc.deliveryAddress = body.deliveryAddress;
    doc.markModified("deliveryAddress");
  }
  if (body.bankDetails !== undefined) {
    doc.bankDetails = body.bankDetails;
    doc.markModified("bankDetails");
  }
  if (Array.isArray(body.items)) {
    doc.items = body.items;
    doc.markModified("items");
  }

  if (body.quoteDate != null && body.quoteDate !== "") {
    doc.quoteDate = coerceQuotationDate(body.quoteDate, doc.quoteDate);
  }
  if (body.validUntil != null && body.validUntil !== "") {
    doc.validUntil = coerceQuotationDate(body.validUntil, doc.validUntil);
  }

  if (body.customer instanceof mongoose.Types.ObjectId) {
    doc.customer = body.customer;
  } else if (Object.prototype.hasOwnProperty.call(body, "customer") && body.customer != null) {
    const linked = getLinkedCustomerId(body.customer);
    if (linked !== "__none__" && mongoose.Types.ObjectId.isValid(linked)) {
      doc.customer = new mongoose.Types.ObjectId(linked);
    }
  }
}
