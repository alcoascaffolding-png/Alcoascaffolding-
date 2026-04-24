import { createStatsHandler } from "@/lib/crud-factory";
export const { GET } = createStatsHandler(() => import("@/models/PurchaseOrder"));
