import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseInvoicesClient } from "@/components/domain/purchases/PurchaseInvoicesClient";
export const metadata = { title: "Purchase Invoices" };
export default function PurchaseInvoicesPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Purchase Invoices</h1><p className="text-sm text-muted-foreground">Track vendor invoices and payments</p></div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}><PurchaseInvoicesClient /></Suspense>
    </div>
  );
}
