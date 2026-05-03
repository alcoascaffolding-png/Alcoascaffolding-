import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { QuotationDetail } from "@/components/domain/quotations/QuotationDetail";

export const metadata = { title: "Quotation Details" };

export default async function QuotationDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <QuotationDetail id={id} />
    </Suspense>
  );
}
