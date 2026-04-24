import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentsClient } from "@/components/domain/accounts/PaymentsClient";
export const metadata = { title: "Payments" };
export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Payments</h1><p className="text-sm text-muted-foreground">Track vendor payments made</p></div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}><PaymentsClient /></Suspense>
    </div>
  );
}
