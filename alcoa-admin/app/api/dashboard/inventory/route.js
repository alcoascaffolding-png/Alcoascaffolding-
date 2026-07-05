import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { fetchInventoryDashboardSummary } from "@/lib/notifications";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const data = await fetchInventoryDashboardSummary();
  return apiSuccess(data);
});
