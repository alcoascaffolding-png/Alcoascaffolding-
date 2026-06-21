import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import Product from "@/models/Product";

export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  await connectDB();

  const [summary] = await Product.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $ne: ["$isActive", false] }, 1, 0] },
        },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$isActive", false] },
                  { $gt: ["$minStock", 0] },
                  { $lte: ["$currentStock", "$minStock"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        outOfStock: {
          $sum: {
            $cond: [
              {
                $and: [{ $ne: ["$isActive", false] }, { $lte: ["$currentStock", 0] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return apiSuccess(summary || { total: 0, active: 0, lowStock: 0, outOfStock: 0 });
});
