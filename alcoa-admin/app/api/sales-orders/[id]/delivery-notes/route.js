import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import DeliveryNote from "@/models/DeliveryNote";
import SalesOrder from "@/models/SalesOrder";

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const order = await SalesOrder.findById(params.id).select("_id orderNumber").lean();
  if (!order) throw new AppError("Sales Order not found", 404);

  const items = await DeliveryNote.find({ salesOrder: order._id })
    .sort({ createdAt: -1 })
    .select("deliveryNoteNumber status deliveryDate createdAt customerName")
    .lean();

  return apiSuccess({ items, salesOrderNumber: order.orderNumber });
});
