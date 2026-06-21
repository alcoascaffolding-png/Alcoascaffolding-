import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/Vendor"), "Vendor", "vendors");
export { GET, POST };
