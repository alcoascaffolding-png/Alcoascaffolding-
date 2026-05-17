import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { applyQuotationPatch } from "@/lib/quotation-save";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const q = await Quotation.findById(params.id).populate("customer", "companyName primaryEmail primaryPhone").lean();
  if (!q) throw new AppError("Quotation not found", 404);
  return apiSuccess(q);
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const doc = await Quotation.findById(params.id);
  if (!doc) throw new AppError("Quotation not found", 404);

  applyQuotationPatch(doc, body);
  doc.lastModifiedBy = session.user.id;
  await doc.save();

  const q = await Quotation.findById(params.id).populate("customer", "companyName primaryEmail primaryPhone").lean();
  return apiSuccess(q);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const q = await Quotation.findByIdAndDelete(params.id);
  if (!q) throw new AppError("Quotation not found", 404);
  return apiSuccess({ deleted: true });
});
