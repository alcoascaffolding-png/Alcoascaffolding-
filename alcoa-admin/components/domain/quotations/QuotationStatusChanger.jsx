"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

export const QUOTATION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", dotClassName: "bg-muted-foreground" },
  { value: "sent", label: "Sent", dotClassName: "bg-sky-500" },
  { value: "viewed", label: "Viewed", dotClassName: "bg-violet-500" },
  { value: "approved", label: "Approved", dotClassName: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", dotClassName: "bg-destructive" },
  { value: "expired", label: "Expired", dotClassName: "bg-amber-500" },
  { value: "converted", label: "Converted", dotClassName: "bg-emerald-700" },
];

export function QuotationStatusChanger({
  id,
  value,
  size,
  detailQueryKey,
  listQueryKey = ["quotations"],
  statsQueryKey = ["quotations-stats"],
}) {
  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      apiBase="/api/quotations"
      options={QUOTATION_STATUS_OPTIONS}
      size={size}
      detailQueryKey={detailQueryKey}
      listQueryKey={listQueryKey}
      statsQueryKey={statsQueryKey}
      extraInvalidateQueryKeys={[["quotations", "sales-order-form"]]}
    />
  );
}
