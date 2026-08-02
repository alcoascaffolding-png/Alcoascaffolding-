"use client";

import { Badge } from "@/components/ui/badge";
import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";

/**
 * Statuses staff can set manually.
 * Converted statuses are set by the system when creating a sales order / invoice.
 * Legacy "approved" / "converted" still display correctly but are not offered as choices.
 */
export const QUOTATION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", dotClassName: "bg-muted-foreground" },
  { value: "sent", label: "Sent", dotClassName: "bg-sky-500" },
  { value: "viewed", label: "Viewed", dotClassName: "bg-violet-500" },
  { value: "accepted", label: "Accepted", dotClassName: "bg-emerald-500" },
  { value: "rejected", label: "Rejected", dotClassName: "bg-destructive" },
  { value: "expired", label: "Expired", dotClassName: "bg-amber-500" },
];

const DISPLAY_LABELS = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  approved: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
  converted: "Converted",
  converted_to_sales_order: "Converted to Sales Order",
  converted_to_invoice: "Converted to Invoice",
};

const DISPLAY_DOTS = {
  draft: "bg-muted-foreground",
  sent: "bg-sky-500",
  viewed: "bg-violet-500",
  accepted: "bg-emerald-500",
  approved: "bg-emerald-500",
  rejected: "bg-destructive",
  expired: "bg-amber-500",
  converted: "bg-emerald-700",
  converted_to_sales_order: "bg-emerald-700",
  converted_to_invoice: "bg-purple-600",
};

/** System-set after conversion — not editable from this dropdown. */
const LOCKED_STATUSES = new Set([
  "converted",
  "converted_to_sales_order",
  "converted_to_invoice",
]);

function optionsForValue(value) {
  // Legacy "approved" → show as Accepted in the picker so the Select has a matching value.
  if (value === "approved") {
    return QUOTATION_STATUS_OPTIONS.map((opt) =>
      opt.value === "accepted"
        ? { ...opt, value: "approved", label: "Accepted" }
        : opt
    );
  }
  return QUOTATION_STATUS_OPTIONS;
}

export function QuotationStatusChanger({
  id,
  value,
  size,
  detailQueryKey,
  listQueryKey = ["quotations"],
  statsQueryKey = ["quotations-stats"],
}) {
  if (LOCKED_STATUSES.has(value)) {
    return (
      <Badge
        variant="secondary"
        title="Set by Convert to Sales Order / Invoice — not editable here"
        className="h-9 gap-2 rounded-md border px-3 font-medium whitespace-nowrap"
      >
        <span className={`h-2 w-2 rounded-full ${DISPLAY_DOTS[value] || "bg-muted-foreground"}`} />
        {DISPLAY_LABELS[value] || value}
      </Badge>
    );
  }

  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      apiBase="/api/quotations"
      options={optionsForValue(value)}
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
