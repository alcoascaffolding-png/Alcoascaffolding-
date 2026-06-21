import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { PurchaseInvoiceDetail } from "@/components/domain/purchases/PurchaseInvoiceDetail";

export const metadata = { title: "Purchase Invoice" };

export default async function PurchaseInvoiceDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <PurchaseInvoiceDetail id={id} />
    </Suspense>
  );
}
