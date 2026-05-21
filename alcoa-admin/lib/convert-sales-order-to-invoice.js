import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import Quotation from "@/models/Quotation";
import { AppError } from "@/lib/api-error";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";

const CONVERT_TO_INVOICE_STATUS = "invoiced";

/** Status value that triggers auto-creation of a sales invoice from the order. */
export const SALES_ORDER_INVOICE_STATUS = CONVERT_TO_INVOICE_STATUS;

/**
 * When a sales order is marked invoiced, ensure a linked sales invoice exists.
 *
 * @returns {{ created: boolean, salesInvoice: object, invoiceNumber: string }}
 */
export async function ensureSalesInvoiceFromSalesOrder(salesOrderId, createdByUserId) {
  if (!salesOrderId || !mongoose.Types.ObjectId.isValid(String(salesOrderId))) {
    throw new AppError("Invalid sales order id", 400);
  }

  const soid = new mongoose.Types.ObjectId(String(salesOrderId));
  const order = await SalesOrder.findById(soid).lean();
  if (!order) throw new AppError("Sales Order not found", 404);

  if (!order.items?.length) {
    throw new AppError(
      "Add at least one line item to the sales order before converting to a sales invoice.",
      400
    );
  }

  if (order.status === "cancelled") {
    throw new AppError("Cannot invoice a cancelled sales order.", 400);
  }

  let existing = await SalesInvoice.findOne({ salesOrder: soid }).lean();
  if (!existing && order.orderNumber) {
    existing = await SalesInvoice.findOne({ invoiceNumber: order.orderNumber }).lean();
    if (existing && !existing.salesOrder) {
      await SalesInvoice.findByIdAndUpdate(existing._id, { salesOrder: soid });
    }
  }

  if (existing) {
    return {
      created: false,
      salesInvoice: existing,
      invoiceNumber: existing.invoiceNumber,
    };
  }

  const items = (order.items || [])
    .map((it) => {
      const qty = Math.max(Number(it.quantity) || 0, 0.01);
      const rate = Number(it.unitPrice) || 0;
      const total = Number(it.total ?? qty * rate);
      return {
        description: it.description || "Line item",
        quantity: qty,
        unit: it.unit || "Nos",
        unitPrice: rate,
        total: total > 0 ? total : qty * rate,
      };
    })
    .filter((it) => it.total > 0);

  if (!items.length) {
    throw new AppError(
      "Sales order line items have no billable amounts. Check quantities and prices.",
      400
    );
  }

  const lineSubtotal = items.reduce((s, it) => s + Number(it.total || 0), 0);
  const vatAmount = Number(order.vatAmount) || 0;
  const total = lineSubtotal + vatAmount;
  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate.getTime() + 30 * 86400000);

  const invoiceNumber = await resolveInvoiceNumberForCreate(
    { salesOrderId: soid, invoiceDate },
    { Quotation, SalesOrder, SalesInvoice }
  );

  let invoice;
  try {
    invoice = await SalesInvoice.create({
      invoiceNumber,
      customer: order.customer,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      salesOrder: soid,
      invoiceDate,
      dueDate,
      paymentStatus: "unpaid",
      items,
      subtotal: lineSubtotal,
      vatAmount,
      total,
      paidAmount: 0,
      balance: total,
      currency: order.currency || "AED",
      notes: order.notes || undefined,
      createdBy: createdByUserId,
    });
  } catch (err) {
    if (err.code === 11000) {
      const dup = await SalesInvoice.findOne({ invoiceNumber }).lean();
      if (dup && String(dup.salesOrder) === String(soid)) {
        return {
          created: false,
          salesInvoice: dup,
          invoiceNumber: dup.invoiceNumber,
        };
      }
      throw new AppError(
        `Invoice number ${invoiceNumber} already exists. Open the existing sales invoice.`,
        409
      );
    }
    throw err;
  }

  return {
    created: true,
    salesInvoice: invoice.toObject ? invoice.toObject() : invoice,
    invoiceNumber: invoice.invoiceNumber,
  };
}
