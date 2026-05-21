"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

export const INVOICE_PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid", dotClassName: "bg-amber-500" },
  { value: "partially_paid", label: "Partially Paid", dotClassName: "bg-sky-500" },
  { value: "paid", label: "Paid", dotClassName: "bg-emerald-500" },
  { value: "overdue", label: "Overdue", dotClassName: "bg-destructive" },
  { value: "cancelled", label: "Cancelled", dotClassName: "bg-muted-foreground" },
];

export function InvoicePaymentStatusChanger({
  id,
  value,
  size,
  detailQueryKey,
  listQueryKey = ["sales-invoices"],
  statsQueryKey = ["sales-invoices-stats"],
}) {
  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      field="paymentStatus"
      apiBase="/api/sales-invoices"
      options={INVOICE_PAYMENT_STATUS_OPTIONS}
      size={size}
      detailQueryKey={detailQueryKey}
      listQueryKey={listQueryKey}
      statsQueryKey={statsQueryKey}
    />
  );
}
