import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductsClient } from "@/components/domain/products/ProductsClient";
import { Plus } from "lucide-react";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">Manage your scaffolding products and equipment inventory</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
