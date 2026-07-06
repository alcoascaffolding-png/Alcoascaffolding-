import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { GET, POST } = createModuleCategoryHandlers("product", "products");

export { GET, POST };
