import { cn } from "@/lib/utils";

/**
 * Groups dashboard blocks with a consistent section heading.
 */
export function DashboardSection({ title, description, action, children, className }) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            ) : null}
          </div>
          {action ? <div className="flex flex-wrap items-center gap-3 shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
