export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";
import { sendQuotationEmail } from "@/lib/email/resend";

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const quotation = await Quotation.findById(params.id).lean();
  if (!quotation) throw new AppError("Quotation not found", 404);
  if (!quotation.customerEmail) throw new AppError("Quotation has no customer email", 400);

  // Generate PDF
  const pdfBuffer = await generateQuotationPDF(quotation);

  // Send via Resend with attachment
  const result = await sendQuotationEmail(quotation, pdfBuffer);

  // Record in DB
  await Quotation.findByIdAndUpdate(params.id, {
    status: "sent",
    sentDate: new Date(),
    $push: {
      emailsSent: {
        sentAt: new Date(),
        sentTo: quotation.customerEmail,
        subject: `Quotation ${quotation.quoteNumber}`,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, messageId: result.messageId });
});
