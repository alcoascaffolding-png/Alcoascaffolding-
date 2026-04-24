import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Customer from "@/models/Customer";

export const POST = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const customer = await Customer.findById(params.id);
  if (!customer) throw new AppError("Customer not found", 404);

  customer.contactPersons.push(body);
  await customer.save();

  return apiSuccess(customer.contactPersons[customer.contactPersons.length - 1], 201);
});
