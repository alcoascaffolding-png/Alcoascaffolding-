import { connectDB } from "@/lib/db";
import { apiSuccess } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/api-error";
import { createListHandlers } from "@/lib/crud-factory";
import { authorizeApi } from "@/lib/api-guard";
import { createStockAdjustment } from "@/lib/stock-service";
import { logAudit } from "@/lib/audit-log";

const { GET } = createListHandlers(() => import("@/models/StockAdjustment"), "Stock Adjustment", "stock-adjustments");

const POST = withErrorHandler(async (request) => {
  const session = await authorizeApi("stock-adjustments", "write");
  await connectDB();
  const body = await request.json();

  const {
    product: productId,
    adjustmentType,
    quantity,
    correctionNewStock,
    reason,
    notes,
  } = body;

  const { adjustment } = await createStockAdjustment({
    productId,
    adjustmentType,
    quantity,
    correctionNewStock,
    reason,
    notes,
    userId: session.user.id,
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email,
    action: "create",
    resource: "stock-adjustments",
    resourceId: adjustment._id,
    summary: `Stock adjustment ${adjustment.adjustmentType}`,
  });

  return apiSuccess(adjustment, 201);});

export { GET, POST };
