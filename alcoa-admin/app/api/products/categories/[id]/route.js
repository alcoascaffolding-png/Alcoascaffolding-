import { createModuleCategoryHandlers } from "@/lib/category-route-handlers";

const { GET_BY_ID, PATCH, DELETE } = createModuleCategoryHandlers("product", "products");

export const GET = GET_BY_ID;
export { PATCH, DELETE };
