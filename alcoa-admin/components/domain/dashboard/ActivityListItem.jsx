"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Clickable row for dashboard activity feeds.
 */
export function ActivityListItem({ href, title, subtitle, trailing, className }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle ? <p className="text-xs text-muted-foreground truncate">{subtitle}</p> : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  );

  const rowClass = cn(
    "flex items-center justify-between gap-3 rounded-lg px-2 py-2 -mx-2 transition-colors",
    href && "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {inner}
      </Link>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
