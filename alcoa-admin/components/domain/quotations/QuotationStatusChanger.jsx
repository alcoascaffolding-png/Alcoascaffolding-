"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

export const QUOTATION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", dotClassName: "bg-muted-foreground" },
  { value: "sent", label: "Sent", dotClassName: "bg-sky-500" },
  { value: "viewed", label: "Viewed", dotClassName: "bg-violet-500" },
  { value: "accepted", label: "Accepted", dotClassName: "bg-emerald-500" },
  { value: "approved", label: "Approved (legacy)", dotClassName: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", dotClassName: "bg-destructive" },
  { value: "expired", label: "Expired", dotClassName: "bg-amber-500" },
  { value: "converted_to_sales_order", label: "Converted to Sales Order", dotClassName: "bg-emerald-700" },
  { value: "converted_to_invoice", label: "Converted to Invoice", dotClassName: "bg-purple-600" },
  { value: "converted", label: "Converted (legacy)", dotClassName: "bg-emerald-700" },
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
      extraInvalidateQueryKeys={[
        ["quotations", "sales-order-form"],
        ["sales-orders"],
        ["sales-orders-stats"],
      ]}
      getSuccessMessage={(data) => {
        const c = data?.conversion;
        if (c?.type === "sales_invoice") {
          if (c.created) return `Converted — tax invoice ${c.invoiceNumber} created`;
          return `Converted — linked to tax invoice ${c.invoiceNumber}`;
        }
        if (c?.type === "sales_order") {
          if (c.created) return `Converted — sales order ${c.orderNumber} created`;
          return `Converted — linked to sales order ${c.orderNumber}`;
        }
        return "Status updated";
      }}
    />
  );
}
