import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await Quotation.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        totalValue: { $sum: "$totalAmount" },
        approvedValue: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, "$totalAmount", 0] } },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, draft: 0, sent: 0, approved: 0, rejected: 0, totalValue: 0, approvedValue: 0 });
});
