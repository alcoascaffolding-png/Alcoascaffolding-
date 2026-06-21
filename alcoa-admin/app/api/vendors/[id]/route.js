import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/Vendor"), "Vendor", "vendors");
export { GET, PATCH, DELETE };
