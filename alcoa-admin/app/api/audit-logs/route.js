import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { requireSession, requireManageUsers } from "@/lib/api-auth";
import AuditLog from "@/models/AuditLog";

export const GET = withErrorHandler(async (request) => {
  const session = await requireSession();
  requireManageUsers(session);

  await connectDB();
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10));
  const skip = (page - 1) * limit;

  const filter = {};
  if (searchParams.get("resource")) filter.resource = searchParams.get("resource");
  if (searchParams.get("action")) filter.action = searchParams.get("action");

  const [items, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email role")
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return apiSuccess({ items, total, page, limit, pages: Math.ceil(total / limit) });
});
