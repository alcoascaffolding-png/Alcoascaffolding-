import { createListHandlers } from "@/lib/crud-factory";
const { GET, POST } = createListHandlers(() => import("@/models/BankAccount"), "Bank Account");
export { GET, POST };
