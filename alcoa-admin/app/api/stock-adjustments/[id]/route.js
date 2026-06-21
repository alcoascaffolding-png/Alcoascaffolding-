import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import StockAdjustment from "@/models/StockAdjustment";
import { reverseStockAdjustment } from "@/lib/stock-service";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("stock-adjustments", "read");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await StockAdjustment.findById(params.id).lean();
  if (!doc) throw new AppError("Stock Adjustment not found", 404);
  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("stock-adjustments", "delete");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await StockAdjustment.findById(params.id);
  if (!doc) throw new AppError("Stock Adjustment not found", 404);

  await reverseStockAdjustment(doc);
  await doc.deleteOne();

  return apiSuccess({ deleted: true });
});
