import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { SalesInvoice, SalesOrder, Quotation } from "@/lib/mongoose-models";

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
  const doc = await SalesInvoice.findById(params.id)
    .populate("customer", "companyName addresses primaryPhone primaryEmail vatRegistrationNumber")
    .populate("salesOrder", "orderNumber status customerName total")
    .lean();
  if (!doc) throw new AppError("Tax Invoice not found", 404);
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
  if (Object.prototype.hasOwnProperty.call(body, "salesOrder")) {
    const sid = toObjectId(body.salesOrder);
    patch.salesOrder = sid ?? null;
    if (sid) {
      const o = await SalesOrder.findById(sid)
        .select("orderNumber quotation")
        .populate("quotation", "quoteNumber")
        .lean();
      const linked =
        o?.orderNumber ||
        (o?.quotation && typeof o.quotation === "object" ? o.quotation.quoteNumber : null);
      if (linked) {
        const conflict = await SalesInvoice.exists({
          invoiceNumber: linked,
          _id: { $ne: params.id },
        });
        if (conflict) {
          throw new AppError(
            `Document ${linked} is already used by another tax invoice.`,
            400
          );
        }
        patch.invoiceNumber = linked;
      }
    }
  }

  const doc = await SalesInvoice.findByIdAndUpdate(params.id, patch, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new AppError("Tax Invoice not found", 404);

  const populated = await SalesInvoice.findById(doc._id)
    .populate("customer", "companyName addresses primaryPhone primaryEmail vatRegistrationNumber")
    .populate("salesOrder", "orderNumber status customerName total")
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
  const doc = await SalesInvoice.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Tax Invoice not found", 404);
  return apiSuccess({ deleted: true });
});
