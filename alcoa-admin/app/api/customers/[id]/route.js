import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import Customer from "@/models/Customer";

export const GET = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const customer = await Customer.findById(params.id).lean();
  if (!customer) throw new AppError("Customer not found", 404);
  return apiSuccess(customer);
});

/**
 * Fields that are enum-constrained — never allow "" to reach Mongoose validation.
 * An empty string from the client means "don't change this field".
 */
const ENUM_FIELDS = new Set([
  "businessType", "paymentTerms", "status", "customerType",
  "priority", "source", "currency",
]);

/**
 * Fields the client must never overwrite directly.
 */
const DENY_PATCH = new Set([
  "_id", "__v", "createdAt", "updatedAt", "createdBy",
  "totalOrders", "totalRevenue", "lastOrderDate",
]);

function cleanCustomerPatch(body) {
  const out = {};
  for (const [key, val] of Object.entries(body)) {
    if (DENY_PATCH.has(key)) continue;
    // Drop empty strings for enum fields — keep the existing DB value instead
    if (ENUM_FIELDS.has(key) && (val === "" || val == null)) continue;
    // Drop undefined
    if (val === undefined) continue;
    out[key] = val;
  }
  return out;
}

export const PATCH = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();
  const patch = cleanCustomerPatch(body);

  // Load → merge → save so pre-save hooks (primaryEmail etc.) run correctly
  const doc = await Customer.findById(params.id);
  if (!doc) throw new AppError("Customer not found", 404);

  for (const [key, val] of Object.entries(patch)) {
    doc.set(key, val);
  }
  doc.lastModifiedBy = session.user.id;
  await doc.save();

  return apiSuccess(doc.toJSON());
});

export const DELETE = withErrorHandler(async (request, { params }) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const customer = await Customer.findByIdAndDelete(params.id);
  if (!customer) throw new AppError("Customer not found", 404);
  return apiSuccess({ deleted: true });
});
