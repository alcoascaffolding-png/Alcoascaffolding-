import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/SalesOrder"), "Sales Order");
export { GET, POST };
