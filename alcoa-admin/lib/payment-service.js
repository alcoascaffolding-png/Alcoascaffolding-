import mongoose from "mongoose";
import Payment from "@/models/Payment";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import { AppError } from "@/lib/api-error";
import {
  validatePurchaseInvoicePayment,
  applyPurchaseInvoicePaymentFields,
} from "@/lib/purchase-invoice-payment";

export async function generatePaymentNumber(baseDate = new Date()) {
  const y = new Date(baseDate).getFullYear();
  const prefix = `PAY-${y}-`;
  const count = await Payment.countDocuments({
    paymentNumber: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

function invoiceBalance(inv) {
  const total = Math.max(0, Number(inv.total) || 0);
  const paid = Math.max(0, Number(inv.paidAmount) || 0);
  return Math.max(0, total - paid);
}

function derivePaymentStatus(inv) {
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

  if (!ids.length) throw new AppError("At least one purchase invoice is required", 400);

  const invoices = await PurchaseInvoice.find({ _id: { $in: ids } }).sort({ invoiceDate: 1 });
  if (invoices.length !== ids.length) {
    throw new AppError("One or more purchase invoices were not found", 404);
  }
  return invoices;
}

export function buildPaymentAllocations(invoices, amount) {
  const totalAmount = Math.max(0, Number(amount) || 0);
  if (totalAmount <= 0) throw new AppError("Payment amount must be greater than zero", 400);

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
      `Payment amount exceeds outstanding balance (max ${maxPayable.toFixed(2)} AED)`,
      400
    );
  }

  return allocations;
}

async function applyAllocations(allocations, direction = 1) {
  for (const row of allocations) {
    const inv = await PurchaseInvoice.findById(row.invoice);
    if (!inv) continue;

    const delta = Number(row.amount) * direction;
    inv.paidAmount = Math.max(0, (Number(inv.paidAmount) || 0) + delta);
    inv.paymentStatus = derivePaymentStatus(inv);

    validatePurchaseInvoicePayment({
      paymentStatus: inv.paymentStatus,
      paidAmount: inv.paidAmount,
      total: inv.total,
    });
    applyPurchaseInvoicePaymentFields(inv);
    await inv.save();
  }
}

export async function createPaymentWithAllocation({
  invoiceIds,
  amount,
  vendor,
  vendorName,
  paymentMethod,
  bankAccount,
  reference,
  notes,
  paymentDate,
  userId,
}) {
  const invoices = await loadInvoices(invoiceIds);
  const allocations = buildPaymentAllocations(invoices, amount);

  const resolvedVendorName =
    vendorName?.trim() || invoices[0]?.vendorName?.trim() || "Vendor";

  const payment = await Payment.create({
    paymentNumber: await generatePaymentNumber(paymentDate || new Date()),
    vendor: vendor || invoices[0]?.vendor,
    vendorName: resolvedVendorName,
    invoices: allocations.map((a) => a.invoice),
    allocations,
    amount: allocations.reduce((s, a) => s + a.amount, 0),
    paymentMethod: paymentMethod || "Bank Transfer",
    bankAccount: bankAccount || undefined,
    reference: reference || undefined,
    notes: notes || undefined,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    createdBy: userId,
  });

  await applyAllocations(allocations, 1);
  return payment;
}

export async function reversePaymentAllocation(payment) {
  const allocations = payment.allocations?.length
    ? payment.allocations
    : (payment.invoices || []).map((invId) => ({
        invoice: invId,
        amount: payment.amount,
      }));

  if (!allocations.length) return;
  await applyAllocations(allocations, -1);
}
