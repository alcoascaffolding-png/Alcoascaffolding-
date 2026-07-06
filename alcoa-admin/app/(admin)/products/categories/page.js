import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { ModuleCategoriesClient } from "@/components/domain/categories/CategoriesClient";

export const metadata = { title: "Product Categories" };

export default function ProductCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        description="Manage categories for your inventory products. Changes apply immediately to product forms and imports."
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ModuleCategoriesClient moduleType="product" />
      </Suspense>
    </div>
  );
}
