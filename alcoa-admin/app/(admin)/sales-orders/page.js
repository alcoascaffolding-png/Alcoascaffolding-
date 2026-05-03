import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesOrdersClient } from "@/components/domain/sales/SalesOrdersClient";
export const metadata = { title: "Sales Orders" };
export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Sales Orders</h1><p className="text-sm text-muted-foreground">Track and manage customer orders</p></div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}><SalesOrdersClient /></Suspense>
    </div>
  );
}
