import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { QuotationsClient } from "@/components/domain/quotations/QuotationsClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Quotations" };

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Create and manage customer quotations"
        actions={
          <Link href="/quotations/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Quotation
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <QuotationsClient />
      </Suspense>
    </div>
  );
}
