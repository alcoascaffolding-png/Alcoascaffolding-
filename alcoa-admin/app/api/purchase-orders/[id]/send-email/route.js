export const runtime = "nodejs";
export const maxDuration = 60;

import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import PurchaseOrder from "@/models/PurchaseOrder";
import { resolveVendorEmail } from "@/lib/resolve-vendor-email";
import { generatePurchaseOrderPDF } from "@/lib/pdf/purchase-document-pdf";
import { sendPurchaseOrderEmail } from "@/lib/email/resend";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const POST = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-orders", "write");
  const params = await resolveParams(context);
  const id = params?.id;
  if (!id) throw new AppError("Missing id", 400);

  await connectDB();
  const po = await PurchaseOrder.findById(id).populate("vendor", "email companyName").lean();
  if (!po) throw new AppError("Purchase Order not found", 404);

  const vendorEmail = await resolveVendorEmail(po);
  if (!vendorEmail) {
    throw new AppError(
      "No vendor email found. Add an email on the linked vendor record.",
      400
    );
  }

  const outbound = { ...po, vendorEmail };
  const pdfBuffer = await generatePurchaseOrderPDF(po);
  const result = await sendPurchaseOrderEmail(outbound, pdfBuffer);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "send_email",
    resource: "purchase-orders",
    resourceId: id,
    summary: `Emailed PO ${po.poNumber} to ${vendorEmail}`,
  });

  return apiSuccess({ sent: true, messageId: result.messageId, sentTo: vendorEmail });
});
