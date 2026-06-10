import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesInvoicesClient } from "@/components/domain/sales/SalesInvoicesClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Tax Invoices" };

export default function SalesInvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage customer billing and payments</p>
        </div>
        <Link href="/sales-invoices/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Tax Invoice
          </Button>
        </Link>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <SalesInvoicesClient />
      </Suspense>
    </div>
  );
}
