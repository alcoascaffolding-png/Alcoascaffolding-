import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/PurchaseInvoice"), "Purchase Invoice");
export { GET, PATCH, DELETE };
