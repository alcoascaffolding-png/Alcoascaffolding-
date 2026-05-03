export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";
import { generateQuotationPDF } from "@/lib/pdf/quotation-pdf";
import {
  BlobAccessError,
  BlobClientTokenExpiredError,
  BlobStoreNotFoundError,
} from "@vercel/blob";
import { uploadToBlob, isBlobReadWriteTokenConfigured } from "@/lib/storage/blob";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { isWhatsAppFeatureAvailable } from "@/lib/server-features";
import { buildWhatsAppQuotationBody } from "@/lib/quotation-brand";

/** Local dev only: send WhatsApp text without PDF/Blob (Twilio cannot use localhost PDF URLs). */
function isLocalTextOnlyWhatsAppMode() {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    process.env.WHATSAPP_LOCAL_TEXT_ONLY === "true"
  );
}

export const POST = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const quotationId = routeParams?.id;
  if (!quotationId) return apiError("Missing quotation id", 400);

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
  const quotation = await Quotation.findById(quotationId).lean();
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

  let pdfUrl = null;
  let devTextOnly = false;

  if (localTextOnly) {
    devTextOnly = true;
    const message = buildWhatsAppQuotationBody(quotation, {
      attachmentLine: false,
      devNoPdfNote:
        "(Local dev: PDF not attached — remove WHATSAPP_LOCAL_TEXT_ONLY and set BLOB_READ_WRITE_TOKEN for full flow.)",
    });
    const result = await sendWhatsAppMessage(toPhone, message, null);
    await recordWhatsAppSent(quotationId, toPhone, result.sid);
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
    if (err instanceof BlobStoreNotFoundError) {
      throw new AppError(
        "Vercel Blob could not find the store for this token. Use the same Vercel project as this deployment: Storage → Blob → your store → .env.local tab → copy the read-write value into BLOB_READ_WRITE_TOKEN (it must start with vercel_blob_rw_). Remove duplicate or old blob env vars, then redeploy.",
        503
      );
    }
    if (err instanceof BlobAccessError) {
      throw new AppError(
        "Vercel Blob denied access. Regenerate a read-write token from Storage → Blob → .env.local (not a read-only token) and set BLOB_READ_WRITE_TOKEN.",
        503
      );
    }
    if (err instanceof BlobClientTokenExpiredError) {
      throw new AppError(
        "Vercel Blob token expired. Create a new read-write token from Storage → Blob and update BLOB_READ_WRITE_TOKEN.",
        503
      );
    }
    const m = err?.message || "";
    if (m.includes("store does not exist") || m.includes("Vercel Blob")) {
      throw new AppError(
        "Vercel Blob rejected the upload (invalid token or wrong project). Open this deployment’s Vercel project → Storage → Blob → .env.local tab, copy BLOB_READ_WRITE_TOKEN (vercel_blob_rw_…), save env, redeploy.",
        503
      );
    }
    throw err;
  }
  pdfUrl = uploaded.url;

  const message = buildWhatsAppQuotationBody(quotation);

  const result = await sendWhatsAppMessage(toPhone, message, pdfUrl);
  await recordWhatsAppSent(quotationId, toPhone, result.sid);
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
