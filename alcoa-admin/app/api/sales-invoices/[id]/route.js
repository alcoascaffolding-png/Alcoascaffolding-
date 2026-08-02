import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { Customer, Quotation, SalesInvoice, SalesOrder } from "@/lib/mongoose-models";
import { QUOTATION_CUSTOMER_POPULATE_FIELDS } from "@/lib/load-quotation-for-pdf";
import {
  validateSalesInvoicePayment,
  applySalesInvoicePaymentFields,
} from "@/lib/sales-invoice-payment";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { resolveDocumentBankDetails } from "@/lib/resolve-document-bank-details";
void Customer;

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("sales-invoices", "read");

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const existing = await SalesInvoice.findById(params.id);
  if (!existing) throw new AppError("Tax Invoice not found", 404);

  if (!String(existing.invoiceNumber || "").startsWith("SI")) {
    existing.invoiceNumber = await resolveInvoiceNumberForCreate(
      {
        invoiceDate: existing.invoiceDate || new Date(),
        salesInvoiceId: existing._id,
      },
      { Quotation, SalesOrder, SalesInvoice },
    );
    existing.recalculateTotals();
    await existing.save();
  } else if (Number(existing.total || 0) <= 0 && existing.items?.length) {
    existing.recalculateTotals();
    await existing.save();
  }

  if (!existing.quotation && existing.salesOrder) {
    const order = await SalesOrder.findById(existing.salesOrder).select("quotation").lean();
    if (order?.quotation) {
      existing.quotation = order.quotation;
      await existing.save();
    }
  }

  const doc = await SalesInvoice.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("quotation", "quoteNumber status customerName totalAmount bankAccount")
    .populate("salesOrder", "orderNumber status customerName total quotation")
    .lean();

  const resolvedBankDetails = await resolveDocumentBankDetails(doc);
  return apiSuccess({ ...doc, resolvedBankDetails });
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("sales-invoices", "write");

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const body = sanitizeMongoDocument(await request.json());
  const patch = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, "salesOrder")) {
    const sid = toObjectId(body.salesOrder);
    patch.salesOrder = sid ?? null;
    if (sid) {
      const conflict = await SalesInvoice.findOne({
        salesOrder: sid,
        _id: { $ne: params.id },
      })
        .select("invoiceNumber")
        .lean();
      if (conflict) {
        throw new AppError(
          `Sales order is already linked to tax invoice ${conflict.invoiceNumber}.`,
          400
        );
      }
    }
  }

  const doc = await SalesInvoice.findById(params.id);
  if (!doc) throw new AppError("Tax Invoice not found", 404);

  for (const [key, value] of Object.entries(patch)) {
    if (key === "invoiceNumber" && value == null) continue;
    doc.set(key, value);
  }
  doc.recalculateTotals();

  validateSalesInvoicePayment({
    paymentStatus: doc.paymentStatus,
    paidAmount: doc.paidAmount,
    total: doc.total,
  });
  applySalesInvoicePaymentFields(doc);

  try {
    await doc.save();
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors || {})[0]?.message;
      throw new AppError(first || err.message || "Tax invoice validation failed", 400);
    }
    throw err;
  }

  const populated = await SalesInvoice.findById(doc._id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("quotation", "quoteNumber status customerName totalAmount")
    .populate("salesOrder", "orderNumber status customerName total")
    .lean();
  return apiSuccess(populated);
});

export const DELETE = withErrorHandler(async () => {
  await authorizeApi("sales-invoices", "delete");
  // Tax invoices are permanent statutory records — never delete via API.
  throw new AppError(
    "Tax invoices are permanent records and cannot be deleted.",
    403
  );
});
