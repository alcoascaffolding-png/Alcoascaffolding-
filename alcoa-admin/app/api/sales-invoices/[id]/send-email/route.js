export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";
import { generateSalesInvoicePDF } from "@/lib/pdf/sales-document-pdf";
import { sendSalesInvoiceEmail } from "@/lib/email/resend";

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
  const invoice = await SalesInvoice.findById(id).lean();
  if (!invoice) throw new AppError("Tax Invoice not found", 404);
  if (!invoice.customerEmail) throw new AppError("Invoice has no customer email", 400);

  const pdfBuffer = await generateSalesInvoicePDF(invoice);
  const result = await sendSalesInvoiceEmail(invoice, pdfBuffer);

  await SalesInvoice.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: invoice.customerEmail,
        subject: `Invoice ${invoice.invoiceNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
