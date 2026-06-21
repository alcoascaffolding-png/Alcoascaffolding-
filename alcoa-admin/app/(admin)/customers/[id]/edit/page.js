import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { CustomerForm } from "@/components/domain/customers/CustomerForm";

export const metadata = { title: "Edit Customer" };
// 
export default async function EditCustomerPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <CustomerForm customerId={id} />
    </Suspense>
  );
  
}