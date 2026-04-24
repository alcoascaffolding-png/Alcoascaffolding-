import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationDetail } from "@/components/domain/quotations/QuotationDetail";

export const metadata = { title: "Quotation Details" };

export default async function QuotationDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <QuotationDetail id={id} />
    </Suspense>
  );
}
