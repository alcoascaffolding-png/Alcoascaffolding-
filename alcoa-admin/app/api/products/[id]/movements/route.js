import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler, AppError } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import StockAdjustment from "@/models/StockAdjustment";
import Product from "@/models/Product";

export const GET = withErrorHandler(async (request, { params }) => {
  await authorizeApi("products", "read");
  await connectDB();

  const product = await Product.findById(params.id).lean();
  if (!product) throw new AppError("Product not found", 404);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
  const skip = (page - 1) * limit;

  const filter = { product: params.id };

  const [items, total] = await Promise.all([
    StockAdjustment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StockAdjustment.countDocuments(filter),
  ]);

  return apiSuccess({
    product: { _id: product._id, name: product.name, itemCode: product.itemCode, currentStock: product.currentStock },
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
});
