import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { buildDeliveryNotePrefillFromSalesOrder } from "@/lib/build-delivery-note-from-sales-order";

export const GET = withErrorHandler(async (request, context) => {
  await authorizeApi("sales-orders", "read");

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const prefill = await buildDeliveryNotePrefillFromSalesOrder(params.id);
  return apiSuccess(prefill);
});
