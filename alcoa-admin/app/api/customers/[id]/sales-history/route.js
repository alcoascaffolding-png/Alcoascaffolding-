import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params = await resolveParams(context);
  if (!params?.id) throw new AppError("Customer id required", 400);

  await connectDB();

  const [quotations, salesOrders, salesInvoices] = await Promise.all([
    Quotation.find({ customer: params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("quoteNumber customerName status totalAmount quoteDate createdAt")
      .lean(),
    SalesOrder.find({ customer: params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("orderNumber customerName status total orderDate createdAt")
      .lean(),
    SalesInvoice.find({ customer: params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("invoiceNumber customerName paymentStatus total paidAmount balance invoiceDate createdAt")
      .lean(),
  ]);

  return apiSuccess({ quotations, salesOrders, salesInvoices });
});
