import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesInvoicesClient } from "@/components/domain/sales/SalesInvoicesClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Tax Invoices" };

export default function SalesInvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Invoices"
        description="Manage customer billing and payments"
        actions={
          <Link href="/sales-invoices/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Tax Invoice
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <SalesInvoicesClient />
      </Suspense>
    </div>
  );
}
