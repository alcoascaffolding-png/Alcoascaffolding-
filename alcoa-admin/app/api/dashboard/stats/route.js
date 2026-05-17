import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Customer from "@/models/Customer";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import ContactMessage from "@/models/ContactMessage";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [customerStats, quotationStats, messageStats, invoiceStats, revenueStats] = await Promise.all([
    Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
        },
      },
    ]),
    Quotation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $in: ["$status", ["draft", "sent"]] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
          totalValue: { $sum: "$totalAmount" },
        },
      },
    ]),
    ContactMessage.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
        },
      },
    ]),
    SalesInvoice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "overdue"] }, 1, 0] } },
          totalValue: { $sum: "$total" },
          collected: { $sum: "$paidAmount" },
        },
      },
    ]),
    SalesInvoice.aggregate([
      { $match: { invoiceDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]),
  ]);

  return apiSuccess({
    customers: customerStats[0] || { total: 0, active: 0 },
    quotations: quotationStats[0] || { total: 0, pending: 0, approved: 0, totalValue: 0 },
    messages: messageStats[0] || { total: 0, unread: 0 },
    invoices: invoiceStats[0] || { total: 0, paid: 0, overdue: 0, totalValue: 0, collected: 0 },
    revenue: { monthly: revenueStats[0]?.revenue || 0 },
  });
});
