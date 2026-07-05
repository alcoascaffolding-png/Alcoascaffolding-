import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { authorizeApi } from "@/lib/api-guard";
import { withErrorHandler } from "@/lib/api-error";
import Customer from "@/models/Customer";
import { buildRegexSearchFilter } from "@/lib/search-utils";
import { sanitizeMongoDocument } from "@/lib/mongo-sanitize";

function buildCustomerFilter(searchParams) {
  const filter = {};
  const status = searchParams.get("status");
  const customerType = searchParams.get("customerType");

  if (status && status !== "all") filter.status = status;
  if (customerType) filter.customerType = customerType;

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "companyName",
    "displayName",
    "primaryEmail",
    "primaryPhone",
    "tradeLicenseNumber",
    "vatRegistrationNumber",
  ]);
  if (searchFilter) Object.assign(filter, searchFilter);

  return filter;
}

export const GET = withErrorHandler(async (request) => {
  const session = await authorizeApi("customers", "read");

  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const filter = buildCustomerFilter(searchParams);

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("customers", "write");

  await connectDB();
  const body = await request.json();
  const patch = sanitizeMongoDocument(body);

  const customer = await Customer.create({ ...patch, createdBy: session.user.id });
  return apiSuccess(customer, 201);
});
