"use client";

import { Inbox, Package, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  default: Inbox,
  products: Package,
  documents: FileText,
  customers: Users,
};

export function EmptyState({
  icon = "default",
  title = "No records found",
  description,
  action,
  className,
  compact = false,
}) {
  const Icon = ICONS[icon] || ICONS.default;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-8 px-3 gap-2" : "py-12 px-4",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted/60",
          compact ? "h-10 w-10" : "h-14 w-14"
        )}
      >
        <Icon
          className={cn("text-muted-foreground/70", compact ? "h-5 w-5" : "h-7 w-7")}
          aria-hidden
        />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
          {title}
        </p>
        {description ? (
          <p className={cn("text-muted-foreground", compact ? "text-[11px]" : "text-xs")}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={compact ? "pt-1" : "pt-2"}>{action}</div> : null}
    </div>
  );
}
