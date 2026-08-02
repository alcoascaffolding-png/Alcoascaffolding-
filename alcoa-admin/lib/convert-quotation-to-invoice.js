import mongoose from "mongoose";
import { Customer, Quotation, SalesInvoice, SalesOrder } from "@/lib/mongoose-models";

void Customer;
import { AppError } from "@/lib/api-error";
import { resolveInvoiceNumberForCreate } from "@/lib/document-number";
import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";
import {
  assertQuotationConvertible,
  assertQuotationHasBillableLines,
  resolveQuotationLineBilling,
} from "@/lib/convert-quotation-to-sales-order";

function quotationItemsToInvoiceItems(items) {
  return (items || [])
    .map((it) => {
      const { quantity: qty, unitPrice: rate, total } = resolveQuotationLineBilling(it);
      return {
        product: it.product || undefined,
        description:
          [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
          it.description ||
          "Line item",
        equipmentType: it.equipmentType || undefined,
        specifications: it.specifications || undefined,
        size: it.size || undefined,
        weight: it.weight != null ? Number(it.weight) : undefined,
        cbm: it.cbm != null ? Number(it.cbm) : undefined,
        quantity: qty,
        unit: it.unit || "Nos",
        unitPrice: rate,
        total,
      };
    })
    .filter((it) => it.total > 0);
}

function paymentStatusFor({ total, paidAmount, balance }) {
  if (Number(total || 0) <= 0) return "unpaid";
  if (Number(balance || 0) <= 0.0001) return "paid";
  if (Number(paidAmount || 0) > 0) return "partially_paid";
  return "unpaid";
}

/**
 * Create or return a Tax Invoice linked to a quotation.
 * New invoices get a fresh SI number (never copies quoteNumber).
 * If the quote already has a Sales Order, the invoice is also linked to that order.
 */
export async function ensureSalesInvoiceFromQuotation(quotationId, createdByUserId) {
  if (!quotationId || !mongoose.Types.ObjectId.isValid(String(quotationId))) {
    throw new AppError("Invalid quotation id", 400);
  }

  const qid = new mongoose.Types.ObjectId(String(quotationId));
  const q = await Quotation.findById(qid)
    .populate("customer", "vatRegistrationNumber addresses primaryPhone primaryEmail")
    .lean();
  if (!q) throw new AppError("Quotation not found", 404);

  if (!q.items?.length) {
    throw new AppError(
      "Add at least one line item to the quotation before converting to a tax invoice.",
      400
    );
  }
  if (["rejected", "expired"].includes(q.status)) {
    throw new AppError("Cannot convert a rejected or expired quotation to a tax invoice.", 400);
  }

  const linkedOrder = await SalesOrder.findOne({ quotation: qid }).lean();

  let existing = await SalesInvoice.findOne({ quotation: qid }).lean();
  if (!existing && linkedOrder?._id) {
    existing = await SalesInvoice.findOne({ salesOrder: linkedOrder._id }).lean();
  }
  // Backward compatibility for older rows that reused quotation number.
  if (!existing && q.quoteNumber) {
    existing = await SalesInvoice.findOne({ invoiceNumber: q.quoteNumber }).lean();
    if (existing && !existing.quotation) {
      await SalesInvoice.findByIdAndUpdate(existing._id, { quotation: qid });
    }
  }

  if (existing) {
    await Quotation.findByIdAndUpdate(qid, {
      $set: {
        status: "converted_to_invoice",
        convertedToInvoice: true,
        invoiceId: existing._id,
        convertedAt: q.convertedAt || new Date(),
      },
    });
    return {
      created: false,
      salesInvoice: existing,
      invoiceNumber: existing.invoiceNumber,
    };
  }

  assertQuotationConvertible(q, "tax invoice");
  assertQuotationHasBillableLines(q, "tax invoice");

  const items = quotationItemsToInvoiceItems(q.items);
  if (!items.length) {
    assertQuotationHasBillableLines(q, "tax invoice");
  }

  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate.getTime() + 30 * 86400000);
  const invoiceNumber = await resolveInvoiceNumberForCreate(
    {
      invoiceDate,
    },
    { Quotation, SalesOrder, SalesInvoice }
  );

  const cust = q.customer && typeof q.customer === "object" ? q.customer : null;
  const customerAddress = q.customerAddress || formatCustomerAddressFromRecord(cust) || "";
  const subtotal = Number(q.subtotal) || items.reduce((sum, it) => sum + Number(it.total || 0), 0);
  const vatAmount = Number(q.vatAmount) || 0;
  const total = Number(q.totalAmount) || subtotal + vatAmount;
  const paidAmount = 0;
  const balance = Math.max(0, total - paidAmount);

  const invoice = await SalesInvoice.create({
    invoiceNumber,
    customer: cust?._id ?? q.customer,
    customerName: q.customerName,
    customerAddress,
    customerEmail: q.customerEmail || cust?.primaryEmail,
    customerPhone: q.customerPhone || cust?.primaryPhone,
    customerTRN: q.customerTRN || cust?.vatRegistrationNumber || "",
    quotation: qid,
    salesOrder: linkedOrder?._id,
    invoiceDate,
    dueDate,
    paymentStatus: paymentStatusFor({ total, paidAmount, balance }),
    items,
    subtotal,
    deliveryCharges: Number(q.deliveryCharges) || 0,
    installationCharges: Number(q.installationCharges) || 0,
    pickupCharges: Number(q.pickupCharges) || 0,
    discount: Number(q.discount) || 0,
    discountType: q.discountType || "fixed",
    vatPercentage: Number(q.vatPercentage) || 5,
    vatAmount,
    total,
    paidAmount,
    balance,
    currency: q.currency || "AED",
    paymentTerms: q.paymentTerms || "Cash/CDC",
    deliveryTerms: q.deliveryTerms || "7-10 days from date of order",
    customerPONumber: q.customerPONumber || undefined,
    referenceNumber: q.referenceNumber || undefined,
    notes: q.notes || undefined,
    createdBy: createdByUserId,
  });

  await Quotation.findByIdAndUpdate(qid, {
    $set: {
      status: "converted_to_invoice",
      convertedToInvoice: true,
      invoiceId: invoice._id,
      convertedAt: q.convertedAt || new Date(),
    },
  });

  return {
    created: true,
    salesInvoice: invoice.toObject ? invoice.toObject() : invoice,
    invoiceNumber: invoice.invoiceNumber,
  };
}
