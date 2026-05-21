import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const runtime = "nodejs";

const TERMINAL = new Set(["approved", "rejected", "converted"]);

export const POST = withErrorHandler(async (request, { params }) => {
  await connectDB();
  const { token } = params;

  const doc = await Quotation.findOne({ publicToken: token });
  if (!doc) throw new AppError("Quotation not found", 404);

  if (TERMINAL.has(doc.status)) {
    return apiSuccess({ alreadyDecided: true, status: doc.status });
  }
  if (doc.validUntil && new Date(doc.validUntil) < new Date()) {
    throw new AppError("This quotation has expired and cannot be accepted online.", 400);
  }

  doc.status = "approved";
  await doc.save();
  return apiSuccess({ status: doc.status });
});
