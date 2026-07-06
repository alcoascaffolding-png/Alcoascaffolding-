import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { STATS } = createModuleCategoryHandlers("product", "products");

export const GET = STATS;
