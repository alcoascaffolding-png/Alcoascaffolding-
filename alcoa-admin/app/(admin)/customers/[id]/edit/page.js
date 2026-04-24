import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerForm } from "@/components/domain/customers/CustomerForm";

export const metadata = { title: "Edit Customer" };

export default async function EditCustomerPage({ params }) {
  const { id } = await params;

  return (
    <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
      <CustomerForm customerId={id} />
    </Suspense>
  );
}