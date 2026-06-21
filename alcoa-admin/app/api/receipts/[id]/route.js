import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Receipt from "@/models/Receipt";
import { reverseReceiptPayment } from "@/lib/receipt-service";

async function resolveParams(context) {
  const params =
    context.params && typeof context.params.then === "function"
      ? await context.params
      : context.params;
  return params;
}

export const GET = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("receipts", "read");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await Receipt.findById(params.id)
    .populate("invoices", "invoiceNumber customerName total paidAmount balance paymentStatus")
    .lean();
  if (!doc) throw new AppError("Receipt not found", 404);
  return apiSuccess(doc);
});

export const DELETE = withErrorHandler(async (request, context) => {
  const session = await authorizeApi("receipts", "delete");

  const params = await resolveParams(context);

  await connectDB();
  const doc = await Receipt.findById(params.id);
  if (!doc) throw new AppError("Receipt not found", 404);

  await reverseReceiptPayment(doc);
  await doc.deleteOne();

  return apiSuccess({ deleted: true });
});
