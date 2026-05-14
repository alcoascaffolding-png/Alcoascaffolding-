import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const stats = await SalesInvoice.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unpaid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "unpaid"] }, 1, 0] } },
        partially_paid: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "partially_paid"] }, 1, 0] },
        },
        paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "overdue"] }, 1, 0] } },
        totalValue: { $sum: "$total" },
        outstanding: {
          $sum: {
            $subtract: [
              { $ifNull: ["$total", 0] },
              { $ifNull: ["$paidAmount", 0] },
            ],
          },
        },
      },
    },
  ]);

  return apiSuccess(
    stats[0] || {
      total: 0,
      unpaid: 0,
      partially_paid: 0,
      paid: 0,
      overdue: 0,
      totalValue: 0,
      outstanding: 0,
    }
  );
});
