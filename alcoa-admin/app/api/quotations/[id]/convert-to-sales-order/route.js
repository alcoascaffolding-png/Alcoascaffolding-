import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-log";
import { ensureSalesOrderFromQuotation } from "@/lib/convert-quotation-to-sales-order";

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

  const result = await ensureSalesOrderFromQuotation(params.id, session.user.id);

  if (result.created) {
    logAudit({
      session,
      action: "create",
      resource: "sales-orders",
      resourceId: result.salesOrder._id,
      summary: `Created sales order ${result.orderNumber} from quotation`,
    });
  }

  return apiSuccess({
    created: result.created,
    orderNumber: result.orderNumber,
    salesOrderId: String(result.salesOrder._id),
  }, result.created ? 201 : 200);
});
