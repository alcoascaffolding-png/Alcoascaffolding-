import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import PurchaseOrder from "@/models/PurchaseOrder";
import {
  recalculatePurchaseTotals,
  syncPurchaseOrderReceived,
} from "@/lib/purchase-service";

const PO_STATUSES = ["draft", "sent", "confirmed", "partially_received", "received", "cancelled"];

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-orders", "read");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await PurchaseOrder.findById(params.id).populate("vendor", "vendorCode companyName").lean();
  if (!doc) throw new AppError("Purchase Order not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-orders", "write");

  const params = await resolveParams(context);
  await connectDB();
  const body = await request.json();

  const doc = await PurchaseOrder.findById(params.id);
  if (!doc) throw new AppError("Purchase Order not found", 404);

  const prevSnapshot = {
    status: doc.status,
    stockApplied: doc.stockApplied,
    items: doc.items,
    poNumber: doc.poNumber,
  };

  if (body.status != null && !PO_STATUSES.includes(body.status)) {
    throw new AppError(`Invalid status "${body.status}"`, 400);
  }

  if (body.vendorName != null) doc.vendorName = String(body.vendorName).trim();
  if (body.vendor != null) {
    const vid = String(body.vendor);
    doc.vendor = vid && vid !== "__none__" && mongoose.Types.ObjectId.isValid(vid) ? vid : undefined;
  }
  if (body.orderDate) doc.orderDate = new Date(body.orderDate);
  if (body.deliveryDate) doc.deliveryDate = new Date(body.deliveryDate);
  if (body.status) doc.status = body.status;
  if (body.notes !== undefined) doc.notes = body.notes;

  if (body.items) {
    const totals = recalculatePurchaseTotals(body.items);
    doc.items = totals.items;
    doc.subtotal = totals.subtotal;
    doc.vatAmount = totals.vatAmount;
    doc.total = totals.total;
  }

  await doc.validate();

  const stockSaved = await syncPurchaseOrderReceived(doc, prevSnapshot, session.user.id);
  if (!stockSaved) await doc.save();

  return apiSuccess(await PurchaseOrder.findById(doc._id).lean());
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-orders", "delete");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await PurchaseOrder.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Purchase Order not found", 404);
  return apiSuccess({ deleted: true });
});
