import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { QuotationFormPage } from "@/components/domain/quotations/QuotationFormPage";

export const metadata = { title: "Edit Quotation" };

export default async function EditQuotationPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <QuotationFormPage id={id} />
    </Suspense>
  );
}
