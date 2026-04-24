import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PurchaseOrdersClient } from "@/components/domain/purchases/PurchaseOrdersClient";
export const metadata = { title: "Purchase Orders" };
export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1><p className="text-sm text-muted-foreground">Manage vendor purchase orders</p></div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}><PurchaseOrdersClient /></Suspense>
    </div>
  );
}
