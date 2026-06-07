export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import DeliveryNote from "@/models/DeliveryNote";
import { generateDeliveryNotePDF } from "@/lib/pdf/delivery-note-pdf";
import {
  BlobAccessError,
  BlobClientTokenExpiredError,
  BlobStoreNotFoundError,
} from "@vercel/blob";
import { uploadToBlob, isBlobReadWriteTokenConfigured } from "@/lib/storage/blob";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import {
  isWhatsAppFeatureAvailable,
  isWhatsAppTwilioMode,
} from "@/lib/server-features";
import { buildWhatsAppDeliveryNoteBody } from "@/lib/quotation-brand";

function isLocalTextOnlyWhatsAppMode() {
  return (
    process.env.NODE_ENV === "development" &&
    !process.env.VERCEL &&
    process.env.WHATSAPP_LOCAL_TEXT_ONLY === "true"
  );
}

function toWaMeDigits(phone) {
  return String(phone).replace(/\D/g, "");
}

async function uploadDeliveryNotePdfToBlob(note) {
  const pdfBuffer = await generateDeliveryNotePDF(note);
  try {
    const uploaded = await uploadToBlob(
      pdfBuffer,
      `delivery-notes/${note.deliveryNoteNumber}.pdf`
    );
    return uploaded.url;
  } catch (err) {
    if (err instanceof BlobStoreNotFoundError) {
      throw new AppError("Vercel Blob store not found. Configure BLOB_READ_WRITE_TOKEN.", 503);
    }
    if (err instanceof BlobAccessError) {
      throw new AppError("Vercel Blob denied access. Use a read-write token.", 503);
    }
    if (err instanceof BlobClientTokenExpiredError) {
      throw new AppError("Vercel Blob token expired. Update BLOB_READ_WRITE_TOKEN.", 503);
    }
    throw err;
  }
}

export const POST = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const routeParams =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  const noteId = routeParams?.id;
  if (!noteId) return apiError("Missing id", 400);

  const useTwilio = isWhatsAppTwilioMode();
  const localTextOnly = isLocalTextOnlyWhatsAppMode();
  const twilioReady =
    !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN;

  if (!isWhatsAppFeatureAvailable() && !(useTwilio && localTextOnly && twilioReady)) {
    return apiError(
      "WhatsApp is not available. Configure FEATURES=whatsapp (or SERVER_FEATURES), BLOB_READ_WRITE_TOKEN, and Twilio if using Twilio mode.",
      503
    );
  }

  await connectDB();
  const note = await DeliveryNote.findById(noteId)
    .populate("salesOrder", "orderNumber")
    .lean();
  if (!note) throw new AppError("Delivery Note not found", 404);

  const body = await request.json().catch(() => ({}));
  const toPhone = body.phone || note.customerPhone || note.contactPersonPhone;
  if (!toPhone) throw new AppError("No phone number specified", 400);

  if (useTwilio) {
    if (!twilioReady) {
      throw new AppError(
        "WhatsApp Twilio mode is on but Twilio is not configured.",
        503
      );
    }

    if (localTextOnly) {
      const message = buildWhatsAppDeliveryNoteBody(note, {
        attachmentLine: false,
        devNoPdfNote:
          "(Local dev: PDF not attached — remove WHATSAPP_LOCAL_TEXT_ONLY and set BLOB_READ_WRITE_TOKEN for full flow.)",
      });
      const result = await sendWhatsAppMessage(toPhone, message, null);
      await recordWhatsAppSent(noteId, toPhone, result.sid);
      return apiSuccess({
        mode: "twilio",
        sent: true,
        sid: result.sid,
        pdfUrl: null,
        devTextOnly: true,
      });
    }

    if (!isBlobReadWriteTokenConfigured()) {
      throw new AppError("WhatsApp needs Vercel Blob for the PDF attachment.", 503);
    }

    const pdfUrl = await uploadDeliveryNotePdfToBlob(note);
    const message = buildWhatsAppDeliveryNoteBody(note);
    const result = await sendWhatsAppMessage(toPhone, message, pdfUrl);
    await recordWhatsAppSent(noteId, toPhone, result.sid);
    return apiSuccess({ mode: "twilio", sent: true, sid: result.sid, pdfUrl });
  }

  if (!isBlobReadWriteTokenConfigured()) {
    throw new AppError("wa.me mode requires Vercel Blob.", 503);
  }

  const phoneDigits = toWaMeDigits(toPhone);
  if (phoneDigits.length < 8) {
    throw new AppError("Invalid phone number for WhatsApp.", 400);
  }

  const pdfUrl = await uploadDeliveryNotePdfToBlob(note);
  const textBody = `${buildWhatsAppDeliveryNoteBody(note, {
    attachmentLine: false,
  })}\n\nDownload (PDF):\n${pdfUrl}`;
  const waMeUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(textBody)}`;

  await recordWhatsAppSent(noteId, toPhone, "wa-me");
  return apiSuccess({ mode: "wa_me", sent: true, waMeUrl, pdfUrl });
});

async function recordWhatsAppSent(noteId, toPhone, messageSid) {
  await DeliveryNote.findByIdAndUpdate(noteId, {
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
