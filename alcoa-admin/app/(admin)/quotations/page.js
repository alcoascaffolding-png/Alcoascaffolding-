import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationsClient } from "@/components/domain/quotations/QuotationsClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Quotations" };

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="text-sm text-muted-foreground">Create and manage customer quotations</p>
        </div>
        <Link href="/quotations/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
        <QuotationsClient />
      </Suspense>
    </div>
  );
}
