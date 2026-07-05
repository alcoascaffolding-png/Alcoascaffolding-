import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import ContactMessage from "@/models/ContactMessage";
import { buildRegexSearchFilter } from "@/lib/search-utils";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
  const skip = (page - 1) * limit;

  const filter = {};
  if (searchParams.get("type")) filter.type = searchParams.get("type");
  if (searchParams.get("status")) filter.status = searchParams.get("status");
  if (searchParams.get("priority")) filter.priority = searchParams.get("priority");
  const searchFilter = buildRegexSearchFilter(searchParams.get("search"), [
    "name",
    "email",
    "company",
  ]);
  if (searchFilter) Object.assign(filter, searchFilter);

  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactMessage.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});
