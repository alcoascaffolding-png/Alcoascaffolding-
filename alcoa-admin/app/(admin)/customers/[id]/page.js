import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { CustomerDetail } from "@/components/domain/customers/CustomerDetail";

export const metadata = { title: "Customer Details" };

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <CustomerDetail id={id} />
    </Suspense>
  );
}
