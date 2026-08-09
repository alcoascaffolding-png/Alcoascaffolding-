import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { logAudit } from "@/lib/audit-log";
import { resolveQuotationCustomerId, coerceQuotationDate } from "@/lib/quotation-save";
import { normalizeOptionalObjectId } from "@/lib/normalize-object-id";
import { parseRequestBody } from "@/lib/validate-request";
import { quotationCreateSchema } from "@/lib/schemas/quotation";
import { Customer, Quotation } from "@/lib/mongoose-models";
import { DOCUMENT_CUSTOMER_CONTACT_POPULATE } from "@/lib/resolve-document-customer";
import { buildRegexSearchFilter } from "@/lib/search-utils";

void Customer;

/**
 * Derived-expiry (read/query-time only — the stored status is never rewritten):
 * a quote is Expired when its stored status is "expired", OR its stored status
 * is still open (draft/sent/viewed) and its `validUntil` is before the start of
 * today (server date boundary).
 */
const OPEN_QUOTATION_STATUSES = ["draft", "sent", "viewed"];

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildQuotationFilter(searchParams) {
  const filter = {};
  const and = [];
  const status = searchParams.get("status");

  const today = startOfToday();
  // Draft/sent/viewed quotes whose Valid Until day has passed.
  const dateExpired = {
    status: { $in: OPEN_QUOTATION_STATUSES },
    validUntil: { $lt: today },
  };
  // Open quote that has NOT passed its Valid Until day (or has none set).
  const notDateExpired = {
    $or: [{ validUntil: { $gte: today } }, { validUntil: null }],
  };

  if (status === "pending") {
    // Pending = draft + sent that have NOT lapsed, matching the Pending stat card.
    filter.status = { $in: ["draft", "sent"] };
    and.push(notDateExpired);
  } else if (status === "converted") {
    filter.status = { $in: ["converted", "converted_to_sales_order", "converted_to_invoice"] };
  } else if (status === "accepted") {
    filter.status = { $in: ["accepted", "approved"] };
  } else if (status === "expired") {
    // Stored "expired" OR derived-expired open quotes.
    and.push({ $or: [{ status: "expired" }, dateExpired] });
  } else if (OPEN_QUOTATION_STATUSES.includes(status)) {
    // A lapsed open quote is shown as Expired everywhere, so exclude it from the
    // plain draft/sent/viewed filters to avoid double-counting against Expired.
    filter.status = status;
    and.push(notDateExpired);
  } else if (status) {
    filter.status = status;
  }

  if (searchParams.get("quoteType")) filter.quoteType = searchParams.get("quoteType");
  if (searchParams.get("customer")) filter.customer = searchParams.get("customer");

  // Date window is inclusive and matches the Date column (quoteDate).
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const range = {};
  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime())) {
      from.setHours(0, 0, 0, 0);
      range.$gte = from;
    }
  }
  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      range.$lte = to;
    }
  }
  if (Object.keys(range).length) filter.quoteDate = range;

  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "quoteNumber",
    "customerName",
    "referenceNumber",
    "contactPersonName",
  ]);
  // Combine via $and so the search $or never collides with the expiry $or.
  if (searchFilter) and.push(searchFilter);

  if (and.length) filter.$and = and;

  return filter;
}

export const GET = withErrorHandler(async (request) => {
  await authorizeApi("quotations", "read");

  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;
  const filter = buildQuotationFilter(searchParams);

  // quoteDate first so the list order matches the visible Date column.
  const [items, total] = await Promise.all([
    Quotation.find(filter)
      .sort({ quoteDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", DOCUMENT_CUSTOMER_CONTACT_POPULATE)
      .lean(),
    Quotation.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("quotations", "write");

  await connectDB();
  const rawBody = await request.json();
  const body = parseRequestBody(quotationCreateSchema, rawBody);

  const customerId = await resolveQuotationCustomerId(body, session.user.id);
  const quoteDate = coerceQuotationDate(body.quoteDate, new Date());
  const validUntil = coerceQuotationDate(
    body.validUntil,
    new Date(Date.now() + 30 * 86400000)
  );
  if (validUntil.getTime() < quoteDate.getTime()) {
    throw new AppError("Valid until must be on or after quote date", 400);
  }

  const { customer: _dropCustomer, bankAccount: _dropBank, ...rest } = body;
  const bankAccount = normalizeOptionalObjectId(body.bankAccount);
  const payload = {
    ...rest,
    customer: customerId,
    quoteDate,
    validUntil,
    status: body.status || "draft",
    currency: body.currency || "AED",
    discountType: body.discountType || "fixed",
  };
  if (bankAccount) payload.bankAccount = bankAccount;

  if (!payload.quoteNumber) {
    payload.quoteNumber = await Quotation.generateQuoteNumber(quoteDate);
  }

  const quotation = await Quotation.create({ ...payload, createdBy: session.user.id });
  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "quotations",
    resourceId: quotation._id,
    summary: `Created quotation ${quotation.quoteNumber}`,
  });
  return apiSuccess(quotation, 201);
});
