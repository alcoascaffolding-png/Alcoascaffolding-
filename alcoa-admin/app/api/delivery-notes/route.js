import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { resolveDeliveryNoteNumberForCreate } from "@/lib/document-number";
import { syncDeliveryNoteStock } from "@/lib/stock-service";
import { syncSalesOrderOnDeliveryNote } from "@/lib/sync-sales-order-on-delivery";
import { assertDeliveryNoteQuantitiesWithinSalesOrder } from "@/lib/sales-order-delivery-fulfillment";
import { Customer, DeliveryNote, Quotation, SalesInvoice, SalesOrder } from "@/lib/mongoose-models";
import { DOCUMENT_CUSTOMER_CONTACT_POPULATE } from "@/lib/resolve-document-customer";

void Customer;

function toObjectId(value) {
  if (value == null || value === "" || value === "__none__") return undefined;
  const s = String(value);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

export const GET = withErrorHandler(async (request) => {
  const session = await authorizeApi("delivery-notes", "read");

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
      { deliveryNoteNumber: { $regex: escaped, $options: "i" } },
      { customerName: { $regex: escaped, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    DeliveryNote.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("salesOrder", "orderNumber")
      .populate("customer", DOCUMENT_CUSTOMER_CONTACT_POPULATE)
      .lean(),
    DeliveryNote.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("delivery-notes", "write");

  await connectDB();
  const body = await request.json();
  const customerId = await resolveQuotationCustomerId(body, session.user.id);

  const {
    customer: _dropCustomer,
    salesOrder: salesOrderRef,
    quotation: quotationRef,
    deliveryDate: deliveryDateRaw,
    items = [],
    deliveryNoteNumber,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    deliveryAddress,
    driverName,
    vehicleNumber,
    contactPersonName,
    contactPersonPhone,
    status,
    notes,
    deliveryInstructions,
    noteType,
  } = body;

  if (!customerName?.trim()) throw new AppError("Customer name is required", 400);
  if (!items.length) throw new AppError("At least one line item is required", 400);

  const payload = {
    customer: customerId,
    customerName: customerName.trim(),
    customerEmail,
    customerPhone,
    customerAddress,
    deliveryAddress,
    driverName,
    vehicleNumber,
    contactPersonName,
    contactPersonPhone,
    items,
    status: status || "draft",
    noteType: noteType === "return" ? "return" : "delivery",
    notes,
    deliveryInstructions,
  };

  if (deliveryDateRaw) {
    const d = coerceQuotationDate(deliveryDateRaw, null);
    if (d && !Number.isNaN(d.getTime())) payload.deliveryDate = d;
  }

  const soid = toObjectId(salesOrderRef);
  if (soid) payload.salesOrder = soid;

  let qid = toObjectId(quotationRef);
  if (!qid && soid) {
    const so = await SalesOrder.findById(soid).select("quotation").lean();
    if (so?.quotation) qid = so.quotation;
  }
  if (qid) payload.quotation = qid;

  if (soid) {
    await assertDeliveryNoteQuantitiesWithinSalesOrder({
      salesOrderId: soid,
      noteType: payload.noteType,
      items: payload.items,
    });
  }

  try {
    payload.deliveryNoteNumber = await resolveDeliveryNoteNumberForCreate(
      {
        deliveryDate: payload.deliveryDate || new Date(),
        deliveryNoteNumber,
      },
      { Quotation, SalesOrder, SalesInvoice, DeliveryNote }
    );
  } catch (err) {
    throw new AppError(err.message || "Could not assign delivery note number", 400);
  }

  const doc = await DeliveryNote.create({ ...payload, createdBy: session.user.id });

  if (doc.status === "delivered") {
    const prev = {
      status: "draft",
      stockApplied: false,
      items: [],
      deliveryNoteNumber: doc.deliveryNoteNumber,
      noteType: doc.noteType,
      salesOrder: doc.salesOrder,
    };
    await syncDeliveryNoteStock(prev, doc, session.user.id);
    await syncSalesOrderOnDeliveryNote(prev, doc);
  }

  return apiSuccess(doc, 201);
});
