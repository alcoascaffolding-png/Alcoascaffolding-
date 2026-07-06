import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { GET, POST } = createModuleCategoryHandlers("vendor", "vendors");

export { GET, POST };
