import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";
import { Customer, Quotation, SalesInvoice, SalesOrder } from "@/lib/mongoose-models";
import { DOCUMENT_CUSTOMER_CONTACT_POPULATE } from "@/lib/resolve-document-customer";
import { markOverdueSalesInvoices } from "@/lib/mark-overdue-invoices";
import {
  computeSalesInvoiceTotals,
  paymentStatusFromAmounts,
} from "@/lib/sales-invoice-totals";
import {
  applySalesInvoicePaymentFields,
  validateSalesInvoicePayment,
} from "@/lib/sales-invoice-payment";
import { buildRegexSearchFilter } from "@/lib/search-utils";

void Customer;

function buildSalesInvoiceFilter(searchParams) {
  const filter = {};
  const paymentStatus = searchParams.get("paymentStatus");

  if (paymentStatus && paymentStatus !== "all") filter.paymentStatus = paymentStatus;

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "invoiceNumber",
    "customerName",
    "customerTRN",
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
  const session = await authorizeApi("sales-invoices", "read");

  await connectDB();
  await markOverdueSalesInvoices();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const filter = buildSalesInvoiceFilter(searchParams);

  const [items, total] = await Promise.all([
    SalesInvoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", DOCUMENT_CUSTOMER_CONTACT_POPULATE)
      .lean(),
    SalesInvoice.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("sales-invoices", "write");

  await connectDB();
  const body = await request.json();
  const customerId = await resolveQuotationCustomerId(body, session.user.id);

  const {
    customer: _dropCustomer,
    quotation: quotationRef,
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
    deliveryCharges,
    installationCharges,
    pickupCharges,
    discount,
    discountType,
    vatPercentage,
  } = body;

  const totals = computeSalesInvoiceTotals({ items, vatAmount, paidAmount });

  const payload = {
    customer: customerId,
    customerName,
    customerAddress,
    customerEmail,
    customerPhone,
    customerTRN,
    items: totals.items,
    invoiceDate: coerceQuotationDate(invoiceDateRaw, new Date()),
    paymentStatus: paymentStatus || paymentStatusFromAmounts(totals),
    paidAmount: totals.paidAmount,
    notes,
    currency: currency || "AED",
    subtotal: totals.subtotal,
    deliveryCharges: Number(deliveryCharges) || 0,
    installationCharges: Number(installationCharges) || 0,
    pickupCharges: Number(pickupCharges) || 0,
    discount: Number(discount) || 0,
    discountType: discountType || "fixed",
    vatPercentage: Number(vatPercentage) || 5,
    vatAmount: totals.vatAmount,
    total: totals.total,
    balance: totals.balance,
  };

  if (dueRaw) {
    const d = coerceQuotationDate(dueRaw, null);
    if (d && !Number.isNaN(d.getTime())) payload.dueDate = d;
  }

  const qid = toObjectId(quotationRef);
  const soid = toObjectId(salesOrderRef);

  if (soid) {
    const sourceOrder = await SalesOrder.findById(soid).select("quotation").lean();
    if (!sourceOrder) throw new AppError("Sales order not found", 404);
    payload.salesOrder = soid;
    if (!qid && sourceOrder.quotation) {
      payload.quotation = sourceOrder.quotation;
    }
  }

  if (qid) {
    const sourceQuote = await Quotation.findById(qid).select("_id").lean();
    if (!sourceQuote) throw new AppError("Quotation not found", 404);
    payload.quotation = qid;
  }

  try {
    payload.invoiceNumber = await resolveInvoiceNumberForCreate(
      {
        invoiceDate: payload.invoiceDate,
        invoiceNumber,
      },
      { Quotation, SalesOrder, SalesInvoice }
    );
  } catch (err) {
    throw new AppError(err.message || "Could not assign invoice number", 400);
  }

  const doc = await SalesInvoice.create({ ...payload, createdBy: session.user.id });
  if (doc.items?.length) doc.recalculateTotals();
  validateSalesInvoicePayment({
    paymentStatus: doc.paymentStatus,
    paidAmount: doc.paidAmount,
    total: doc.total,
  });
  applySalesInvoicePaymentFields(doc);
  await doc.save();

  if (payload.quotation) {
    await Quotation.findByIdAndUpdate(payload.quotation, {
      $set: {
        status: "converted_to_invoice",
        convertedToInvoice: true,
        invoiceId: doc._id,
        convertedAt: new Date(),
      },
    });
  }

  return apiSuccess(doc, 201);
});
