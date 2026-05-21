import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesOrderFormPage } from "@/components/domain/sales/SalesOrderFormPage";

export const metadata = { title: "Edit Sales Order" };

export default async function EditSalesOrderPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <SalesOrderFormPage id={id} />
    </Suspense>
  );
}
