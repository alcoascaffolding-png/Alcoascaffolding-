import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorsClient } from "@/components/domain/vendors/VendorsClient";
export const metadata = { title: "Vendors" };
export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Vendors</h1><p className="text-sm text-muted-foreground">Manage your supplier relationships</p></div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}><VendorsClient /></Suspense>
    </div>
  );
}
