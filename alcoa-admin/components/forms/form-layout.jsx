import { cn } from "@/lib/utils";

/**
 * Grouped section for add/edit dialogs.
 */
export function FormSection({ title, description, children, className }) {
  return (
    <section
      className={cn(
        "space-y-4 border-b border-border/70 pb-8 last:border-b-0 last:pb-0",
        className
      )}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export function FormGrid({ children, cols = 2, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-5",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FormGridFull({ children, className }) {
  return <div className={cn("col-span-1 md:col-span-2", className)}>{children}</div>;
}
