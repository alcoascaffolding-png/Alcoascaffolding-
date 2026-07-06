import { createDetailHandlers } from "@/lib/crud-factory";
import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { createStockAdjustment } from "@/lib/stock-service";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { assertValidCategory } from "@/lib/category-service";

const { DELETE } = createDetailHandlers(() => import("@/models/Product"), "Product", "products");

const GET = withErrorHandler(async (request, { params }) => {
  await authorizeApi("products", "read");
  await connectDB();
  const Product = (await import("@/models/Product")).default;
  await import("@/models/Vendor"); // register Vendor ref for populate
  const doc = await Product.findById(params.id)
    .populate("preferredVendor", "vendorCode companyName")
    .lean();
  if (!doc) throw new AppError("Product not found", 404);
  return apiSuccess(doc);
});

const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("products", "write");
  await connectDB();
  const Product = (await import("@/models/Product")).default;
  const body = sanitizeMongoDocument(await request.json());

  const existing = await Product.findById(params.id);
  if (!existing) throw new AppError("Product not found", 404);

  const payload = { ...body };
  const prevStock = Number(existing.currentStock) || 0;

  if (Object.prototype.hasOwnProperty.call(payload, "preferredVendor")) {
    const v = payload.preferredVendor;
    payload.preferredVendor =
      v == null || v === "" || v === "__none__" ? null : v;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "category")) {
    payload.category = payload.category
      ? await assertValidCategory("product", payload.category, { allowEmpty: true })
      : undefined;
  }

  if (
    payload.currentStock !== undefined &&
    Number(payload.currentStock) !== prevStock
  ) {
    const newStock = Math.max(0, Number(payload.currentStock));
    await createStockAdjustment({
      productId: params.id,
      adjustmentType: "correction",
      correctionNewStock: newStock,
      reason: "Manual stock correction via product form",
      notes: `Stock changed from ${prevStock} to ${newStock}`,
      userId: session.user.id,
      sourceType: "product_edit",
      sourceId: String(params.id),
      sourceNumber: existing.itemCode,
    });
    delete payload.currentStock;
  }

  const doc = await Product.findByIdAndUpdate(
    params.id,
    { ...payload, lastModifiedBy: session.user.id },
    { new: true, runValidators: true }
  );

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "update",
    resource: "products",
    resourceId: doc._id,
    summary: `update Product ${doc._id}`,
    metadata:
      body.currentStock !== undefined
        ? { field: "currentStock", from: prevStock, to: doc.currentStock }
        : undefined,
  });

  return apiSuccess(doc);
});

export { GET, PATCH, DELETE };
