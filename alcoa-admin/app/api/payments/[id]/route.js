import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/Payment"), "Payment");
export { GET, PATCH, DELETE };
