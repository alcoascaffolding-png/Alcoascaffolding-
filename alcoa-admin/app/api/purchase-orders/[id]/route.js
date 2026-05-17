import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/PurchaseOrder"), "Purchase Order");
export { GET, PATCH, DELETE };
