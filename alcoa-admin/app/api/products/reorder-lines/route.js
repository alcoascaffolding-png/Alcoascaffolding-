import { auth } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { buildLowStockReorderLines } from "@/lib/reorder-service";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const lines = await buildLowStockReorderLines();
  return apiSuccess(lines);
});
