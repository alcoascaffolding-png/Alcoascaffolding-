import mongoose from "mongoose";
import Customer from "@/models/Customer";
import SalesInvoice from "@/models/SalesInvoice";
import { AppError } from "@/lib/api-error";

/**
 * Block order confirmation when customer would exceed credit limit.
 */
export async function assertCustomerCreditForOrder({ customerId, additionalAmount = 0 }) {
  if (!customerId || !mongoose.Types.ObjectId.isValid(String(customerId))) return;

  const customer = await Customer.findById(customerId).select(
    "companyName status creditLimit currentBalance"
  );
  if (!customer) return;

  if (customer.status === "blocked") {
    throw new AppError(`Customer "${customer.companyName}" is blocked.`, 400);
  }

  const limit = Number(customer.creditLimit) || 0;
  if (limit <= 0) return;

  const agg = await SalesInvoice.aggregate([
    {
      $match: {
        customer: new mongoose.Types.ObjectId(String(customerId)),
        paymentStatus: { $in: ["unpaid", "partially_paid", "overdue"] },
      },
    },
    { $group: { _id: null, outstanding: { $sum: { $ifNull: ["$balance", 0] } } } },
  ]);

  const outstanding = Number(agg[0]?.outstanding) || 0;
  const projected = outstanding + Math.max(0, Number(additionalAmount) || 0);

  if (projected > limit + 0.01) {
    throw new AppError(
      `Credit limit exceeded for ${customer.companyName}. Limit: AED ${limit.toFixed(2)}, outstanding: AED ${outstanding.toFixed(2)}, order: AED ${Number(additionalAmount).toFixed(2)}.`,
      400
    );
  }
}
