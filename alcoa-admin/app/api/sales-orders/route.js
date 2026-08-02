import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { markQuotationConvertedFromSalesOrder } from "@/lib/sync-quotation-sales-order";
import { resolveOrderNumberForCreate } from "@/lib/document-number";
import { Customer, Quotation, SalesOrder } from "@/lib/mongoose-models";
import { DOCUMENT_CUSTOMER_CONTACT_POPULATE } from "@/lib/resolve-document-customer";
import { assertCustomerCreditForOrder } from "@/lib/customer-credit";
import { assertSufficientStockForLines } from "@/lib/stock-validation";
import { buildRegexSearchFilter } from "@/lib/search-utils";

void Customer;

function buildSalesOrderFilter(searchParams) {
  const filter = {};
  const status = searchParams.get("status");

  if (status && status !== "all") filter.status = status;

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "orderNumber",
    "customerName",
    "referenceNumber",
  ]);
  if (searchFilter) Object.assign(filter, searchFilter);

  return filter;
}

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request) => {
  const session = await authorizeApi("sales-orders", "read");

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const filter = buildSalesOrderFilter(searchParams);

  const [items, total] = await Promise.all([
    SalesOrder.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", DOCUMENT_CUSTOMER_CONTACT_POPULATE)
      .lean(),
    SalesOrder.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("sales-orders", "write");

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
  if (qid) {
    const sourceQuote = await Quotation.findById(qid).select("_id").lean();
    if (!sourceQuote) throw new AppError("Quotation not found", 404);
    payload.quotation = qid;
  }

  try {
    payload.orderNumber = await resolveOrderNumberForCreate(
      {
        orderDate: payload.orderDate,
        orderNumber,
      },
      { Quotation, SalesOrder }
    );
  } catch (err) {
    throw new AppError(err.message || "Could not assign order number", 400);
  }

  if (payload.status === "confirmed") {
    const subtotal = (items || []).reduce((s, row) => s + Number(row.total || 0), 0);
    const total = subtotal + Number(vatAmount) || 0;
    await assertCustomerCreditForOrder({ customerId, additionalAmount: total });
  }

  if (["confirmed", "in_progress", "delivered"].includes(payload.status)) {
    await assertSufficientStockForLines(items, { context: "Sales order" });
  }

  const doc = await SalesOrder.create({ ...payload, createdBy: session.user.id });
  if (qid) await markQuotationConvertedFromSalesOrder(qid, doc._id);
  return apiSuccess(doc, 201);
});
