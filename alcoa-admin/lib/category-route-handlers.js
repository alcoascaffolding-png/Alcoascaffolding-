import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { buildRegexSearchFilter } from "@/lib/search-utils";
import Category from "@/models/Category";
import {
  buildCategoryPayload,
  categoryNameKey,
  countCategoryUsage,
  ensureDefaultCategories,
  normalizeCategoryName,
} from "@/lib/category-service";

/**
 * Category CRUD scoped to a module (products → Inventory, vendors → Purchases).
 * @param {"product"|"vendor"} fixedType
 * @param {"products"|"vendors"} permissionResource
 */
export function createModuleCategoryHandlers(fixedType, permissionResource) {
  const GET = withErrorHandler(async (request) => {
    await authorizeApi(permissionResource, "read");
    await connectDB();
    await ensureDefaultCategories(fixedType);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
    const skip = (page - 1) * limit;

    const filter = { type: fixedType };
    if (searchParams.get("active") === "true") filter.isActive = true;
    if (searchParams.get("active") === "false") filter.isActive = false;

    const searchFilter = buildRegexSearchFilter(searchParams.get("search"), ["name", "description"]);
    if (searchFilter) Object.assign(filter, searchFilter);

    const [items, total] = await Promise.all([
      Category.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(filter),
    ]);

    return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
  });

  const POST = withErrorHandler(async (request) => {
    const session = await authorizeApi(permissionResource, "write");
    await connectDB();

    const body = sanitizeMongoDocument(await request.json());
    const payload = buildCategoryPayload({ ...body, type: fixedType });
    const doc = await Category.create({ ...payload, createdBy: session.user.id });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      action: "create",
      resource: permissionResource,
      resourceId: doc._id,
      summary: `Created ${fixedType} category "${doc.name}"`,
    });

    return apiSuccess(doc, 201);
  });

  const GET_BY_ID = withErrorHandler(async (request, { params }) => {
    await authorizeApi(permissionResource, "read");
    await connectDB();

    const doc = await Category.findOne({ _id: params.id, type: fixedType }).lean();
    if (!doc) throw new AppError("Category not found", 404);
    return apiSuccess(doc);
  });

  const PATCH = withErrorHandler(async (request, { params }) => {
    const session = await authorizeApi(permissionResource, "write");
    await connectDB();

    const existing = await Category.findOne({ _id: params.id, type: fixedType });
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
      const usage = await countCategoryUsage(fixedType, existing.name);
      if (usage > 0) {
        throw new AppError(
          `Cannot rename: ${usage} record(s) use this category. Deactivate it instead or reassign those records first.`,
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
      resource: permissionResource,
      resourceId: doc._id,
      summary: `Updated category "${doc.name}"`,
    });

    return apiSuccess(doc);
  });

  const DELETE = withErrorHandler(async (request, { params }) => {
    const session = await authorizeApi(permissionResource, "delete");
    await connectDB();

    const existing = await Category.findOne({ _id: params.id, type: fixedType });
    if (!existing) throw new AppError("Category not found", 404);

    const usage = await countCategoryUsage(fixedType, existing.name);
    if (usage > 0) {
      throw new AppError(
        `Cannot delete "${existing.name}": ${usage} record(s) still use it. Deactivate the category or reassign those records first.`,
        400
      );
    }

    await Category.deleteOne({ _id: params.id });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email,
      action: "delete",
      resource: permissionResource,
      resourceId: params.id,
      summary: `Deleted category "${existing.name}"`,
    });

    return apiSuccess({ deleted: true });
  });

  const STATS = withErrorHandler(async () => {
    await authorizeApi(permissionResource, "read");
    await connectDB();
    await ensureDefaultCategories(fixedType);

    const [total, active] = await Promise.all([
      Category.countDocuments({ type: fixedType }),
      Category.countDocuments({ type: fixedType, isActive: true }),
    ]);

    return apiSuccess({ total, active, inactive: total - active });
  });

  return { GET, POST, GET_BY_ID, PATCH, DELETE, STATS };
}
