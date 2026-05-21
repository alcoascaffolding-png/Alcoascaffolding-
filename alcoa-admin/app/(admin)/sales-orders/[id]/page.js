import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesOrderDetail } from "@/components/domain/sales/SalesOrderDetail";

export const metadata = { title: "Sales Order" };

export default async function SalesOrderDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <SalesOrderDetail id={id} />
    </Suspense>
  );
}
