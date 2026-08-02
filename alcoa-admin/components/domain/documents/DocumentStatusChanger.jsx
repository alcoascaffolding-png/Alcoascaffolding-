"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Detail-page trigger: clear color fill so status stands out. */
const STATUS_TRIGGER_TONES = {
  draft:
    "border-slate-300 bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
  sent: "border-sky-400/70 bg-sky-50 text-sky-950 shadow-sm hover:bg-sky-100/80 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-100",
  viewed:
    "border-violet-400/70 bg-violet-50 text-violet-950 shadow-sm hover:bg-violet-100/80 dark:border-violet-500/50 dark:bg-violet-950/40 dark:text-violet-100",
  accepted:
    "border-emerald-500/80 bg-emerald-50 text-emerald-950 shadow-sm hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  approved:
    "border-emerald-500/80 bg-emerald-50 text-emerald-950 shadow-sm hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  rejected:
    "border-red-400/80 bg-red-50 text-red-950 shadow-sm hover:bg-red-100/80 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-100",
  expired:
    "border-amber-400/80 bg-amber-50 text-amber-950 shadow-sm hover:bg-amber-100/80 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-100",
  confirmed:
    "border-emerald-500/80 bg-emerald-50 text-emerald-950 shadow-sm hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  in_progress:
    "border-sky-400/70 bg-sky-50 text-sky-950 shadow-sm hover:bg-sky-100/80 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-100",
  delivered:
    "border-emerald-600/70 bg-emerald-50 text-emerald-950 shadow-sm hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  cancelled:
    "border-slate-400 bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
  invoiced:
    "border-purple-400/70 bg-purple-50 text-purple-950 shadow-sm hover:bg-purple-100/80 dark:border-purple-500/50 dark:bg-purple-950/40 dark:text-purple-100",
  unpaid:
    "border-amber-400/80 bg-amber-50 text-amber-950 shadow-sm hover:bg-amber-100/80 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-100",
  paid: "border-emerald-500/80 bg-emerald-50 text-emerald-950 shadow-sm hover:bg-emerald-100/90 dark:border-emerald-500/50 dark:bg-emerald-950/40 dark:text-emerald-100",
  partially_paid:
    "border-sky-400/70 bg-sky-50 text-sky-950 shadow-sm hover:bg-sky-100/80 dark:border-sky-500/50 dark:bg-sky-950/40 dark:text-sky-100",
  overdue:
    "border-red-400/80 bg-red-50 text-red-950 shadow-sm hover:bg-red-100/80 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-100",
  default:
    "border-border bg-card text-foreground shadow-sm hover:bg-muted/60 dark:bg-card",
};

/** Table / compact: text + dot only — no bulky pills. */
const STATUS_TEXT_TONES = {
  draft: "text-slate-600 dark:text-slate-300",
  sent: "text-sky-700 dark:text-sky-300",
  viewed: "text-violet-700 dark:text-violet-300",
  accepted: "text-emerald-700 dark:text-emerald-400",
  approved: "text-emerald-700 dark:text-emerald-400",
  rejected: "text-red-700 dark:text-red-400",
  expired: "text-amber-700 dark:text-amber-400",
  confirmed: "text-emerald-700 dark:text-emerald-400",
  in_progress: "text-sky-700 dark:text-sky-300",
  delivered: "text-emerald-700 dark:text-emerald-400",
  cancelled: "text-slate-500 dark:text-slate-400",
  invoiced: "text-purple-700 dark:text-purple-300",
  unpaid: "text-amber-700 dark:text-amber-400",
  paid: "text-emerald-700 dark:text-emerald-400",
  partially_paid: "text-sky-700 dark:text-sky-300",
  overdue: "text-red-700 dark:text-red-400",
  default: "text-foreground",
};

function triggerToneFor(value, size) {
  if (size === "sm") {
    return cn(
      "border-transparent bg-transparent shadow-none hover:bg-muted/60 focus:ring-1 focus:ring-offset-0",
      STATUS_TEXT_TONES[value] || STATUS_TEXT_TONES.default
    );
  }
  return STATUS_TRIGGER_TONES[value] || STATUS_TRIGGER_TONES.default;
}

