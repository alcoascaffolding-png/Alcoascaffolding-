import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { assertValidCategory } from "@/lib/category-service";
import Vendor from "@/models/Vendor";

export const GET = withErrorHandler(async (request, { params }) => {
  await authorizeApi("vendors", "read");
  await connectDB();
  const doc = await Vendor.findById(params.id).lean();
  if (!doc) throw new AppError("Vendor not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("vendors", "write");
  await connectDB();

  const body = sanitizeMongoDocument(await request.json());
  const payload = { ...body };

  if (payload.category != null) {
    payload.category = await assertValidCategory("vendor", payload.category);
  }

  const doc = await Vendor.findByIdAndUpdate(params.id, payload, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new AppError("Vendor not found", 404);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "update",
    resource: "vendors",
    resourceId: doc._id,
    summary: `Updated vendor ${doc.vendorCode}`,
  });

  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("vendors", "delete");
  await connectDB();

  const doc = await Vendor.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Vendor not found", 404);

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "delete",
    resource: "vendors",
    resourceId: params.id,
    summary: `Deleted vendor ${doc.vendorCode}`,
  });

  return apiSuccess({ deleted: true });
});
