import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/BankAccount"), "Bank Account");
export { GET, PATCH, DELETE };
