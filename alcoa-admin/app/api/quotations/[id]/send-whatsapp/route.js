export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";
import { uploadToBlob } from "@/lib/storage/blob";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { isWhatsAppFeatureAvailable } from "@/lib/server-features";

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  if (!isWhatsAppFeatureAvailable()) {
    return apiError(
      "WhatsApp is not available. Add FEATURES=whatsapp (or SERVER_FEATURES) in Vercel, or set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and BLOB_READ_WRITE_TOKEN.",
      503
    );
  }

  await connectDB();
  const quotation = await Quotation.findById(params.id).lean();
  if (!quotation) throw new AppError("Quotation not found", 404);

  const body = await request.json().catch(() => ({}));
  const toPhone = body.phone || quotation.customerPhone;
  if (!toPhone) throw new AppError("No phone number specified", 400);
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new AppError(
      "WhatsApp is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local.",
      503
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new AppError(
      "WhatsApp PDF attachment requires BLOB_READ_WRITE_TOKEN in .env.local.",
      503
    );
  }

  // Generate PDF and upload to Blob so Twilio can send media attachment.
  const pdfBuffer = await generateQuotationPDF(quotation);
  const uploaded = await uploadToBlob(pdfBuffer, `${quotation.quoteNumber}.pdf`);
  const pdfUrl = uploaded.url;

  // Build WhatsApp message
  const message = [
    `*Quotation ${quotation.quoteNumber}* from Alcoa Aluminium Scaffolding`,
    `Dear ${quotation.customerName},`,
    `Please find your quotation attached.`,
    `Total: AED ${quotation.totalAmount?.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`,
    `Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`,
    `\nFor any queries, please contact us.`,
  ].join("\n");

  const result = await sendWhatsAppMessage(toPhone, message, pdfUrl);

  // Record in DB
  await Quotation.findByIdAndUpdate(params.id, {
    status: "sent",
    sentDate: new Date(),
    $push: {
      whatsappSent: {
        sentAt: new Date(),
        sentTo: toPhone,
        messageSid: result.sid,
        status: "sent",
      },
    },
  });

  return apiSuccess({ sent: true, sid: result.sid, pdfUrl });
});
