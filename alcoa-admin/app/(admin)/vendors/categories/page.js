import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { ModuleCategoriesClient } from "@/components/domain/categories/CategoriesClient";

export const metadata = { title: "Vendor Categories" };

export default function VendorCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Categories"
        description="Manage categories for your purchase vendors. Changes apply immediately to vendor forms and imports."
      />
      <Suspense fallback={<RouteLoadingView variant="embedded" />}>
        <ModuleCategoriesClient moduleType="vendor" />
      </Suspense>
    </div>
  );
}
