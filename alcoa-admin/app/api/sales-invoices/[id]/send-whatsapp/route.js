export const runtime = "nodejs";
export const maxDuration = 60;

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import SalesInvoice from "@/models/SalesInvoice";
import { loadSalesInvoiceForPdf } from "@/lib/load-sales-invoice-for-pdf";
import { generateSalesInvoicePDF } from "@/lib/pdf/sales-document-pdf";
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
import { buildWhatsAppSalesInvoiceBody } from "@/lib/quotation-brand";

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

async function uploadSalesInvoicePdfToBlob(invoice) {
  const pdfBuffer = await generateSalesInvoicePDF(invoice);
  try {
    const uploaded = await uploadToBlob(
      pdfBuffer,
      `sales-invoices/${invoice.invoiceNumber}.pdf`
    );
    return uploaded.url;
  } catch (err) {
    if (err instanceof BlobStoreNotFoundError) {
      throw new AppError(
        "Vercel Blob could not find the store for this token. Configure BLOB_READ_WRITE_TOKEN for this deployment.",
        503
      );
    }
    if (err instanceof BlobAccessError) {
      throw new AppError(
        "Vercel Blob denied access. Use a read-write token for BLOB_READ_WRITE_TOKEN.",
        503
      );
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
  const invoiceId = routeParams?.id;
  if (!invoiceId) return apiError("Missing id", 400);

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
  const invoice = await loadSalesInvoiceForPdf(invoiceId);
  if (!invoice) throw new AppError("Tax Invoice not found", 404);

  const body = await request.json().catch(() => ({}));
  const toPhone = body.phone || invoice.customerPhone;
  if (!toPhone) throw new AppError("No phone number specified", 400);

  if (useTwilio) {
    if (!twilioReady) {
      throw new AppError(
        "WhatsApp Twilio mode is on but Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN, or set WHATSAPP_USE_TWILIO=false.",
        503
      );
    }

    if (localTextOnly) {
      const message = buildWhatsAppSalesInvoiceBody(invoice, {
        attachmentLine: false,
        devNoPdfNote:
          "(Local dev: PDF not attached — remove WHATSAPP_LOCAL_TEXT_ONLY and set BLOB_READ_WRITE_TOKEN for full flow.)",
      });
      const result = await sendWhatsAppMessage(toPhone, message, null);
      await recordWhatsAppSent(invoiceId, toPhone, result.sid);
      return apiSuccess({
        mode: "twilio",
        sent: true,
        sid: result.sid,
        pdfUrl: null,
        devTextOnly: true,
      });
    }

    if (!isBlobReadWriteTokenConfigured()) {
      throw new AppError(
        "WhatsApp needs Vercel Blob for the PDF attachment. Set BLOB_READ_WRITE_TOKEN.",
        503
      );
    }

    const pdfUrl = await uploadSalesInvoicePdfToBlob(invoice);
    const message = buildWhatsAppSalesInvoiceBody(invoice);
    const result = await sendWhatsAppMessage(toPhone, message, pdfUrl);
    await recordWhatsAppSent(invoiceId, toPhone, result.sid);
    return apiSuccess({ mode: "twilio", sent: true, sid: result.sid, pdfUrl });
  }

  if (!isBlobReadWriteTokenConfigured()) {
    throw new AppError(
      "wa.me mode requires Vercel Blob. Set BLOB_READ_WRITE_TOKEN.",
      503
    );
  }

  const phoneDigits = toWaMeDigits(toPhone);
  if (phoneDigits.length < 8) {
    throw new AppError(
      "Invalid phone number for WhatsApp. Use a full international number with country code.",
      400
    );
  }

  const pdfUrl = await uploadSalesInvoicePdfToBlob(invoice);
  const textBody = `${buildWhatsAppSalesInvoiceBody(invoice, {
    attachmentLine: false,
  })}\n\nDownload (PDF):\n${pdfUrl}`;
  const waMeUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(textBody)}`;

  await recordWhatsAppSent(invoiceId, toPhone, "wa-me");
  return apiSuccess({ mode: "wa_me", sent: true, waMeUrl, pdfUrl });
});

async function recordWhatsAppSent(invoiceId, toPhone, messageSid) {
  await SalesInvoice.findByIdAndUpdate(invoiceId, {
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
