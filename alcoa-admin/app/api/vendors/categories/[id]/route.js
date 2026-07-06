import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { GET_BY_ID, PATCH, DELETE } = createModuleCategoryHandlers("vendor", "vendors");

export const GET = GET_BY_ID;
export { PATCH, DELETE };
