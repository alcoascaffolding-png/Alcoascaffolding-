import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { createStockAdjustment } from "@/lib/stock-service";
import { logAudit } from "@/lib/audit-log";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";
import { assertValidCategory } from "@/lib/category-service";
import Quotation from "@/models/Quotation";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import DeliveryNote from "@/models/DeliveryNote";
import PurchaseOrder from "@/models/PurchaseOrder";
import PurchaseInvoice from "@/models/PurchaseInvoice";

/** Transactional documents that reference a product via their `items[].product`. */
const PRODUCT_REFERENCE_SOURCES = [
  [Quotation, "quotation"],
  [SalesOrder, "sales order"],
  [SalesInvoice, "sales invoice"],
  [DeliveryNote, "delivery note"],
  [PurchaseOrder, "purchase order"],
  [PurchaseInvoice, "purchase invoice"],
];

async function findProductReferences(productId) {
  const results = await Promise.all(
    PRODUCT_REFERENCE_SOURCES.map(async ([Model, label]) => {
      const count = await Model.countDocuments({ "items.product": productId });
      return { label, count };
    })
  );
  return results.filter((r) => r.count > 0);
}

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

const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await authorizeApi("products", "delete");
  await connectDB();
  const Product = (await import("@/models/Product")).default;

  const existing = await Product.findById(params.id);
  if (!existing) throw new AppError("Product not found", 404);

  const references = await findProductReferences(params.id);
  if (references.length) {
    const detail = references
      .map((r) => `${r.count} ${r.label}${r.count === 1 ? "" : "s"}`)
      .join(", ");
    throw new AppError(
      `Cannot delete "${existing.name}": it is referenced by ${detail}. Deactivate the product instead to hide it from pickers while preserving history.`,
      400
    );
  }

  await existing.deleteOne();

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "delete",
    resource: "products",
    resourceId: existing._id,
    summary: `delete Product ${existing._id}`,
  });

  return apiSuccess({ deleted: true });
});

export { GET, PATCH, DELETE };
