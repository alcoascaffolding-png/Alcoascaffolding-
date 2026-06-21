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
  const doc = await SalesInvoice.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("salesOrder", "orderNumber status customerName total")
    .lean();
  if (!doc) throw new AppError("Tax Invoice not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("sales-invoices", "write");

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const body = await request.json();
  const patch = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, "salesOrder")) {
    const sid = toObjectId(body.salesOrder);
    patch.salesOrder = sid ?? null;
    if (sid) {
      const o = await SalesOrder.findById(sid)
        .select("orderNumber quotation")
        .populate("quotation", "quoteNumber")
        .lean();
      const linked =
        o?.orderNumber ||
        (o?.quotation && typeof o.quotation === "object" ? o.quotation.quoteNumber : null);
      if (linked) {
        const conflict = await SalesInvoice.exists({
          invoiceNumber: linked,
          _id: { $ne: params.id },
        });
        if (conflict) {
          throw new AppError(
            `Document ${linked} is already used by another tax invoice.`,
            400
          );
        }
        patch.invoiceNumber = linked;
      }
    }
  }

  const doc = await SalesInvoice.findById(params.id);
  if (!doc) throw new AppError("Tax Invoice not found", 404);

  Object.assign(doc, patch);
  if (doc.items?.length) doc.recalculateTotals();

  validateSalesInvoicePayment({
    paymentStatus: doc.paymentStatus,
    paidAmount: doc.paidAmount,
    total: doc.total,
  });
  applySalesInvoicePaymentFields(doc);
  await doc.save();

  const populated = await SalesInvoice.findById(doc._id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("salesOrder", "orderNumber status customerName total")
    .lean();
  return apiSuccess(populated);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("sales-invoices", "delete");

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const doc = await SalesInvoice.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Tax Invoice not found", 404);
  return apiSuccess({ deleted: true });
});
