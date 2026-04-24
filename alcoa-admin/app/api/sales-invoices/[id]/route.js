import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/SalesInvoice"), "Sales Invoice");
export { GET, PATCH, DELETE };
