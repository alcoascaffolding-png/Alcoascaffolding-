export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";
import { uploadToBlob, isBlobReadWriteTokenConfigured } from "@/lib/storage/blob";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { isWhatsAppFeatureAvailable } from "@/lib/server-features";

/** Local dev only: send WhatsApp text without PDF/Blob (Twilio cannot use localhost PDF URLs). */
function isLocalTextOnlyWhatsAppMode() {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    process.env.WHATSAPP_LOCAL_TEXT_ONLY === "true"
  );
}

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const localTextOnly = isLocalTextOnlyWhatsAppMode();
  const twilioReady =
    !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN;

  if (!isWhatsAppFeatureAvailable() && !(localTextOnly && twilioReady)) {
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

  if (!twilioReady) {
    throw new AppError(
      "WhatsApp is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your deployment environment (Vercel → Environment Variables).",
      503
    );
  }

  const baseLines = [
    `*Quotation ${quotation.quoteNumber}* from Alcoa Aluminium Scaffolding`,
    `Dear ${quotation.customerName},`,
    `Total: AED ${quotation.totalAmount?.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`,
    `Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`,
    `\nFor any queries, please contact us.`,
  ];

  let pdfUrl = null;
  let devTextOnly = false;

  if (localTextOnly) {
    devTextOnly = true;
    baseLines.splice(2, 0, "(Local dev: PDF not attached — remove WHATSAPP_LOCAL_TEXT_ONLY and set BLOB_READ_WRITE_TOKEN for full flow.)");
    const message = baseLines.join("\n");
    const result = await sendWhatsAppMessage(toPhone, message, null);
    await recordWhatsAppSent(params.id, toPhone, result.sid);
    return apiSuccess({ sent: true, sid: result.sid, pdfUrl: null, devTextOnly: true });
  }

  if (!isBlobReadWriteTokenConfigured()) {
    throw new AppError(
      "WhatsApp needs Vercel Blob for the PDF attachment. Set BLOB_READ_WRITE_TOKEN in .env.local (copy from Vercel → Storage → Blob, or run vercel env pull). For quick local tests without Blob, set WHATSAPP_LOCAL_TEXT_ONLY=true in .env.local.",
      503
    );
  }

  const pdfBuffer = await generateQuotationPDF(quotation);
  let uploaded;
  try {
    uploaded = await uploadToBlob(pdfBuffer, `${quotation.quoteNumber}.pdf`);
  } catch (err) {
    const m = err?.message || "";
    if (m.includes("store does not exist") || m.includes("Vercel Blob")) {
      throw new AppError(
        "Vercel Blob rejected the upload (invalid or expired token, or the Blob store was removed). Open Vercel → this project → Storage → Blob and create a new read/write token, then update BLOB_READ_WRITE_TOKEN in .env.local.",
        503
      );
    }
    throw err;
  }
  pdfUrl = uploaded.url;

  const message = [
    `*Quotation ${quotation.quoteNumber}* from Alcoa Aluminium Scaffolding`,
    `Dear ${quotation.customerName},`,
    `Please find your quotation attached.`,
    `Total: AED ${quotation.totalAmount?.toLocaleString("en-AE", { minimumFractionDigits: 2 })}`,
    `Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`,
    `\nFor any queries, please contact us.`,
  ].join("\n");

  const result = await sendWhatsAppMessage(toPhone, message, pdfUrl);
  await recordWhatsAppSent(params.id, toPhone, result.sid);
  return apiSuccess({ sent: true, sid: result.sid, pdfUrl });
});

async function recordWhatsAppSent(quotationId, toPhone, messageSid) {
  await Quotation.findByIdAndUpdate(quotationId, {
    status: "sent",
    sentDate: new Date(),
    $push: {
      whatsappSent: {
        sentAt: new Date(),
        sentTo: toPhone,
        messageSid,
        status: "sent",
      },
    },
  });
}
