import mongoose from "mongoose";
import Quotation from "@/models/Quotation";

function toIdString(ref) {
  if (ref == null) return null;
  if (typeof ref === "object" && ref._id != null) return String(ref._id);
  return String(ref);
}

/**
 * When a sales order is linked to a quotation, mark the quote as converted to sales order.
 */
export async function markQuotationConvertedFromSalesOrder(quotationId, salesOrderId) {
  if (!quotationId || !mongoose.Types.ObjectId.isValid(String(quotationId))) return;
  const qid = new mongoose.Types.ObjectId(String(quotationId));
  const orderId =
    salesOrderId && mongoose.Types.ObjectId.isValid(String(salesOrderId))
      ? new mongoose.Types.ObjectId(String(salesOrderId))
      : undefined;
  const set = {
    status: "converted_to_sales_order",
    convertedToOrder: true,
    convertedAt: new Date(),
  };
  if (orderId) set.orderId = orderId;
  await Quotation.findByIdAndUpdate(qid, {
    $set: set,
  });
}

/**
 * When a sales order unlinks or switches quotation, set the old quote back to approved
 * if it was marked converted (best-effort — assumes one order drives conversion).
 */
export async function revertQuotationFromConvertedToApproved(quotationId) {
  if (!quotationId || !mongoose.Types.ObjectId.isValid(String(quotationId))) return;
  const q = await Quotation.findById(quotationId).select("status").lean();
  if (!q || !["converted", "converted_to_sales_order"].includes(q.status)) return;
  await Quotation.findByIdAndUpdate(quotationId, {
    $set: {
      status: "accepted",
      convertedToOrder: false,
    },
    $unset: { convertedAt: "", orderId: "" },
  });
}

/**
 * After PATCH: sync quotation converted flags from previous vs new linked quotation.
 */
export async function syncQuotationsAfterSalesOrderPatch(prevOrderLean, updatedOrderDoc) {
  const prevQ = toIdString(prevOrderLean?.quotation);
  const newQ = toIdString(updatedOrderDoc?.quotation);

  if (prevQ === newQ) {
    if (newQ) await markQuotationConvertedFromSalesOrder(newQ, updatedOrderDoc?._id);
    return;
  }

  if (prevQ && prevQ !== newQ) {
    await revertQuotationFromConvertedToApproved(prevQ);
  }
  if (newQ) {
    await markQuotationConvertedFromSalesOrder(newQ, updatedOrderDoc?._id);
  }
}
