import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseInvoicesClient } from "@/components/domain/purchases/PurchaseInvoicesClient";

export const metadata = { title: "Purchase Invoices" };

export default function PurchaseInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Invoices"
        description="Track vendor invoices and payments"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <PurchaseInvoicesClient />
      </Suspense>
    </div>
  );
}
