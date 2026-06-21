import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import PurchaseInvoice from "@/models/PurchaseInvoice";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await PurchaseInvoice.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unpaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0] } },
        totalValue: { $sum: "$total" },
        totalOutstanding: { $sum: "$balance" },
      },
    },
  ]);

  return apiSuccess(stats[0] || { total: 0, unpaid: 0, totalValue: 0, totalOutstanding: 0 });
});
