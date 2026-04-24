import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/Receipt"), "Receipt");
export { GET, PATCH, DELETE };
