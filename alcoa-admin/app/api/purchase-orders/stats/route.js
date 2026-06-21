import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import PurchaseOrder from "@/models/PurchaseOrder";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await PurchaseOrder.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        received: { $sum: { $cond: [{ $eq: ["$status", "received"] }, 1, 0] } },
        pending: {
          $sum: {
            $cond: [{ $in: ["$status", ["draft", "sent", "confirmed", "partially_received"]] }, 1, 0],
          },
        },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, received: 0, pending: 0 });
});
