import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { logAudit } from "@/lib/audit-log";
import Customer from "@/models/Customer";

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const customer = await Customer.findById(params.id);
  if (!customer) throw new AppError("Customer not found", 404);

  customer.addresses.push(body);
  await customer.save();

  logAudit({
    session,
    action: "update",
    resource: "customers",
    resourceId: customer._id,
    summary: `Added address to customer ${customer.displayName || customer.companyName || customer._id}`,
  });

  return apiSuccess(customer.addresses[customer.addresses.length - 1], 201);
});
