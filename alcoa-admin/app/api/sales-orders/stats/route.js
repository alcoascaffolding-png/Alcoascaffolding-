import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await SalesOrder.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        open: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  ["draft", "confirmed", "in_progress"],
                ],
              },
              1,
              0,
            ],
          },
        },
        fulfilled: {
          $sum: {
            $cond: [{ $in: ["$status", ["delivered", "completed"]] }, 1, 0],
          },
        },
        totalValue: { $sum: "$total" },
      },
    },
  ]);

  return apiSuccess(
    stats[0] || { total: 0, draft: 0, open: 0, fulfilled: 0, totalValue: 0 }
  );
});
