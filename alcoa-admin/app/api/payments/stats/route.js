import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Payment from "@/models/Payment";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await Payment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, totalAmount: 0 });
});
