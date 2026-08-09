"use client";

import { DocumentStatusChanger } from "@/components/domain/documents/DocumentStatusChanger";
import { cn, isQuotationDerivedExpired } from "@/lib/utils";

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

/** Shorter labels for table cells. */
const COMPACT_LABELS = {
  converted: "Converted",
  converted_to_sales_order: "Converted · SO",
  converted_to_invoice: "Converted · Invoice",
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
  converted_to_sales_order: "bg-emerald-600",
  converted_to_invoice: "bg-purple-600",
};

const COMPACT_TEXT = {
  converted: "text-emerald-700 dark:text-emerald-400",
  converted_to_sales_order: "text-emerald-700 dark:text-emerald-400",
  converted_to_invoice: "text-purple-700 dark:text-purple-300",
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
  validUntil,
  size,
  detailQueryKey,
  listQueryKey = ["quotations"],
  statsQueryKey = ["quotations-stats"],
}) {
  const compact = size === "sm";

  // Derived-expired: still-open status (draft/sent/viewed) past its Valid Until
  // day. Show an "Expired" treatment while keeping the real editable value.
  const derivedExpired = isQuotationDerivedExpired({ status: value, validUntil });

  if (LOCKED_STATUSES.has(value)) {
    const label = compact
      ? COMPACT_LABELS[value] || DISPLAY_LABELS[value]
      : DISPLAY_LABELS[value] || value;
    const title = DISPLAY_LABELS[value] || value;

    if (compact) {
      return (
        <span
          title={`${title} — set by Convert (not editable here)`}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 px-1.5 text-xs font-medium whitespace-nowrap",
            COMPACT_TEXT[value] || "text-muted-foreground"
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DISPLAY_DOTS[value])}
          />
          {label}
        </span>
      );
    }

    const lockedTone =
      value === "converted_to_invoice"
        ? "border-purple-400/70 bg-purple-50 text-purple-950 dark:border-purple-500/50 dark:bg-purple-950/40 dark:text-purple-100"
        : "border-emerald-600/70 bg-emerald-50 text-emerald-950 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100";

    return (
      <span
        title="Set by Convert to Sales Order / Invoice — not editable here"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold shadow-sm whitespace-nowrap",
          lockedTone
        )}
      >
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full ring-2 ring-white/80",
            DISPLAY_DOTS[value] || "bg-muted-foreground"
          )}
        />
        {label}
      </span>
    );
  }

  return (
    <DocumentStatusChanger
      id={id}
      value={value}
      apiBase="/api/quotations"
      options={optionsForValue(value)}
      size={size}
      displayOverride={
        derivedExpired
          ? { label: "Expired", dotClassName: "bg-amber-500", toneValue: "expired" }
          : undefined
      }
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
