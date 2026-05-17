import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/SalesInvoice"), "Sales Invoice");
export { GET, POST };
