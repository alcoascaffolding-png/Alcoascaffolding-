/**
 * Factory to create standard CRUD route handlers for a Mongoose model.
 * Usage in route.js:
 *   export const { GET, POST } = createListHandler(() => import("@/models/Product"), "product");
 *   export const { GET, PATCH, DELETE } = createDetailHandler(() => import("@/models/Product"), "product");
 */

import { auth } from "./auth";
import { connectDB } from "./db";
import { apiSuccess, apiError } from "./api-response";
import { withErrorHandler, AppError } from "./api-error";

/**
 * Creates GET (list) + POST (create) handlers
 */
export function createListHandlers(getModel, resourceName) {
  const GET = withErrorHandler(async (request) => {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const Model = (await getModel()).default;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const filter = {};
    if (searchParams.get("status")) filter.status = searchParams.get("status");
    if (searchParams.get("search")) {
      const rx = new RegExp(searchParams.get("search"), "i");
      filter.$or = [
        { name: rx },
        { companyName: rx },
        { description: rx },
        { itemCode: rx },
        { vendorCode: rx },
        { orderNumber: rx },
        { invoiceNumber: rx },
        { poNumber: rx },
      ].filter(Boolean);
    }

    const [items, total] = await Promise.all([
      Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Model.countDocuments(filter),
    ]);

    return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
  });

  const POST = withErrorHandler(async (request) => {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const Model = (await getModel()).default;
    const body = await request.json();

    const doc = await Model.create({ ...body, createdBy: session.user.id });
    return apiSuccess(doc, 201);
  });

  return { GET, POST };
}

/**
 * Creates GET (detail) + PATCH (update) + DELETE handlers
 */
export function createDetailHandlers(getModel, resourceName) {
  const GET = withErrorHandler(async (request, { params }) => {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const Model = (await getModel()).default;
    const doc = await Model.findById(params.id).lean();
    if (!doc) throw new AppError(`${resourceName} not found`, 404);
    return apiSuccess(doc);
  });

  const PATCH = withErrorHandler(async (request, { params }) => {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const Model = (await getModel()).default;
    const body = await request.json();

    const doc = await Model.findByIdAndUpdate(
      params.id,
      { ...body, lastModifiedBy: session.user.id },
      { new: true, runValidators: true }
    );
    if (!doc) throw new AppError(`${resourceName} not found`, 404);
    return apiSuccess(doc);
  });

  const DELETE = withErrorHandler(async (request, { params }) => {
    const session = await auth();
    if (!session?.user) return apiError("Unauthorized", 401);

    await connectDB();
    const Model = (await getModel()).default;
    const doc = await Model.findByIdAndDelete(params.id);
    if (!doc) throw new AppError(`${resourceName} not found`, 404);
    return apiSuccess({ deleted: true });
  });

  return { GET, PATCH, DELETE };
}

/**
 * Creates GET (stats) handler using aggregate
 */
export function createStatsHandler(getModel) {
  return {
    GET: withErrorHandler(async () => {
      const session = await auth();
      if (!session?.user) return apiError("Unauthorized", 401);

      await connectDB();
      const Model = (await getModel()).default;

      const stats = await Model.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
          },
        },
      ]);

      return apiSuccess(stats[0] || { total: 0 });
    }),
  };
}
