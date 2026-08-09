"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { AsyncButton } from "@/components/ui/async-button";
import { mutationErrorMessage } from "@/lib/toast-messages";
import { cn } from "@/lib/utils";

/**
 * Inline Activate/Deactivate row action. Patches `isActive` on the record and
 * refreshes the list, stats, and any dependent queries. Reused across modules
 * (products, categories) so the toggle behaves and looks the same everywhere.
 */
export function StatusToggleAction({
  resource,
  item,
  label = "record",
  invalidateKeys = [],
  disabled = false,
}) {
  const qc = useQueryClient();
  const isActive = item?.isActive !== false;

  const toggleMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/${resource}/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      qc.invalidateQueries({ queryKey: [resource, "stats"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-inventory"] });
      for (const key of invalidateKeys) qc.invalidateQueries({ queryKey: key });
      toast.success(`${isActive ? "Deactivated" : "Activated"} ${label}`);
    },
    onError: (e) => toast.error(mutationErrorMessage(e)),
  });

  return (
    <AsyncButton
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      title={isActive ? `Deactivate ${label}` : `Activate ${label}`}
      loading={toggleMut.isPending}
      disabled={disabled || toggleMut.isPending}
      onClick={(e) => {
        e.stopPropagation();
        toggleMut.mutate();
      }}
    >
      {isActive ? (
        <Power className={cn("h-3.5 w-3.5 text-emerald-600")} />
      ) : (
        <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </AsyncButton>
  );
}
