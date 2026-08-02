import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import Quotation from "@/models/Quotation";
import { AppError } from "@/lib/api-error";
import { resolveOrderNumberForCreate } from "@/lib/document-number";
import { markQuotationConvertedFromSalesOrder } from "@/lib/sync-quotation-sales-order";
import { assertSufficientStockForLines } from "@/lib/stock-validation";

/** Statuses that allow Convert to Sales Order / Invoice. */
export const QUOTATION_CONVERTIBLE_STATUSES = ["accepted", "approved"];

/** After Convert, status is flipped before ensure may re-run (PATCH path). */
const QUOTATION_POST_CONVERT_STATUSES = [
  "converted",
  "converted_to_sales_order",
  "converted_to_invoice",
];

export function assertQuotationConvertible(quotation, targetLabel = "sales document") {
  const status = String(quotation?.status || "");
  if (QUOTATION_CONVERTIBLE_STATUSES.includes(status)) return;
  // Status PATCH saves `converted_*` before ensure creates the linked document.
  if (QUOTATION_POST_CONVERT_STATUSES.includes(status)) return;
  throw new AppError(
    `Only Accepted quotations can be converted to a ${targetLabel}. Current status: ${status || "unknown"}.`,
    400
  );
}

function quotationItemsToOrderItems(items) {
  return (items || []).map((it) => {
    const qty = Number(it.quantity) || 1;
    const rate = Number(it.ratePerUnit) || 0;
    const lineSub = Number(it.subtotal ?? qty * rate);
    const desc =
      [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
      it.description ||
      "Line item";
    return {
      product: it.product || undefined,
      description: desc,
      equipmentType: it.equipmentType || undefined,
      specifications: it.specifications || undefined,
      size: it.size || undefined,
      weight: it.weight != null ? Number(it.weight) : undefined,
      cbm: it.cbm != null ? Number(it.cbm) : undefined,
      quantity: qty,
      unit: it.unit || "Nos",
      unitPrice: rate,
      total: lineSub,
    };
  });
}

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
    await markQuotationConvertedFromSalesOrder(qid, existing._id);
    return {
      created: false,
      salesOrder: existing,
      orderNumber: existing.orderNumber,
    };
  }

  assertQuotationConvertible(q, "sales order");

  const items = quotationItemsToOrderItems(q.items);
  await assertSufficientStockForLines(items, { context: "Quotation to sales order conversion" });

  const lineSubtotal =
    Number(q.subtotal) || items.reduce((s, it) => s + Number(it.total || 0), 0);
  const vatAmount =
    Number(q.vatAmount) ||
    Math.round((lineSubtotal * Number(q.vatPercentage || 5)) / 100 * 100) / 100;

  const orderNumber = await resolveOrderNumberForCreate(
    {
      orderDate: q.quoteDate || new Date(),
    },
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
    subtotal: lineSubtotal,
    deliveryCharges: Number(q.deliveryCharges) || 0,
    installationCharges: Number(q.installationCharges) || 0,
    pickupCharges: Number(q.pickupCharges) || 0,
    discount: Number(q.discount) || 0,
    discountType: q.discountType || "fixed",
    vatPercentage: Number(q.vatPercentage) || 5,
    vatAmount,
    total: Number(q.totalAmount) || lineSubtotal + vatAmount,
    currency: q.currency || "AED",
    paymentTerms: q.paymentTerms || "Cash/CDC",
    deliveryTerms: q.deliveryTerms || "7-10 days from date of order",
    customerPONumber: q.customerPONumber || undefined,
    referenceNumber: q.referenceNumber || undefined,
    notes: q.notes || undefined,
    createdBy: createdByUserId,
  });

  await markQuotationConvertedFromSalesOrder(qid, order._id);

  return {
    created: true,
    salesOrder: order.toObject ? order.toObject() : order,
    orderNumber: order.orderNumber,
  };
}
