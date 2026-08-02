import mongoose from "mongoose";
import SalesOrder from "@/models/SalesOrder";
import SalesInvoice from "@/models/SalesInvoice";
import Quotation from "@/models/Quotation";
import {
  resolveInvoiceNumberForCreate,
  resolveOrderNumberForCreate,
} from "@/lib/document-number";

/**
 * Find sales order + invoice linked to a quotation.
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
  // Backward compatibility: older rows may have reused the quotation number as orderNumber.
  if (!salesOrder && quoteNumber) {
    salesOrder = await SalesOrder.findOne({ orderNumber: quoteNumber })
      .select("_id orderNumber status total currency")
      .lean();
    if (salesOrder && qid && !salesOrder.quotation) {
      await SalesOrder.findByIdAndUpdate(salesOrder._id, { quotation: qid });
    }
  }
  if (salesOrder && !String(salesOrder.orderNumber || "").startsWith("SO")) {
    const repaired = await SalesOrder.findById(salesOrder._id);
    if (repaired) {
      repaired.orderNumber = await resolveOrderNumberForCreate(
        {
          orderDate: repaired.orderDate || new Date(),
          salesOrderId: repaired._id,
        },
        { Quotation, SalesOrder }
      );
      repaired.recalculateTotals();
      await repaired.save();
      salesOrder = repaired.toObject();
    }
  }

  let salesInvoice = null;
  if (qid) {
    salesInvoice = await SalesInvoice.findOne({ quotation: qid })
      .select("_id invoiceNumber paymentStatus total paidAmount balance currency salesOrder")
      .lean();
  }
  if (!salesInvoice && salesOrder?._id) {
    salesInvoice = await SalesInvoice.findOne({ salesOrder: salesOrder._id })
      .select("_id invoiceNumber paymentStatus total paidAmount balance currency salesOrder")
      .lean();
  }
  // Backward compatibility for older documents that reused the quotation number.
  if (!salesInvoice && quoteNumber) {
    salesInvoice = await SalesInvoice.findOne({ invoiceNumber: quoteNumber })
      .select("_id invoiceNumber paymentStatus total paidAmount balance currency salesOrder")
      .lean();
  }
  if (salesInvoice && !String(salesInvoice.invoiceNumber || "").startsWith("SI")) {
    const repaired = await SalesInvoice.findById(salesInvoice._id);
    if (repaired) {
      repaired.invoiceNumber = await resolveInvoiceNumberForCreate(
        {
          invoiceDate: repaired.invoiceDate || new Date(),
          salesInvoiceId: repaired._id,
        },
        { Quotation, SalesOrder, SalesInvoice }
      );
      repaired.recalculateTotals();
      await repaired.save();
      salesInvoice = repaired.toObject();
    }
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
          status: salesInvoice.paymentStatus,
          paymentStatus: salesInvoice.paymentStatus,
          total: salesInvoice.total,
          paidAmount: salesInvoice.paidAmount,
          balance: salesInvoice.balance,
          currency: salesInvoice.currency || "AED",
        }
      : null,
  };
}
