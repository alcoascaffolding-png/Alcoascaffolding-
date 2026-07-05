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
}) {
  const Icon = ICONS[icon] || ICONS.default;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 px-4 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
        <Icon className="h-7 w-7 text-muted-foreground/70" aria-hidden />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
