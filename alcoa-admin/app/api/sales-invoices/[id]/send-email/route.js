export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";
import { prepareSalesInvoiceForPdf } from "@/lib/load-sales-invoice-for-pdf";
import { resolveDocumentCustomerEmail } from "@/lib/resolve-document-customer";
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
  const invoice = await prepareSalesInvoiceForPdf(id);
  if (!invoice) throw new AppError("Tax Invoice not found", 404);
  const toEmail = resolveDocumentCustomerEmail(invoice);
  if (!toEmail) {
    throw new AppError(
      "No customer email on this invoice. Add an email on the invoice or on the linked customer record.",
      400
    );
  }
  const outbound = { ...invoice, customerEmail: toEmail };

  const pdfBuffer = await generateSalesInvoicePDF(outbound);
  const result = await sendSalesInvoiceEmail(outbound, pdfBuffer);

  await SalesInvoice.findByIdAndUpdate(id, {
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: toEmail,
        subject: `Invoice ${invoice.invoiceNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
