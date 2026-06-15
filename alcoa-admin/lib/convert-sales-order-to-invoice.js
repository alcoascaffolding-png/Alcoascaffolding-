import mongoose from "mongoose";
import { Customer, Quotation, SalesInvoice, SalesOrder } from "@/lib/mongoose-models";

void Customer;
import { AppError } from "@/lib/api-error";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";
import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";

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
  const order = await SalesOrder.findById(soid)
    .populate("customer", "vatRegistrationNumber addresses primaryPhone primaryEmail")
    .lean();
  if (!order) throw new AppError("Sales Order not found", 404);

  if (!order.items?.length) {
    throw new AppError(
      "Add at least one line item to the sales order before converting to a tax invoice.",
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
        equipmentType: it.equipmentType || undefined,
        specifications: it.specifications || undefined,
        size: it.size || undefined,
        weight: it.weight != null ? Number(it.weight) : undefined,
        cbm: it.cbm != null ? Number(it.cbm) : undefined,
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

  const cust = order.customer && typeof order.customer === "object" ? order.customer : null;

  let customerTRN = (order.customerTRN && String(order.customerTRN).trim()) || "";
  let customerAddress = (order.customerAddress && String(order.customerAddress).trim()) || "";

  if ((!customerTRN || !customerAddress) && order.quotation) {
    const qSnap = await Quotation.findById(order.quotation)
      .select("customerTRN customerAddress")
      .lean();
    if (qSnap) {
      customerTRN = customerTRN || (qSnap.customerTRN && String(qSnap.customerTRN).trim()) || "";
      customerAddress =
        customerAddress || (qSnap.customerAddress && String(qSnap.customerAddress).trim()) || "";
    }
  }

  if (!customerTRN) {
    customerTRN = (cust?.vatRegistrationNumber && String(cust.vatRegistrationNumber).trim()) || "";
  }
  if (!customerAddress) {
    customerAddress = formatCustomerAddressFromRecord(cust) || "";
  }

  let invoice;
  try {
    invoice = await SalesInvoice.create({
      invoiceNumber,
      customer: order.customer?._id ?? order.customer,
      customerName: order.customerName,
      customerAddress,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerTRN,
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
        `Invoice number ${invoiceNumber} already exists. Open the existing tax invoice.`,
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
