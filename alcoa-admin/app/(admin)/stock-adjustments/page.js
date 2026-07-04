import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { StockAdjustmentsClient } from "@/components/domain/inventory/StockAdjustmentsClient";

export const metadata = { title: "Stock Adjustments" };

export default function StockAdjustmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Record inventory stock changes"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <StockAdjustmentsClient />
      </Suspense>
    </div>
  );
}
