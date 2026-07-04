import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { ReceiptsClient } from "@/components/domain/accounts/ReceiptsClient";

export const metadata = { title: "Receipts" };

export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Track customer payments received"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ReceiptsClient />
      </Suspense>
    </div>
  );
}
