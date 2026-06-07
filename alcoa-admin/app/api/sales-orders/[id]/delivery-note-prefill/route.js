import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { buildDeliveryNotePrefillFromSalesOrder } from "@/lib/build-delivery-note-from-sales-order";

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const prefill = await buildDeliveryNotePrefillFromSalesOrder(params.id);
  return apiSuccess(prefill);
});
