import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/Product"), "Product", "products");
export { GET, PATCH, DELETE };
