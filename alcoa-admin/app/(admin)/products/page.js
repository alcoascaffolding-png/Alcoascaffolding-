import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { ProductsClient } from "@/components/domain/products/ProductsClient";

export const metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your scaffolding products and equipment inventory"
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ProductsClient />
      </Suspense>
    </div>
  );
}
