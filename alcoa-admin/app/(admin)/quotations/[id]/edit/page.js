import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QuotationFormPage } from "@/components/domain/quotations/QuotationFormPage";

export const metadata = { title: "Edit Quotation" };

export default async function EditQuotationPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <QuotationFormPage id={id} />
    </Suspense>
  );
}
