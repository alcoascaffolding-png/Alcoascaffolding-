import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const filter = {};
  if (searchParams.get("status")) filter.status = searchParams.get("status");
  if (searchParams.get("quoteType")) filter.quoteType = searchParams.get("quoteType");
  if (searchParams.get("customer")) filter.customer = searchParams.get("customer");
  if (searchParams.get("search")) {
    filter.$text = { $search: searchParams.get("search") };
  }

  const [items, total] = await Promise.all([
    Quotation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("customer", "companyName").lean(),
    Quotation.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();
  const body = await request.json();

  const customerId = await resolveQuotationCustomerId(body, session.user.id);
  const quoteDate = coerceQuotationDate(body.quoteDate, new Date());
  const validUntil = coerceQuotationDate(
    body.validUntil,
    new Date(Date.now() + 30 * 86400000)
  );
  if (validUntil.getTime() < quoteDate.getTime()) {
    throw new AppError("Valid until must be on or after quote date", 400);
  }

  const { customer: _dropCustomer, ...rest } = body;
  const payload = {
    ...rest,
    customer: customerId,
    quoteDate,
    validUntil,
    status: body.status || "draft",
    currency: body.currency || "AED",
    discountType: body.discountType || "fixed",
  };

  if (!payload.quoteNumber) {
    payload.quoteNumber = await Quotation.generateQuoteNumber();
  }

  const quotation = await Quotation.create({ ...payload, createdBy: session.user.id });
  return apiSuccess(quotation, 201);
});
