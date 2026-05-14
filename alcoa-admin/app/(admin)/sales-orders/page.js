import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesOrdersClient } from "@/components/domain/sales/SalesOrdersClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Sales Orders" };

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
        </div>
        <Link href="/sales-orders/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Sales Order
          </Button>
        </Link>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <SalesOrdersClient />
      </Suspense>
    </div>
  );
}
