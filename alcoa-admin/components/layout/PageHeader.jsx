import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, titleClassName, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1
          className={cn(
            "text-xl sm:text-2xl font-semibold tracking-tight",
            titleClassName
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
