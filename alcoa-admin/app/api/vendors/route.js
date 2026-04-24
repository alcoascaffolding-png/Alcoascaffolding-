import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/Vendor"), "Vendor");
export { GET, POST };
