import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import PurchaseOrder from "@/models/PurchaseOrder";

export const GET = withErrorHandler(async () => {
  await authorizeApi("purchase-orders", "read");

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
        totalValue: { $sum: "$total" },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, received: 0, pending: 0, totalValue: 0 });
});
