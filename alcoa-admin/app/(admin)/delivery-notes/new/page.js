import { Suspense } from "react";
import { RouteLoadingView } from "@/components/loading/loading-kit";
import { DeliveryNoteFormPage } from "@/components/domain/delivery/DeliveryNoteFormPage";

export const metadata = { title: "New Delivery Note" };

export default function NewDeliveryNotePage() {
  return (
    <Suspense fallback={<RouteLoadingView variant="embedded" />}>
      <DeliveryNoteFormPage />
    </Suspense>
  );
}
