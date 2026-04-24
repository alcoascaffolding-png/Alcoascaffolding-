import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/StockAdjustment"), "Stock Adjustment");
export { GET, PATCH, DELETE };
