import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { markQuotationConvertedFromSalesOrder } from "@/lib/sync-quotation-sales-order";
import { resolveOrderNumberForCreate } from "@/lib/document-number";
import SalesOrder from "@/models/SalesOrder";
import Quotation from "@/models/Quotation";

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (searchParams.get("status")) filter.status = searchParams.get("status");
  const searchTerm = (searchParams.get("search") || "").trim();
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { orderNumber: { $regex: escaped, $options: "i" } },
      { customerName: { $regex: escaped, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    SalesOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "companyName")
      .lean(),
    SalesOrder.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();
  const customerId = await resolveQuotationCustomerId(body, session.user.id);

  const {
    customer: _dropCustomer,
    quotation: quotationRef,
    orderDate: orderDateRaw,
    deliveryDate: deliveryRaw,
    items = [],
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    status,
    notes,
    currency,
    vatAmount,
  } = body;

  const payload = {
    customer: customerId,
    customerName,
    customerEmail,
    customerPhone,
    items,
    orderDate: coerceQuotationDate(orderDateRaw, new Date()),
    status: status || "draft",
    notes,
    currency: currency || "AED",
    vatAmount: Number(vatAmount) || 0,
  };

  if (deliveryRaw) {
    const d = coerceQuotationDate(deliveryRaw, null);
    if (d && !Number.isNaN(d.getTime())) payload.deliveryDate = d;
  }

  const qid = toObjectId(quotationRef);
  if (qid) payload.quotation = qid;

  try {
    payload.orderNumber = await resolveOrderNumberForCreate(
      {
        quotationId: qid,
        orderDate: payload.orderDate,
        orderNumber,
      },
      { Quotation, SalesOrder }
    );
  } catch (err) {
    throw new AppError(err.message || "Could not assign order number", 400);
  }

  const doc = await SalesOrder.create({ ...payload, createdBy: session.user.id });
  if (qid) await markQuotationConvertedFromSalesOrder(qid);
  return apiSuccess(doc, 201);
});
