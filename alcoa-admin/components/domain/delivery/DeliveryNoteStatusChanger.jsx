"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

export const DELIVERY_NOTE_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", dotClassName: "bg-muted-foreground" },
  { value: "ready", label: "Ready", dotClassName: "bg-sky-500" },
  { value: "dispatched", label: "Dispatched", dotClassName: "bg-amber-500" },
  { value: "in_transit", label: "In Transit", dotClassName: "bg-orange-500" },
  { value: "delivered", label: "Delivered", dotClassName: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", dotClassName: "bg-destructive" },
];

export function DeliveryNoteStatusChanger({
  id,
  value,
  size,
  detailQueryKey,
  listQueryKey = ["delivery-notes"],
  statsQueryKey = ["delivery-notes-stats"],
}) {
  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      apiBase="/api/delivery-notes"
      options={DELIVERY_NOTE_STATUS_OPTIONS}
      size={size}
      detailQueryKey={detailQueryKey}
      listQueryKey={listQueryKey}
      statsQueryKey={statsQueryKey}
    />
  );
}
