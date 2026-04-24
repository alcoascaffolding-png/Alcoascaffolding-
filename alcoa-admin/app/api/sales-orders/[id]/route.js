import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/SalesOrder"), "Sales Order");
export { GET, PATCH, DELETE };
