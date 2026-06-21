export const runtime = "nodejs";
export const maxDuration = 60;

import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { resolveVendorEmail } from "@/lib/resolve-vendor-email";
import { generatePurchaseInvoicePDF } from "@/lib/pdf/purchase-document-pdf";
import { sendPurchaseInvoiceEmail } from "@/lib/email/resend";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const POST = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("purchase-invoices", "write");
  const params = await resolveParams(context);
  const id = params?.id;
  if (!id) throw new AppError("Missing id", 400);

  await connectDB();
  const inv = await PurchaseInvoice.findById(id).populate("vendor", "email companyName").lean();
  if (!inv) throw new AppError("Purchase Invoice not found", 404);

  const vendorEmail = await resolveVendorEmail(inv);
  if (!vendorEmail) {
    throw new AppError(
      "No vendor email found. Add an email on the linked vendor record.",
      400
    );
  }

  const outbound = { ...inv, vendorEmail };
  const pdfBuffer = await generatePurchaseInvoicePDF(inv);
  const result = await sendPurchaseInvoiceEmail(outbound, pdfBuffer);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "send_email",
    resource: "purchase-invoices",
    resourceId: id,
    summary: `Emailed purchase invoice ${inv.invoiceNumber} to ${vendorEmail}`,
  });

  return apiSuccess({ sent: true, messageId: result.messageId, sentTo: vendorEmail });
});
