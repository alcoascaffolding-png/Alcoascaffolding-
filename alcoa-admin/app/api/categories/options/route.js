import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import { listCategoryOptions } from "@/lib/category-service";

/**
 * Dropdown options for product/vendor forms.
 * GET /api/categories/options?type=product|vendor
 */
export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type !== "product" && type !== "vendor") {
    throw new AppError('Query parameter "type" must be "product" or "vendor"', 400);
  }

  const resource = type === "vendor" ? "vendors" : "products";
  await authorizeApi(resource, "read");
  await connectDB();

  const activeOnly = searchParams.get("activeOnly") !== "false";
  const options = await listCategoryOptions(type, { activeOnly });

  return apiSuccess({ options, type });
});
