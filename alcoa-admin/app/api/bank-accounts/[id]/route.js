import { createDetailHandlers } from "@/lib/crud-factory";
const { GET, PATCH, DELETE } = createDetailHandlers(() => import("@/models/BankAccount"), "Bank Account", "bank-accounts");
export { GET, PATCH, DELETE };
