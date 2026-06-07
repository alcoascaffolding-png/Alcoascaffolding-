import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import DeliveryNote from "@/models/DeliveryNote";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await DeliveryNote.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        open: {
          $sum: {
            $cond: [
              { $in: ["$status", ["draft", "ready", "dispatched", "in_transit"]] },
              1,
              0,
            ],
          },
        },
        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, draft: 0, open: 0, delivered: 0 });
});
