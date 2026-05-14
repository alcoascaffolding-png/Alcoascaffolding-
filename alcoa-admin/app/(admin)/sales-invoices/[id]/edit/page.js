import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { SalesInvoiceFormPage } from "@/components/domain/sales/SalesInvoiceFormPage";

export const metadata = { title: "Edit Sales Invoice" };

export default async function EditSalesInvoicePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <SalesInvoiceFormPage id={id} />
    </Suspense>
  );
}
