export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesOrder from "@/models/SalesOrder";
import { prepareSalesOrderForPdf } from "@/lib/load-sales-order-for-pdf";
import { resolveDocumentCustomerEmail } from "@/lib/resolve-document-customer";
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
  const order = await prepareSalesOrderForPdf(id);
  if (!order) throw new AppError("Sales Order not found", 404);
  const toEmail = resolveDocumentCustomerEmail(order);
  if (!toEmail) {
    throw new AppError(
      "No customer email on this sales order. Add an email on the order or on the linked customer record.",
      400
    );
  }
  const outbound = { ...order, customerEmail: toEmail };

  const pdfBuffer = await generateSalesOrderPDF(outbound);
  const result = await sendSalesOrderEmail(outbound, pdfBuffer);

  await SalesOrder.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: toEmail,
        subject: `Sales Order ${order.orderNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
