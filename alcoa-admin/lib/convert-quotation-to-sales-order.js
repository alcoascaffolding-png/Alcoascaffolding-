import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import Quotation from "@/models/Quotation";
import { AppError } from "@/lib/api-error";
import { resolveOrderNumberForCreate } from "@/lib/document-number";
import { markQuotationConvertedFromSalesOrder } from "@/lib/sync-quotation-sales-order";
import { buildSalesOrderPayloadFromQuotation } from "@/lib/quotation-conversion-totals";

/**
 * When a quotation is marked converted, ensure a linked sales order exists.
 * Creates one from quotation line items if missing; links existing order by quote number.
 *
 * @returns {{ created: boolean, salesOrder: object, orderNumber: string }}
 */
export async function ensureSalesOrderFromQuotation(quotationId, createdByUserId) {
  if (!quotationId || !mongoose.Types.ObjectId.isValid(String(quotationId))) {
    throw new AppError("Invalid quotation id", 400);
  }

  const qid = new mongoose.Types.ObjectId(String(quotationId));
  const q = await Quotation.findById(qid).lean();
  if (!q) throw new AppError("Quotation not found", 404);

  if (!q.items?.length) {
    throw new AppError(
      "Add at least one line item to the quotation before converting to a sales order.",
      400
    );
  }

  let existing = await SalesOrder.findOne({ quotation: qid }).lean();
  if (!existing && q.quoteNumber) {
    existing = await SalesOrder.findOne({ orderNumber: q.quoteNumber }).lean();
    if (existing && !existing.quotation) {
      await SalesOrder.findByIdAndUpdate(existing._id, { quotation: qid });
    }
  }

  if (existing) {
    await markQuotationConvertedFromSalesOrder(qid);
    return {
      created: false,
      salesOrder: existing,
      orderNumber: existing.orderNumber,
    };
  }

  const { items, subtotal, vatAmount, total } = buildSalesOrderPayloadFromQuotation(q);

  const orderNumber = await resolveOrderNumberForCreate(
    { quotationId: qid, orderDate: q.quoteDate || new Date() },
    { Quotation, SalesOrder }
  );

  const order = await SalesOrder.create({
    orderNumber,
    customer: q.customer,
    customerName: q.customerName,
    customerAddress: q.customerAddress || undefined,
    customerEmail: q.customerEmail,
    customerPhone: q.customerPhone,
    customerTRN: q.customerTRN || undefined,
    quotation: qid,
    orderDate: q.quoteDate || new Date(),
    deliveryDate: q.deliveryDate || q.validUntil || undefined,
    status: "confirmed",
    items,
    subtotal,
    vatAmount,
    total,
    currency: q.currency || "AED",
    notes: q.notes || undefined,
    createdBy: createdByUserId,
  });

  await markQuotationConvertedFromSalesOrder(qid);

  return {
    created: true,
    salesOrder: order.toObject ? order.toObject() : order,
    orderNumber: order.orderNumber,
  };
}
