import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseOrdersClient } from "@/components/domain/purchases/PurchaseOrdersClient";
export const metadata = { title: "Purchase Orders" };
export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1><p className="text-sm text-muted-foreground">Manage vendor purchase orders</p></div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}><PurchaseOrdersClient /></Suspense>
    </div>
  );
}
