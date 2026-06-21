import mongoose from "mongoose";
import Receipt from "@/models/Receipt";
import SalesInvoice from "@/models/SalesInvoice";
import { AppError } from "@/lib/api-error";
import {
  validateSalesInvoicePayment,
  applySalesInvoicePaymentFields,
} from "@/lib/sales-invoice-payment";

export async function generateReceiptNumber(baseDate = new Date()) {
  const y = new Date(baseDate).getFullYear();
  const prefix = `RCP-${y}-`;
  const count = await Receipt.countDocuments({
    receiptNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function invoiceBalance(inv) {
  const total = Math.max(0, Number(inv.total) || 0);
  const paid = Math.max(0, Number(inv.paidAmount) || 0);
  return Math.max(0, total - paid);
}

function derivePaymentStatus(inv) {
  if (inv.paymentStatus === "cancelled") return "cancelled";
  const total = Math.max(0, Number(inv.total) || 0);
  const paid = Math.max(0, Number(inv.paidAmount) || 0);
  const tolerance = 0.01;
  if (paid <= tolerance) return "unpaid";
  if (total > 0 && paid >= total - tolerance) return "paid";
  return "partially_paid";
}

async function loadInvoices(invoiceIds) {
  const ids = (invoiceIds || [])
    .map((id) => String(id))
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (!ids.length) throw new AppError("At least one invoice is required", 400);

  const invoices = await SalesInvoice.find({ _id: { $in: ids } }).sort({ invoiceDate: 1 });
  if (invoices.length !== ids.length) {
    throw new AppError("One or more invoices were not found", 404);
  }

  for (const inv of invoices) {
    if (inv.paymentStatus === "cancelled") {
      throw new AppError(`Invoice ${inv.invoiceNumber} is cancelled`, 400);
    }
  }

  return invoices;
}

/**
 * Allocate receipt amount across invoices (FIFO by invoiceDate).
 */
export function buildReceiptAllocations(invoices, amount) {
  const totalAmount = Math.max(0, Number(amount) || 0);
  if (totalAmount <= 0) throw new AppError("Receipt amount must be greater than zero", 400);

  let remaining = totalAmount;
  const allocations = [];

  for (const inv of invoices) {
    if (remaining <= 0) break;
    const balance = invoiceBalance(inv);
    if (balance <= 0) continue;
    const apply = Math.min(remaining, balance);
    allocations.push({ invoice: inv._id, amount: apply });
    remaining -= apply;
  }

  if (!allocations.length) {
    throw new AppError("Selected invoices have no outstanding balance", 400);
  }

  if (remaining > 0.01) {
    const maxPayable = totalAmount - remaining;
    throw new AppError(
      `Receipt amount exceeds outstanding balance (max ${maxPayable.toFixed(2)} AED for selected invoices)`,
      400
    );
  }

  return allocations;
}

async function applyAllocations(allocations, direction = 1) {
  for (const row of allocations) {
    const inv = await SalesInvoice.findById(row.invoice);
    if (!inv) continue;

    const delta = Number(row.amount) * direction;
    inv.paidAmount = Math.max(0, (Number(inv.paidAmount) || 0) + delta);
    inv.paymentStatus = derivePaymentStatus(inv);

    validateSalesInvoicePayment({
      paymentStatus: inv.paymentStatus,
      paidAmount: inv.paidAmount,
      total: inv.total,
    });
    applySalesInvoicePaymentFields(inv);
    await inv.save();
  }
}

export async function createReceiptWithPayment({
  invoiceIds,
  amount,
  customer,
  customerName,
  paymentMethod,
  bankAccount,
  reference,
  notes,
  receiptDate,
  userId,
}) {
  const invoices = await loadInvoices(invoiceIds);
  const allocations = buildReceiptAllocations(invoices, amount);

  const resolvedCustomerName =
    customerName?.trim() || invoices[0]?.customerName?.trim() || "Customer";

  const receipt = await Receipt.create({
    receiptNumber: await generateReceiptNumber(receiptDate || new Date()),
    customer: customer || invoices[0]?.customer,
    customerName: resolvedCustomerName,
    invoices: allocations.map((a) => a.invoice),
    allocations,
    amount: allocations.reduce((s, a) => s + a.amount, 0),
    paymentMethod: paymentMethod || "Cash",
    bankAccount: bankAccount || undefined,
    reference: reference || undefined,
    notes: notes || undefined,
    receiptDate: receiptDate ? new Date(receiptDate) : new Date(),
    createdBy: userId,
  });

  await applyAllocations(allocations, 1);
  return receipt;
}

export async function reverseReceiptPayment(receipt) {
  const allocations = receipt.allocations?.length
    ? receipt.allocations
    : (receipt.invoices || []).map((invId) => ({
        invoice: invId,
        amount: receipt.amount,
      }));

  if (!allocations.length) return;
  await applyAllocations(allocations, -1);
}
