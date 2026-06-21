import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { createListHandlers } from "@/lib/crud-factory";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import Vendor from "@/models/Vendor";
import PurchaseOrder from "@/models/PurchaseOrder";
import {
  generatePONumber,
  recalculatePurchaseTotals,
  syncPurchaseOrderReceived,
} from "@/lib/purchase-service";

const { GET } = createListHandlers(() => import("@/models/PurchaseOrder"), "Purchase Order", "purchase-orders");

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("purchase-orders", "write");
  await connectDB();
  const body = await request.json();

  if (!body.vendorName?.trim()) throw new AppError("Vendor name is required", 400);

  const vendorId = toObjectId(body.vendor);
  if (vendorId) {
    const vendor = await Vendor.findById(vendorId).lean();
    if (!vendor) throw new AppError("Vendor not found", 404);
  }

  const { items, subtotal, vatAmount, total } = recalculatePurchaseTotals(body.items);
  if (!items.length) throw new AppError("At least one line item is required", 400);

  const doc = await PurchaseOrder.create({
    poNumber: body.poNumber?.trim() || (await generatePONumber(body.orderDate)),
    vendor: vendorId,
    vendorName: body.vendorName.trim(),
    orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
    deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
    status: body.status || "draft",
    items,
    subtotal,
    vatAmount,
    total,
    currency: body.currency || "AED",
    notes: body.notes,
    createdBy: session.user.id,
  });

  if (doc.status === "received") {
    await syncPurchaseOrderReceived(
      doc,
      { status: "draft", stockApplied: false, items: [] },
      session.user.id
    );
  }

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "purchase-orders",
    resourceId: doc._id,
    summary: `Created PO ${doc.poNumber}`,
  });

  return apiSuccess(doc, 201);});

export { GET, POST };
