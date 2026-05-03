import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { StockAdjustmentsClient } from "@/components/domain/inventory/StockAdjustmentsClient";
export const metadata = { title: "Stock Adjustments" };
export default function StockAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Stock Adjustments</h1><p className="text-sm text-muted-foreground">Record inventory stock changes</p></div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}><StockAdjustmentsClient /></Suspense>
    </div>
  );
}
