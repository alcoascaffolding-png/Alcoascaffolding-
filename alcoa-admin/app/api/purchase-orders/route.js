import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/PurchaseOrder"), "Purchase Order");
export { GET, POST };
