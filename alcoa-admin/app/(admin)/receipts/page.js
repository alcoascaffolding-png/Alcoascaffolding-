import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { ReceiptsClient } from "@/components/domain/accounts/ReceiptsClient";
export const metadata = { title: "Receipts" };
export default function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Receipts</h1><p className="text-sm text-muted-foreground">Track customer payments received</p></div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}><ReceiptsClient /></Suspense>
    </div>
  );
}
