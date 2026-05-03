import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
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
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
