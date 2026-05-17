import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/PurchaseInvoice"), "Purchase Invoice");
export { GET, POST };
