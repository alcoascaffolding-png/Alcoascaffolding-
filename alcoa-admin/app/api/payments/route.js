import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler } from "@/lib/api-error";
import { createListHandlers } from "@/lib/crud-factory";
import { createPaymentWithAllocation } from "@/lib/payment-service";
import { normalizeOptionalObjectId } from "@/lib/normalize-object-id";

const { GET } = createListHandlers(() => import("@/models/Payment"), "Payment", "payments");

const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("payments", "write");

  await connectDB();
  const body = await request.json();

  const invoiceIds = body.invoice
    ? [body.invoice]
    : Array.isArray(body.invoices)
      ? body.invoices
      : [];

  const payment = await createPaymentWithAllocation({
    invoiceIds,
    amount: body.amount,
    vendor: body.vendor,
    vendorName: body.vendorName,
    paymentMethod: body.paymentMethod,
    bankAccount: normalizeOptionalObjectId(body.bankAccount),
    reference: body.reference,
    notes: body.notes,
    paymentDate: body.paymentDate,
    userId: session.user.id,
  });

  return apiSuccess(payment, 201);
});

export { GET, POST };
