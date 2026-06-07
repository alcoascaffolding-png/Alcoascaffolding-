import { DeliveryNoteDetail } from "@/components/domain/delivery/DeliveryNoteDetail";

export const metadata = { title: "Delivery Note" };

export default async function DeliveryNoteDetailPage({ params }) {
  const { id } = await params;
  return <DeliveryNoteDetail id={id} />;
}
