import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { VendorsClient } from "@/components/domain/vendors/VendorsClient";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage your supplier relationships"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <VendorsClient />
      </Suspense>
    </div>
  );
}
