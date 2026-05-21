import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";

/**
 * Find sales order + invoice linked to a quotation (by ref or matching document number).
 */
export async function getLinkedDocumentsForQuotation(quotationId, quoteNumber) {
  const qid =
    quotationId && mongoose.Types.ObjectId.isValid(String(quotationId))
      ? new mongoose.Types.ObjectId(String(quotationId))
      : null;

  let salesOrder = null;
  if (qid) {
    salesOrder = await SalesOrder.findOne({ quotation: qid })
      .select("_id orderNumber status total currency")
      .lean();
  }
  if (!salesOrder && quoteNumber) {
    salesOrder = await SalesOrder.findOne({ orderNumber: quoteNumber })
      .select("_id orderNumber status total currency quotation")
      .lean();
  }

  let salesInvoice = null;
  if (salesOrder?._id) {
    salesInvoice = await SalesInvoice.findOne({ salesOrder: salesOrder._id })
      .select("_id invoiceNumber status total paidAmount currency")
      .lean();
  }
  if (!salesInvoice && quoteNumber) {
    salesInvoice = await SalesInvoice.findOne({ invoiceNumber: quoteNumber })
      .select("_id invoiceNumber status total paidAmount currency salesOrder")
      .lean();
  }
  if (!salesInvoice && salesOrder?.orderNumber) {
    salesInvoice = await SalesInvoice.findOne({ invoiceNumber: salesOrder.orderNumber })
      .select("_id invoiceNumber status total paidAmount currency salesOrder")
      .lean();
  }

  return {
    salesOrder: salesOrder
      ? {
          _id: String(salesOrder._id),
          orderNumber: salesOrder.orderNumber,
          status: salesOrder.status,
          total: salesOrder.total,
          currency: salesOrder.currency || "AED",
        }
      : null,
    salesInvoice: salesInvoice
      ? {
          _id: String(salesInvoice._id),
          invoiceNumber: salesInvoice.invoiceNumber,
          status: salesInvoice.status,
          total: salesInvoice.total,
          paidAmount: salesInvoice.paidAmount,
          currency: salesInvoice.currency || "AED",
        }
      : null,
  };
}
