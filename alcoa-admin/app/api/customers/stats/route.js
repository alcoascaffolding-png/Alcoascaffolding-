import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Customer from "@/models/Customer";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await Customer.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        prospect: { $sum: { $cond: [{ $eq: ["$status", "prospect"] }, 1, 0] } },
        totalRevenue: { $sum: "$totalRevenue" },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, active: 0, prospect: 0, totalRevenue: 0 });
});
