import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { STATS } = createModuleCategoryHandlers("vendor", "vendors");

export const GET = STATS;
