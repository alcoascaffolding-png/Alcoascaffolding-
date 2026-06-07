import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { DeliveryNoteFormPage } from "@/components/domain/delivery/DeliveryNoteFormPage";

export const metadata = { title: "Edit Delivery Note" };

export default async function EditDeliveryNotePage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <DeliveryNoteFormPage id={id} />
    </Suspense>
  );
}
