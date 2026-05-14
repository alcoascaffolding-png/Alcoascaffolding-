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
 * @param {"sm"|"default"} [props.size]
 * @param {Array<unknown>} [props.detailQueryKey]
 * @param {Array<unknown>} props.listQueryKey
 * @param {Array<unknown>} [props.statsQueryKey]
 * @param {Array<unknown>[]} [props.extraInvalidateQueryKeys]  Additional query keys to invalidate (e.g. form pickers).
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
}) {
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: async (next) => {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: next }),
      });
      const d = await res.json();
      if (!d.success) {
        const msg = typeof d.error === "string" ? d.error : d.error?.message || "Failed";
        throw new Error(msg);
      }
      return d.data;
    },
    onSuccess: () => {
      if (detailQueryKey) qc.invalidateQueries({ queryKey: detailQueryKey });
      if (listQueryKey) qc.invalidateQueries({ queryKey: listQueryKey });
      if (statsQueryKey) qc.invalidateQueries({ queryKey: statsQueryKey });
      for (const key of extraInvalidateQueryKeys) {
        if (key?.length) qc.invalidateQueries({ queryKey: key });
      }
      toast.success(successMessage);
    },
    onError: (e) => toast.error(e.message),
  });

  const triggerSizeCls = size === "sm" ? "h-8 px-2 py-1 text-xs w-[150px]" : "h-9 w-[160px]";
  const currentDot = options.find((o) => o.value === value)?.dotClassName || "bg-muted-foreground";

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v && v !== value) mut.mutate(v);
      }}
      disabled={mut.isPending}
    >
      <SelectTrigger className={triggerSizeCls}>
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${currentDot}`} />
          {mut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <SelectValue />}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${opt.dotClassName || "bg-muted-foreground"}`} />
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
