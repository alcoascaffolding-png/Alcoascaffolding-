import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { authorizeApi } from "@/lib/api-guard";
import Product from "@/models/Product";
import StockAdjustment from "@/models/StockAdjustment";

export const GET = withErrorHandler(async () => {
  await authorizeApi("products", "read");
  await connectDB();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [summary] = await Product.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $ne: ["$isActive", false] }, 1, 0] } },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$isActive", false] },
                  { $gt: ["$minStock", 0] },
                  { $lte: ["$currentStock", "$minStock"] },
                  { $gt: ["$currentStock", 0] },
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
              { $and: [{ $ne: ["$isActive", false] }, { $lte: ["$currentStock", 0] }] },
              1,
              0,
            ],
          },
        },
        inventoryValue: {
          $sum: {
            $cond: [
              { $ne: ["$isActive", false] },
              { $multiply: [{ $ifNull: ["$currentStock", 0] }, { $ifNull: ["$purchasePrice", 0] }] },
              0,
            ],
          },
        },
        rentalInventory: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$isActive", false] },
                  { $gt: [{ $ifNull: ["$rentalPrice", 0] }, 0] },
                ],
              },
              { $ifNull: ["$currentStock", 0] },
              0,
            ],
          },
        },
        recentlyAdded: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0],
          },
        },
      },
    },
  ]);

  const recentAdjustments = await StockAdjustment.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  return apiSuccess({
    ...(summary || {
      total: 0,
      active: 0,
      lowStock: 0,
      outOfStock: 0,
      inventoryValue: 0,
      rentalInventory: 0,
      recentlyAdded: 0,
    }),
    recentAdjustments,
  });
});