/**
 * Generic, presentational status picker for any document with a single
 * editable status field. Pass the API base, a list of options, and which
 * caches to invalidate.
 *
 * @param {object} props
 * @param {string} props.id           Mongo id of the document.
 * @param {string} props.value        Current status value.
 * @param {string} [props.field]      Field name on the document (default: "status").
 * @param {string} props.apiBase      e.g. "/api/quotations".
 * @param {Array<{value:string,label:string,dotClassName?:string}>} props.options
 * @param {"sm"|"default"} [props.size]  `sm` = minimal table style; `default` = detail page.
 * @param {Array<unknown>} [props.detailQueryKey]
 * @param {Array<unknown>} props.listQueryKey
 * @param {Array<unknown>} [props.statsQueryKey]
 * @param {Array<unknown>[]} [props.extraInvalidateQueryKeys]  Additional query keys to invalidate (e.g. form pickers).
 * @param {(data: unknown) => string} [props.getSuccessMessage]  Optional toast message from API response.
 */
export function DocumentStatusChanger({
  id,
  value,
  field = "status",
  apiBase,
  options,
  size = "default",
  detailQueryKey,
  listQueryKey,
  statsQueryKey,
  successMessage = "Status updated",
  extraInvalidateQueryKeys = [],
  getSuccessMessage,
}) {
  const qc = useQueryClient();
  const compact = size === "sm";

  const mut = useMutation({
    mutationFn: async (next) => {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      const d = await res.json();
      if (!d.success) {
        const msg =
          typeof d.error === "string"
            ? d.error
            : d.error?.message || "Failed";
        const detail =
          Array.isArray(d.details) && d.details.length ? `: ${d.details.join("; ")}` : "";
        throw new Error(`${msg}${detail}`);
      }
      return d.data;
    },
    onSuccess: (data) => {
      if (detailQueryKey) qc.invalidateQueries({ queryKey: detailQueryKey });
      if (listQueryKey) qc.invalidateQueries({ queryKey: listQueryKey });
      if (statsQueryKey) qc.invalidateQueries({ queryKey: statsQueryKey });
      for (const key of extraInvalidateQueryKeys) {
        if (key?.length) qc.invalidateQueries({ queryKey: key });
      }
      const msg = getSuccessMessage?.(data) ?? successMessage;
      toast.success(msg);
    },
    onError: (e) => toast.error(e.message),
  });

  const current = options.find((o) => o.value === value);
  const currentDot = current?.dotClassName || "bg-muted-foreground";
  const currentLabel = current?.label;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v && v !== value) mut.mutate(v);
      }}
      disabled={mut.isPending}
    >
      <SelectTrigger
        className={cn(
          "w-auto max-w-full gap-1.5 [&_svg]:shrink-0",
          compact
            ? "h-7 min-w-0 border-0 px-1.5 text-xs font-medium [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:opacity-40"
            : "h-10 min-w-[168px] px-3.5 text-sm font-semibold tracking-tight shadow-sm [&_svg]:opacity-80 focus:ring-2 focus:ring-offset-1",
          triggerToneFor(value, size)
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            className={cn(
              "shrink-0 rounded-full",
              compact ? "h-1.5 w-1.5" : "h-2.5 w-2.5 ring-2 ring-white/80 dark:ring-black/20",
              currentDot
            )}
          />
          {mut.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="truncate whitespace-nowrap">{currentLabel || <SelectValue />}</span>
          )}
        </span>
      </SelectTrigger>
      <SelectContent
        className="min-w-[11rem] rounded-lg border-border/80 bg-popover p-1 shadow-lg"
        position="popper"
      >
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Set status
        </div>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="cursor-pointer rounded-md py-2 pl-8 pr-3 text-sm font-medium focus:bg-accent"
          >
            <span className="flex items-center gap-2.5 whitespace-nowrap">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  opt.dotClassName || "bg-muted-foreground"
                )}
              />
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
