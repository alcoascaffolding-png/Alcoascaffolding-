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

      return apiError("Internal server error", 500);
    }
  };
}
