import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";
import SalesInvoice from "@/models/SalesInvoice";
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
  if (searchParams.get("paymentStatus")) filter.paymentStatus = searchParams.get("paymentStatus");
  const searchTerm = (searchParams.get("search") || "").trim();
  if (searchTerm) {
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { invoiceNumber: { $regex: escaped, $options: "i" } },
      { customerName: { $regex: escaped, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    SalesInvoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "companyName")
      .lean(),
    SalesInvoice.countDocuments(filter),
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
    salesOrder: salesOrderRef,
    invoiceDate: invoiceDateRaw,
    dueDate: dueRaw,
    items = [],
    invoiceNumber,
    customerName,
    customerAddress,
    customerEmail,
    customerPhone,
    customerTRN,
    paymentStatus,
    paidAmount,
    notes,
    currency,
    vatAmount,
  } = body;

  const payload = {
    customer: customerId,
    customerName,
    customerAddress,
    customerEmail,
    customerPhone,
    customerTRN,
    items,
    invoiceDate: coerceQuotationDate(invoiceDateRaw, new Date()),
    paymentStatus: paymentStatus || "unpaid",
    paidAmount: Number(paidAmount) || 0,
    notes,
    currency: currency || "AED",
    vatAmount: Number(vatAmount) || 0,
  };

  if (dueRaw) {
    const d = coerceQuotationDate(dueRaw, null);
    if (d && !Number.isNaN(d.getTime())) payload.dueDate = d;
  }

  const soid = toObjectId(salesOrderRef);
  if (soid) payload.salesOrder = soid;

  try {
    payload.invoiceNumber = await resolveInvoiceNumberForCreate(
      {
        salesOrderId: soid,
        invoiceDate: payload.invoiceDate,
        invoiceNumber,
      },
      { Quotation, SalesOrder, SalesInvoice }
    );
  } catch (err) {
    throw new AppError(err.message || "Could not assign invoice number", 400);
  }

  const doc = await SalesInvoice.create({ ...payload, createdBy: session.user.id });
  return apiSuccess(doc, 201);
});
