import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import Category from "@/models/Category";
import {
  buildCategoryPayload,
  categoryNameKey,
  countCategoryUsage,
  normalizeCategoryName,
} from "@/lib/category-service";

export const GET = withErrorHandler(async (request, { params }) => {
  await authorizeApi("categories", "read");
  await connectDB();

  const doc = await Category.findById(params.id).lean();
  if (!doc) throw new AppError("Category not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("categories", "write");
  await connectDB();

  const existing = await Category.findById(params.id);
  if (!existing) throw new AppError("Category not found", 404);

  const body = sanitizeMongoDocument(await request.json());
  const patch = {};

  if (body.name != null) {
    const name = normalizeCategoryName(body.name);
    if (!name) throw new AppError("Category name is required", 400);
    patch.name = name;
    patch.nameKey = categoryNameKey(name);
  }
  if (body.sortOrder != null) {
    patch.sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  }
  if (body.isActive != null) patch.isActive = !!body.isActive;
  if (body.description != null) patch.description = body.description?.trim() || undefined;

  if (patch.name && patch.name !== existing.name) {
    const usage = await countCategoryUsage(existing.type, existing.name);
    if (usage > 0) {
      throw new AppError(
        `Cannot rename: ${usage} ${existing.type === "vendor" ? "vendor(s)" : "product(s)"} use this category. Deactivate it instead or reassign those records first.`,
        400
      );
    }
  }

  const doc = await Category.findByIdAndUpdate(params.id, patch, {
    new: true,
    runValidators: true,
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "update",
    resource: "categories",
    resourceId: doc._id,
    summary: `Updated category "${doc.name}"`,
  });

  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("categories", "delete");
  await connectDB();

  const existing = await Category.findById(params.id);
  if (!existing) throw new AppError("Category not found", 404);

  const usage = await countCategoryUsage(existing.type, existing.name);
  if (usage > 0) {
    throw new AppError(
      `Cannot delete "${existing.name}": ${usage} ${existing.type === "vendor" ? "vendor(s)" : "product(s)"} still use it. Deactivate the category or reassign those records first.`,
      400
    );
  }

  await Category.deleteOne({ _id: params.id });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "delete",
    resource: "categories",
    resourceId: params.id,
    summary: `Deleted category "${existing.name}"`,
  });

  return apiSuccess({ deleted: true });
});
