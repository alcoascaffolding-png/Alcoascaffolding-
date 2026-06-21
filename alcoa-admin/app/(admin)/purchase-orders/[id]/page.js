import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseOrderDetail } from "@/components/domain/purchases/PurchaseOrderDetail";

export const metadata = { title: "Purchase Order" };

export default async function PurchaseOrderDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <PurchaseOrderDetail id={id} />
    </Suspense>
  );
}
