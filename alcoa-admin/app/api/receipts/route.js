import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/Receipt"), "Receipt");
export { GET, POST };
