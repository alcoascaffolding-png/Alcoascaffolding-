import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { computeSalesOrderDeliveryFulfillment } from "@/lib/sales-order-delivery-fulfillment";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const GET = withErrorHandler(async (request, context) => {
  await authorizeApi("sales-orders", "read");
  const params = await resolveParams(context);
  const { searchParams } = new URL(request.url);
  const excludeId = searchParams.get("excludeDeliveryNote") || undefined;

  await connectDB();
  const fulfillment = await computeSalesOrderDeliveryFulfillment(params.id, {
    excludeDeliveryNoteId: excludeId,
  });
  if (!fulfillment) throw new AppError("Sales Order not found", 404);
  return apiSuccess(fulfillment);
});
