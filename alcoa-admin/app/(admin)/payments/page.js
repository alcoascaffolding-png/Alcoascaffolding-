import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PaymentsClient } from "@/components/domain/accounts/PaymentsClient";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track vendor payments made"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <PaymentsClient />
      </Suspense>
    </div>
  );
}
