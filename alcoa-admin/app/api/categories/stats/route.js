import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import Category from "@/models/Category";
import { ensureDefaultCategories } from "@/lib/category-service";

export const GET = withErrorHandler(async () => {
  await authorizeApi("categories", "read");
  await connectDB();

  await Promise.all([ensureDefaultCategories("product"), ensureDefaultCategories("vendor")]);

  const [product, vendor, total] = await Promise.all([
    Category.countDocuments({ type: "product" }),
    Category.countDocuments({ type: "vendor" }),
    Category.countDocuments({}),
  ]);

  return apiSuccess({
    total,
    product,
    vendor,
    activeProduct: await Category.countDocuments({ type: "product", isActive: true }),
    activeVendor: await Category.countDocuments({ type: "vendor", isActive: true }),
  });
});
