import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "6months";

  let monthsBack = 6;
  if (period === "1year") monthsBack = 12;
  else if (period === "3months") monthsBack = 3;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  const salesData = await SalesInvoice.aggregate([
    { $match: { invoiceDate: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: "$invoiceDate" },
          month: { $month: "$invoiceDate" },
        },
        revenue: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatted = salesData.map((d) => ({
    month: monthNames[d._id.month - 1],
    year: d._id.year,
    revenue: d.revenue,
    count: d.count,
    name: `${monthNames[d._id.month - 1]} ${d._id.year}`,
  }));

  return apiSuccess(formatted);
});
