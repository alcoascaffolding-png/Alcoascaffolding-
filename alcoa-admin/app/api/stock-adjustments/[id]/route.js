import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-log";
import StockAdjustment from "@/models/StockAdjustment";
import { reverseStockAdjustment, editStockAdjustment } from "@/lib/stock-service";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  await authorizeApi("stock-adjustments", "read");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await StockAdjustment.findById(params.id).lean();
  if (!doc) throw new AppError("Stock Adjustment not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("stock-adjustments", "write");

  const params = await resolveParams(context);

  await connectDB();
  const body = await request.json();

  const { adjustment } = await editStockAdjustment({
    adjustmentId: params.id,
    productId: body.product,
    adjustmentType: body.adjustmentType,
    quantity: body.quantity,
    correctionNewStock: body.correctionNewStock,
    reason: body.reason,
    notes: body.notes,
    rejectBelowZero: true,
  });

  logAudit({
    session,
    action: "update",
    resource: "stock-adjustments",
    resourceId: adjustment._id,
    summary: `Edited stock adjustment ${adjustment.adjustmentNumber}`,
  });

  return apiSuccess(adjustment);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("stock-adjustments", "delete");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await StockAdjustment.findById(params.id);
  if (!doc) throw new AppError("Stock Adjustment not found", 404);

  await reverseStockAdjustment(doc);
  await doc.deleteOne();

  logAudit({
    session,
    action: "delete",
    resource: "stock-adjustments",
    resourceId: doc._id,
    summary: `Deleted stock adjustment ${doc.adjustmentType || doc._id}`,
  });

  return apiSuccess({ deleted: true });
});
