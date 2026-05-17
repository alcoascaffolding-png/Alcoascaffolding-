import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Customer from "@/models/Customer";

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const customer = await Customer.findById(params.id);
  if (!customer) throw new AppError("Customer not found", 404);

  const address = customer.addresses.id(params.addressId);
  if (!address) throw new AppError("Address not found", 404);

  Object.assign(address, body);
  await customer.save();

  return apiSuccess(address);
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const customer = await Customer.findById(params.id);
  if (!customer) throw new AppError("Customer not found", 404);

  customer.addresses.pull({ _id: params.addressId });
  await customer.save();

  return apiSuccess({ deleted: true });
});
