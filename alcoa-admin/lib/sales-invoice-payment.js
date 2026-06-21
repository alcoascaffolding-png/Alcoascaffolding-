import { AppError } from "@/lib/api-error";

/**
 * Validate paymentStatus vs paidAmount against invoice total.
 * @param {{ paymentStatus?: string, paidAmount?: number, total?: number }} fields
 */
export function validateSalesInvoicePayment(fields) {
  const status = fields.paymentStatus || "unpaid";
  const paid = Number(fields.paidAmount) || 0;
  const total = Math.max(0, Number(fields.total) || 0);
  const tolerance = 0.01;

  if (paid < 0) {
    throw new AppError("Paid amount cannot be negative.", 400);
  }
  if (paid > total + tolerance && total > 0) {
    throw new AppError("Paid amount cannot exceed invoice total.", 400);
  }

  if (status === "paid") {
    if (total > 0 && paid < total - tolerance) {
      throw new AppError(
        "Mark the invoice as partially paid or increase paid amount to match the total.",
        400
      );
    }
    if (total <= 0 && paid <= 0) {
      throw new AppError("Cannot mark as paid when invoice total is zero.", 400);
    }
  }

  if (status === "unpaid" && paid > tolerance) {
    throw new AppError(
      "Set payment status to partially paid or paid when recording a payment amount.",
      400
    );
  }

  if (status === "partially_paid") {
    if (paid <= tolerance) {
      throw new AppError("Enter a paid amount for partially paid invoices.", 400);
    }
    if (total > 0 && paid >= total - tolerance) {
      throw new AppError("Use payment status paid when the full amount has been received.", 400);
    }
  }

  if (status === "cancelled" && paid > tolerance) {
    throw new AppError("Cancelled invoices cannot have a payment recorded.", 400);
  }
}

/** Normalize paid amount and balance after validation. */
export function applySalesInvoicePaymentFields(doc) {
  const total = Math.max(0, Number(doc.total) || 0);
  let paid = Number(doc.paidAmount) || 0;
  if (doc.paymentStatus === "paid" && total > 0) {
    paid = total;
    doc.paidAmount = paid;
  }
  doc.balance = Math.max(0, total - paid);
  return doc;
}
