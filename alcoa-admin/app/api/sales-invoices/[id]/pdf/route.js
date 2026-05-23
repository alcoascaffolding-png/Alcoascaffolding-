export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { SalesInvoice } from "@/lib/mongoose-models";
import { generateSalesInvoicePDF } from "@/lib/pdf/sales-document-pdf";

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const id = routeParams?.id;
  if (!id) return apiError("Missing id", 400);

  await connectDB();
  const invoice = await SalesInvoice.findById(id)
    .populate("customer", "companyName addresses primaryPhone primaryEmail vatRegistrationNumber")
    .lean();
  if (!invoice) throw new AppError("Sales Invoice not found", 404);
  if (!invoice.items?.length) {
    throw new AppError(
      "Add at least one line item to the sales invoice before downloading PDF.",
      400
    );
  }

  const pdfBuffer = await generateSalesInvoicePDF(invoice);

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
