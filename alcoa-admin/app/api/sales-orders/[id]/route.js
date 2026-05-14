import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import { syncQuotationsAfterSalesOrderPatch, revertQuotationFromConvertedToApproved } from "@/lib/sync-quotation-sales-order";

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const doc = await SalesOrder.findById(params.id)
    .populate("customer", "companyName")
    .populate("quotation", "quoteNumber status customerName totalAmount")
    .lean();
  if (!doc) throw new AppError("Sales Order not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const body = await request.json();

  const prev = await SalesOrder.findById(params.id).lean();
  if (!prev) throw new AppError("Sales Order not found", 404);

  const patch = { ...body };
  if (Object.prototype.hasOwnProperty.call(body, "quotation")) {
    const qid = toObjectId(body.quotation);
    patch.quotation = qid ?? null;
  }

  const doc = await SalesOrder.findByIdAndUpdate(params.id, patch, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new AppError("Sales Order not found", 404);

  await syncQuotationsAfterSalesOrderPatch(prev, doc);

  const populated = await SalesOrder.findById(doc._id)
    .populate("customer", "companyName")
    .populate("quotation", "quoteNumber status customerName totalAmount")
    .lean();
  return apiSuccess(populated);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const prev = await SalesOrder.findById(params.id).lean();
  const doc = await SalesOrder.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Sales Order not found", 404);

  if (prev?.quotation) {
    await revertQuotationFromConvertedToApproved(prev.quotation);
  }

  return apiSuccess({ deleted: true });
});
