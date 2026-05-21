export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import { generateSalesOrderPDF } from "@/lib/pdf/sales-document-pdf";
import { sendSalesOrderEmail } from "@/lib/email/resend";

export const POST = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const id = routeParams?.id;
  if (!id) return apiError("Missing id", 400);

  await connectDB();
  const order = await SalesOrder.findById(id).lean();
  if (!order) throw new AppError("Sales Order not found", 404);
  if (!order.customerEmail) throw new AppError("Sales order has no customer email", 400);

  const pdfBuffer = await generateSalesOrderPDF(order);
  const result = await sendSalesOrderEmail(order, pdfBuffer);

  await SalesOrder.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: order.customerEmail,
        subject: `Sales Order ${order.orderNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
