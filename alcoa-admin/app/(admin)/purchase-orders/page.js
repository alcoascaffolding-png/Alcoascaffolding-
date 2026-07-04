import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseOrdersClient } from "@/components/domain/purchases/PurchaseOrdersClient";

export const metadata = { title: "Purchase Orders" };

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage vendor purchase orders"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <PurchaseOrdersClient />
      </Suspense>
    </div>
  );
}
