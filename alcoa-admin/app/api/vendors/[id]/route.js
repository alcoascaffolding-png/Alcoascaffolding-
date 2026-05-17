import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/Vendor"), "Vendor");
export { GET, PATCH, DELETE };
