import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { DeliveryNotesClient } from "@/components/domain/delivery/DeliveryNotesClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Delivery Notes" };

export default function DeliveryNotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Delivery Notes</h1>
          <p className="text-sm text-muted-foreground">
            Delivery documents for drivers and gate security (no pricing)
          </p>
        </div>
        <Link href="/delivery-notes/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Delivery Note
          </Button>
        </Link>
      </div>
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <DeliveryNotesClient />
      </Suspense>
    </div>
  );
}
