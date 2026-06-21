import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { createListHandlers } from "@/lib/crud-factory";
import { authorizeApi } from "@/lib/api-guard";
import { createReceiptWithPayment } from "@/lib/receipt-service";
import { logAudit } from "@/lib/audit-log";

const { GET } = createListHandlers(() => import("@/models/Receipt"), "Receipt", "receipts");

const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("receipts", "write");
  await connectDB();
  const body = await request.json();

  const invoiceIds = body.invoice
    ? [body.invoice]
    : Array.isArray(body.invoices)
      ? body.invoices
      : [];

  const receipt = await createReceiptWithPayment({
    invoiceIds,
    amount: body.amount,
    customer: body.customer,
    customerName: body.customerName,
    paymentMethod: body.paymentMethod,
    bankAccount:
      body.bankAccount && body.bankAccount !== "__none__" ? body.bankAccount : undefined,
    reference: body.reference,
    notes: body.notes,
    receiptDate: body.receiptDate,
    userId: session.user.id,
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "receipts",
    resourceId: receipt._id,
    summary: `Created receipt ${receipt.receiptNumber || receipt._id}`,
  });

  return apiSuccess(receipt, 201);});

export { GET, POST };
