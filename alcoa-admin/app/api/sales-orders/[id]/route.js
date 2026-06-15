import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { Customer, Quotation, SalesOrder } from "@/lib/mongoose-models";
import { QUOTATION_CUSTOMER_POPULATE_FIELDS } from "@/lib/load-quotation-for-pdf";

void Customer;
import { SALES_ORDER_STATUS_VALUES } from "@/models/SalesOrder";
import { syncQuotationsAfterSalesOrderPatch, revertQuotationFromConvertedToApproved } from "@/lib/sync-quotation-sales-order";
import {
  ensureSalesInvoiceFromSalesOrder,
  SALES_ORDER_INVOICE_STATUS,
} from "@/lib/convert-sales-order-to-invoice";

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
  const doc = await SalesOrder.findById(params.id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("quotation", "quoteNumber status customerName totalAmount")
    .lean();
  if (!doc) throw new AppError("Sales Order not found", 404);
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

  const prev = await SalesOrder.findById(params.id).lean();
  if (!prev) throw new AppError("Sales Order not found", 404);

  const prevStatus = prev.status;
  const patch = { ...body };

  if (
    Object.prototype.hasOwnProperty.call(patch, "status") &&
    patch.status != null &&
    !SALES_ORDER_STATUS_VALUES.includes(patch.status)
  ) {
    throw new AppError(
      `Invalid status "${patch.status}". Restart the dev server (npm run dev) after code updates.`,
      400
    );
  }

  if (Object.prototype.hasOwnProperty.call(body, "quotation")) {
    const qid = toObjectId(body.quotation);
    patch.quotation = qid ?? null;
    if (qid) {
      const q = await Quotation.findById(qid).select("quoteNumber").lean();
      if (q?.quoteNumber) {
        const conflict = await SalesOrder.exists({
          orderNumber: q.quoteNumber,
          _id: { $ne: params.id },
        });
        if (conflict) {
          throw new AppError(
            `Quotation ${q.quoteNumber} is already linked to another sales order.`,
            400
          );
        }
        patch.orderNumber = q.quoteNumber;
      }
    }
  }

  let doc;
  try {
    doc = await SalesOrder.findByIdAndUpdate(params.id, patch, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors || {})[0]?.message;
      throw new AppError(first || err.message || "Sales order validation failed", 400);
    }
    throw err;
  }
  if (!doc) throw new AppError("Sales Order not found", 404);

  await syncQuotationsAfterSalesOrderPatch(prev, doc);

  const nextStatus = doc.status;
  let invoicing = null;

  if (nextStatus === SALES_ORDER_INVOICE_STATUS && prevStatus !== SALES_ORDER_INVOICE_STATUS) {
    try {
      const result = await ensureSalesInvoiceFromSalesOrder(doc._id, session.user.id);
      invoicing = {
        created: result.created,
        invoiceNumber: result.invoiceNumber,
        salesInvoiceId: String(result.salesInvoice._id),
      };
    } catch (err) {
      await SalesOrder.findByIdAndUpdate(doc._id, { $set: { status: prevStatus } });
      throw err instanceof AppError
        ? err
        : new AppError(err.message || "Could not create tax invoice from order", 400);
    }
  } else if (nextStatus === SALES_ORDER_INVOICE_STATUS) {
    const result = await ensureSalesInvoiceFromSalesOrder(doc._id, session.user.id);
    invoicing = {
      created: result.created,
      invoiceNumber: result.invoiceNumber,
      salesInvoiceId: String(result.salesInvoice._id),
    };
  }

  const populated = await SalesOrder.findById(doc._id)
    .populate("customer", QUOTATION_CUSTOMER_POPULATE_FIELDS)
    .populate("quotation", "quoteNumber status customerName totalAmount")
    .lean();

  return apiSuccess(invoicing ? { ...populated, invoicing } : populated);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;

  await connectDB();
  const prev = await SalesOrder.findById(params.id).lean();
  const doc = await SalesOrder.findByIdAndDelete(params.id);
  if (!doc) throw new AppError("Sales Order not found", 404);

  if (prev?.quotation) {
    await revertQuotationFromConvertedToApproved(prev.quotation);
  }

  return apiSuccess({ deleted: true });
});
