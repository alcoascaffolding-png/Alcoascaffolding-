import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesInvoicesClient } from "@/components/domain/sales/SalesInvoicesClient";
export const metadata = { title: "Sales Invoices" };
export default function SalesInvoicesPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Sales Invoices</h1><p className="text-sm text-muted-foreground">Manage customer billing and payments</p></div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}><SalesInvoicesClient /></Suspense>
    </div>
  );
}
