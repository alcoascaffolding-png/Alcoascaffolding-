import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-log";
import { ensureSalesInvoiceFromSalesOrder } from "@/lib/convert-sales-order-to-invoice";
import SalesOrder from "@/models/SalesOrder";

async function resolveParams(context) {
  return context.params && typeof context.params.then === "function"
    ? await context.params
    : context.params;
}

export const POST = withErrorHandler(async (request, context) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const params = await resolveParams(context);
  await connectDB();

  const result = await ensureSalesInvoiceFromSalesOrder(params.id, session.user.id);
  await SalesOrder.findByIdAndUpdate(params.id, { $set: { status: "invoiced" } });

  if (result.created) {
    logAudit({
      session,
      action: "create",
      resource: "sales-invoices",
      resourceId: result.salesInvoice._id,
      summary: `Created tax invoice ${result.invoiceNumber} from sales order`,
    });
  }

  return apiSuccess(
    {
      created: result.created,
      invoiceNumber: result.invoiceNumber,
      salesInvoiceId: String(result.salesInvoice._id),
    },
    result.created ? 201 : 200
  );
});
