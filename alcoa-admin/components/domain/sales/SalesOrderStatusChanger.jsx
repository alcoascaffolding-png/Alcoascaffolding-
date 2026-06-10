"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

export const SALES_ORDER_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", dotClassName: "bg-muted-foreground" },
  { value: "confirmed", label: "Confirmed", dotClassName: "bg-sky-500" },
  { value: "in_progress", label: "In Progress", dotClassName: "bg-amber-500" },
  { value: "delivered", label: "Delivered", dotClassName: "bg-emerald-500" },
  { value: "completed", label: "Completed", dotClassName: "bg-emerald-700" },
  { value: "invoiced", label: "Invoiced", dotClassName: "bg-primary" },
  { value: "cancelled", label: "Cancelled", dotClassName: "bg-destructive" },
];

export function SalesOrderStatusChanger({
  id,
  value,
  size,
  detailQueryKey,
  listQueryKey = ["sales-orders"],
  statsQueryKey = ["sales-orders-stats"],
}) {
  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      apiBase="/api/sales-orders"
      options={SALES_ORDER_STATUS_OPTIONS}
      size={size}
      detailQueryKey={detailQueryKey}
      listQueryKey={listQueryKey}
      statsQueryKey={statsQueryKey}
      extraInvalidateQueryKeys={[
        ["sales-orders", "sales-invoice-form"],
        ["sales-invoices"],
        ["sales-invoices-stats"],
      ]}
      getSuccessMessage={(data) => {
        const c = data?.invoicing;
        if (!c?.invoiceNumber) return "Status updated";
        if (c.created) {
          return `Invoiced — tax invoice ${c.invoiceNumber} created`;
        }
        return `Invoiced — linked to tax invoice ${c.invoiceNumber}`;
      }}
    />
  );
}
