import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Quotation from "@/models/Quotation";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("lastCheck") ? new Date(searchParams.get("lastCheck")) : new Date(Date.now() - 60 * 1000);

  const count = await Quotation.countDocuments({ createdAt: { $gt: since } });
  return apiSuccess({ hasNew: count > 0, count });
});
