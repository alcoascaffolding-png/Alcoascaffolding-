import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesOrdersClient } from "@/components/domain/sales/SalesOrdersClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Sales Orders" };

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Track and manage customer orders"
        actions={
          <Link href="/sales-orders/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Sales Order
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <SalesOrdersClient />
      </Suspense>
    </div>
  );
}
