import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Payment from "@/models/Payment";
import { reversePaymentAllocation } from "@/lib/payment-service";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("payments", "read");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await Payment.findById(params.id)
    .populate("invoices", "invoiceNumber vendorName total paidAmount balance paymentStatus")
    .lean();
  if (!doc) throw new AppError("Payment not found", 404);
  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("payments", "delete");

  const params = await resolveParams(context);
  await connectDB();
  const doc = await Payment.findById(params.id);
  if (!doc) throw new AppError("Payment not found", 404);

  await reversePaymentAllocation(doc);
  await doc.deleteOne();

  return apiSuccess({ deleted: true });
});
