import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Customer from "@/models/Customer";

export const GET = withErrorHandler(async (request) => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const lastCheck = searchParams.get("lastCheck");
  const since = lastCheck ? new Date(lastCheck) : new Date(Date.now() - 60 * 1000);

  const count = await Customer.countDocuments({ createdAt: { $gt: since } });
  return apiSuccess({ hasNew: count > 0, count });
});
