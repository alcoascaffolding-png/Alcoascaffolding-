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
  ensureDefaultCategories,
} from "@/lib/category-service";

export const GET = withErrorHandler(async (request) => {
  await authorizeApi("categories", "read");
  await connectDB();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  if (type === "product" || type === "vendor") {
    await ensureDefaultCategories(type);
  } else {
    await Promise.all([ensureDefaultCategories("product"), ensureDefaultCategories("vendor")]);
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (type === "product" || type === "vendor") filter.type = type;
  if (searchParams.get("active") === "true") filter.isActive = true;
  if (searchParams.get("active") === "false") filter.isActive = false;

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), ["name", "description"]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ type: 1, sortOrder: 1, name: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("categories", "write");
  await connectDB();

  const body = sanitizeMongoDocument(await request.json());
  if (body.type !== "product" && body.type !== "vendor") {
    throw new AppError('Category type must be "product" or "vendor"', 400);
  }

  const payload = buildCategoryPayload(body);
  const doc = await Category.create({ ...payload, createdBy: session.user.id });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "categories",
    resourceId: doc._id,
    summary: `Created ${doc.type} category "${doc.name}"`,
  });

  return apiSuccess(doc, 201);
});
