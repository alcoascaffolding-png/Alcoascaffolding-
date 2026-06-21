export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { connectDB } from "@/lib/db";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { generatePurchaseInvoicePDF } from "@/lib/pdf/purchase-document-pdf";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const GET = withErrorHandler(async (request, context) => {
  await authorizeApi("purchase-invoices", "read");
  const params = await resolveParams(context);

  await connectDB();
  const inv = await PurchaseInvoice.findById(params.id).lean();
  if (!inv) throw new AppError("Purchase Invoice not found", 404);
  if (!inv.items?.length) {
    throw new AppError("Add at least one line item before downloading PDF.", 400);
  }

  const pdfBuffer = await generatePurchaseInvoicePDF(inv);
  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${inv.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
