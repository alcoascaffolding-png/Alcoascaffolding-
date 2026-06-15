export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { prepareQuotationForPdf } from "@/lib/load-quotation-for-pdf";
import { resolveDocumentCustomerEmail } from "@/lib/resolve-document-customer";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";
import { sendQuotationEmail } from "@/lib/email/resend";
// import { ensureQuotationPublicToken } from "@/lib/quotation-save";

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const quotation = await prepareQuotationForPdf(params.id);
  if (!quotation) throw new AppError("Quotation not found", 404);
  const toEmail = resolveDocumentCustomerEmail(quotation);
  if (!toEmail) {
    throw new AppError(
      "No customer email on this quotation. Add an email on the quote or on the linked customer record.",
      400
    );
  }
  const outbound = { ...quotation, customerEmail: toEmail };

  // Customer accept/reject links disabled — quotation email + PDF only
  // const { url: publicUrl } = await ensureQuotationPublicToken(params.id, Quotation);

  const pdfBuffer = await generateQuotationPDF(outbound);

  const result = await sendQuotationEmail(outbound, pdfBuffer);

  // Record in DB
  await Quotation.findByIdAndUpdate(params.id, {
    status: "sent",
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: toEmail,
        subject: `Quotation ${quotation.quoteNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
