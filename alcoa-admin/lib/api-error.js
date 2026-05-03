import { apiError } from "./api-response";

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * Wraps a route handler function with standard error handling.
 * Usage: export const GET = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler(handler) {
  return async function (request, context) {
    try {
      // Next.js 15+ makes params a Promise — resolve it before passing to handler
      if (context?.params && typeof context.params.then === "function") {
        context = { ...context, params: await context.params };
      }
      return await handler(request, context);
    } catch (err) {
      console.error("[Route Error]", err);

      if (err instanceof AppError) {
        return apiError(err.message, err.statusCode, err.details);
      }

      // Mongoose validation errors
      if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map((e) => e.message);
        return apiError("Validation failed", 400, details);
      }

      // Mongoose duplicate key
      if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return apiError(`${field || "Field"} already exists`, 409);
      }

      // Mongoose cast error (bad ObjectId)
      if (err.name === "CastError") {
        return apiError(`Invalid ${err.path}: ${err.value}`, 400);
      }

      const msg = typeof err?.message === "string" ? err.message : "";
      if (msg.includes("RESEND_API_KEY")) {
        return apiError(
          "Email is not configured. Add RESEND_API_KEY (and RESEND_FROM_EMAIL if needed) in your deployment environment.",
          503
        );
      }
      if (
        msg.includes("Chromium not available") ||
        msg.includes("Chromium not found for PDF") ||
        msg.includes("@sparticuz/chromium-min executablePath failed")
      ) {
        return apiError(
          "PDF generation is not available on this server. On Vercel, set CHROMIUM_TAR_URL if the default Chromium pack fails, or see deployment docs.",
          503
        );
      }

      if (
        msg.includes("Vercel Blob") ||
        msg.includes("store does not exist") ||
        msg.includes("BLOB_READ_WRITE_TOKEN")
      ) {
        return apiError(
          "Vercel Blob storage is missing or invalid. In this same Vercel project, open Storage → Blob, ensure a store exists, then create a new read/write token and set BLOB_READ_WRITE_TOKEN (old tokens break if the store was deleted or belongs to another team).",
          503
        );
      }

      // Twilio REST errors (invalid number, unverified trial destination, auth, etc.)
      if (
        err.name === "RestException" ||
        msg.includes("Twilio") ||
        msg.includes("twilio") ||
        msg.includes("Authenticate")
      ) {
        const status =
          typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 502;
        return apiError(msg || "Messaging provider error", status);
      }

      if (msg.includes("Twilio credentials not configured")) {
        return apiError(
          "Twilio is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment.",
          503
        );
      }

      if (
        msg.includes("invalid username") ||
        msg.includes("Authentication Error") ||
        msg.includes("20003")
      ) {
        return apiError(
          "Twilio rejected the credentials (wrong Account SID or Auth Token). In Twilio Console → Account, copy Account SID (starts with AC) and Auth Token into TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN with no extra spaces or quotes.",
          401
        );
      }

      // Local development: surface real message so API failures are debuggable
      if (process.env.NODE_ENV === "development" && msg) {
        return apiError(`Internal server error: ${msg}`, 500, err.name ? { name: err.name } : null);
      }

      return apiError("Internal server error", 500);
    }
  };
}
