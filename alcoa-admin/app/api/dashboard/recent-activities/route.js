import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import ContactMessage from "@/models/ContactMessage";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "8");

  const [recentOrders, recentMessages, recentQuotations] = await Promise.all([
    SalesOrder.find().sort({ createdAt: -1 }).limit(5).select("orderNumber customerName total status createdAt").lean(),
    ContactMessage.find().sort({ createdAt: -1 }).limit(limit).select("type name email status priority createdAt").lean(),
    Quotation.find().sort({ createdAt: -1 }).limit(5).select("quoteNumber customerName totalAmount status createdAt").lean(),
  ]);

  return apiSuccess({ orders: recentOrders, messages: recentMessages, quotations: recentQuotations });
});
