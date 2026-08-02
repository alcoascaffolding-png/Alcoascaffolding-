import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import DeliveryNote from "@/models/DeliveryNote";
import { AppError } from "@/lib/api-error";

function toObjectId(id) {
  if (!id || !mongoose.Types.ObjectId.isValid(String(id))) return null;
  return new mongoose.Types.ObjectId(String(id));
}

/** Block quotation delete when a linked sales order exists. */
export async function assertQuotationSafeToDelete(quotationId) {
  const qid = toObjectId(quotationId);
  if (!qid) return;

  const order = await SalesOrder.findOne({ quotation: qid })
    .select("orderNumber")
    .lean();
  if (order) {
    throw new AppError(
      `Cannot delete quotation — linked sales order ${order.orderNumber} exists. Delete the sales order first.`,
      409
    );
  }
}

/** Block sales order delete when linked invoice or delivery notes exist. */
export async function assertSalesOrderSafeToDelete(salesOrderId) {
  const soid = toObjectId(salesOrderId);
  if (!soid) return;

  const [invoice, deliveryCount] = await Promise.all([
    SalesInvoice.findOne({ salesOrder: soid }).select("invoiceNumber").lean(),
    DeliveryNote.countDocuments({ salesOrder: soid }),
  ]);

  if (invoice) {
    throw new AppError(
      `Cannot delete sales order — linked tax invoice ${invoice.invoiceNumber} exists. Tax invoices are permanent and cannot be removed.`,
      409
    );
  }
  if (deliveryCount > 0) {
    throw new AppError(
      `Cannot delete sales order — ${deliveryCount} delivery note(s) are linked. Delete them first.`,
      409
    );
  }
}

/**
 * Tax invoices are statutory records and must be retained permanently.
 * Always blocks delete — no conditional exceptions.
 */
export async function assertSalesInvoiceSafeToDelete(_invoiceId) {
  throw new AppError(
    "Tax invoices are permanent records and cannot be deleted.",
    403
  );
}
