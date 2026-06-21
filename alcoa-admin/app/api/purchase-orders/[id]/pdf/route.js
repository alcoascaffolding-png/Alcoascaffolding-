export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import PurchaseOrder from "@/models/PurchaseOrder";
import { generatePurchaseOrderPDF } from "@/lib/pdf/purchase-document-pdf";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const GET = withErrorHandler(async (request, context) => {
  await authorizeApi("purchase-orders", "read");
  const params = await resolveParams(context);

  await connectDB();
  const po = await PurchaseOrder.findById(params.id).lean();
  if (!po) throw new AppError("Purchase Order not found", 404);
  if (!po.items?.length) {
    throw new AppError("Add at least one line item before downloading PDF.", 400);
  }

  const pdfBuffer = await generatePurchaseOrderPDF(po);
  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${po.poNumber}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
});
