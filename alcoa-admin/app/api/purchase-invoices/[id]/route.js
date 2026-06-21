import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { recalculatePurchaseTotals } from "@/lib/purchase-service";
import {
  validatePurchaseInvoicePayment,
  applyPurchaseInvoicePaymentFields,
} from "@/lib/purchase-invoice-payment";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-invoices", "read");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await PurchaseInvoice.findById(params.id)
    .populate("vendor", "vendorCode companyName")
    .populate("purchaseOrder", "poNumber status")
    .lean();
  if (!doc) throw new AppError("Purchase Invoice not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-invoices", "write");

  const params = await resolveParams(context);
  await connectDB();
  const body = await request.json();

  const doc = await PurchaseInvoice.findById(params.id);
  if (!doc) throw new AppError("Purchase Invoice not found", 404);

  if (body.vendorName != null) doc.vendorName = String(body.vendorName).trim();
  if (body.invoiceDate) doc.invoiceDate = new Date(body.invoiceDate);
  if (body.dueDate) doc.dueDate = new Date(body.dueDate);
  if (body.notes !== undefined) doc.notes = body.notes;

  if (body.items) {
    const totals = recalculatePurchaseTotals(body.items);
    doc.items = totals.items;
    doc.subtotal = totals.subtotal;
    doc.vatAmount = totals.vatAmount;
    doc.total = totals.total;
  }

  if (body.paymentStatus != null) doc.paymentStatus = body.paymentStatus;
  if (body.paidAmount != null) doc.paidAmount = Number(body.paidAmount);

  validatePurchaseInvoicePayment({
    paymentStatus: doc.paymentStatus,
    paidAmount: doc.paidAmount,
    total: doc.total,
  });
  applyPurchaseInvoicePaymentFields(doc);
  await doc.save();

  return apiSuccess(await PurchaseInvoice.findById(doc._id).lean());
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-invoices", "delete");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await PurchaseInvoice.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Purchase Invoice not found", 404);
  return apiSuccess({ deleted: true });
});
