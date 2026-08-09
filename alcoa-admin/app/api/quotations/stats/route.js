import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  // Server date boundary — start of today. Derived-expiry never rewrites status.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const isOpenStatus = { $in: ["$status", ["draft", "sent", "viewed"]] };
  const isDateLapsed = {
    $and: [{ $ne: ["$validUntil", null] }, { $lt: ["$validUntil", startOfToday] }],
  };
  const isDerivedExpired = {
    $or: [
      { $eq: ["$status", "expired"] },
      { $and: [isOpenStatus, isDateLapsed] },
    ],
  };

  const stats = await Quotation.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
        sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
        // Pending = draft + sent that have NOT lapsed (matches the filter + badges).
        pending: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", ["draft", "sent"]] },
                  { $not: isDateLapsed },
                ],
              },
              1,
              0,
            ],
          },
        },
        // Expired = stored "expired" OR derived-expired open quotes.
        expired: { $sum: { $cond: [isDerivedExpired, 1, 0] } },
        approved: {
          $sum: {
            $cond: [{ $in: ["$status", ["accepted", "approved"]] }, 1, 0],
          },
        },
        converted: {
          $sum: {
            $cond: [
              {
                $in: [
                  "$status",
                  ["converted", "converted_to_sales_order", "converted_to_invoice"],
                ],
              },
              1,
              0,
            ],
          },
        },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        totalValue: { $sum: "$totalAmount" },
        approvedValue: {
          $sum: {
            $cond: [{ $in: ["$status", ["accepted", "approved"]] }, "$totalAmount", 0],
          },
        },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, draft: 0, sent: 0, pending: 0, expired: 0, approved: 0, converted: 0, rejected: 0, totalValue: 0, approvedValue: 0 });
});
