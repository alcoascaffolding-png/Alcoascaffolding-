import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesInvoiceDetail } from "@/components/domain/sales/SalesInvoiceDetail";

export const metadata = { title: "Tax Invoice" };

export default async function SalesInvoiceDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <SalesInvoiceDetail id={id} />
    </Suspense>
  );
}
