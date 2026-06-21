import SalesInvoice from "@/models/SalesInvoice";
import PurchaseInvoice from "@/models/PurchaseInvoice";

/**
 * Mark unpaid/partial invoices as overdue when due date has passed.
 */
export async function markOverdueSalesInvoices() {
  const now = new Date();
  const result = await SalesInvoice.updateMany(
    {
      dueDate: { $lt: now },
      paymentStatus: { $in: ["unpaid", "partially_paid"] },
    },
    { $set: { paymentStatus: "overdue" } }
  );
  return result.modifiedCount || 0;
}

export async function markOverduePurchaseInvoices() {
  const now = new Date();
  const result = await PurchaseInvoice.updateMany(
    {
      dueDate: { $lt: now },
      paymentStatus: { $in: ["unpaid", "partially_paid"] },
    },
    { $set: { paymentStatus: "overdue" } }
  );
  return result.modifiedCount || 0;
}
