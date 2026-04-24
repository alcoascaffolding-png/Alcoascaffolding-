import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomersClient } from "@/components/domain/customers/CustomersClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer database</p>
        </div>
        <Link href="/customers/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
        <CustomersClient />
      </Suspense>
    </div>
  );
}
