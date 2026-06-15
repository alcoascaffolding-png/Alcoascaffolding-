import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { Customer, DeliveryNote, SalesOrder } from "@/lib/mongoose-models";
import { QUOTATION_CUSTOMER_POPULATE_FIELDS } from "@/lib/load-quotation-for-pdf";

void Customer;
import { DELIVERY_NOTE_STATUS_VALUES } from "@/models/DeliveryNote";

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const doc = await DeliveryNote.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("salesOrder", "orderNumber status customerName deliveryDate")
    .populate("quotation", "quoteNumber status customerName")
    .lean();
  if (!doc) throw new AppError("Delivery Note not found", 404);
  return apiSuccess(doc);
});

export const PATCH = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const body = await request.json();
  const patch = { ...body };

  if (
    Object.prototype.hasOwnProperty.call(patch, "status") &&
    patch.status != null &&
    !DELIVERY_NOTE_STATUS_VALUES.includes(patch.status)
  ) {
    throw new AppError(`Invalid status "${patch.status}"`, 400);
  }

  if (Object.prototype.hasOwnProperty.call(body, "salesOrder")) {
    patch.salesOrder = toObjectId(body.salesOrder) ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "quotation")) {
    patch.quotation = toObjectId(body.quotation) ?? null;
  }

  delete patch.deliveryNoteNumber;
  delete patch.createdBy;

  let doc;
  try {
    doc = await DeliveryNote.findByIdAndUpdate(params.id, patch, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors || {})[0]?.message;
      throw new AppError(first || err.message || "Delivery note validation failed", 400);
    }
    throw err;
  }
  if (!doc) throw new AppError("Delivery Note not found", 404);

  const populated = await DeliveryNote.findById(doc._id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("salesOrder", "orderNumber status customerName deliveryDate")
    .populate("quotation", "quoteNumber status customerName")
    .lean();

  return apiSuccess(populated);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const doc = await DeliveryNote.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Delivery Note not found", 404);
  return apiSuccess({ deleted: true });
});
