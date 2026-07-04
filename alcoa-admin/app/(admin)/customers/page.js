import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { CustomersClient } from "@/components/domain/customers/CustomersClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer database"
        actions={
          <Link href="/customers/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <CustomersClient />
      </Suspense>
    </div>
  );
}
