import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/StockAdjustment"), "Stock Adjustment");
export { GET, POST };
