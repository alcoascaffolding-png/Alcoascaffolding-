import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDetail } from "@/components/domain/customers/CustomerDetail";

export const metadata = { title: "Customer Details" };

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <CustomerDetail id={id} />
    </Suspense>
  );
}
