"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  primary: {
    icon: "text-primary",
    bg: "bg-primary/10",
  },
  success: {
    icon: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  warning: {
    icon: "text-chart-2 dark:text-orange-300",
    bg: "bg-chart-2/10",
  },
  danger: {
    icon: "text-red-600 dark:text-red-400",
    bg: "bg-destructive/10",
  },
  accent: {
    icon: "text-brand-accent",
    bg: "bg-primary/10",
  },
};

/**
 * Unified KPI / stat card used on dashboard and list pages.
 */
export function MetricCard({
  title,
  value,
  description,
  subtitle,
  icon: Icon,
  color = "primary",
  href,
  valueClassName,
  variant = "default",
  className,
}) {
  const palette = COLOR_MAP[color] || COLOR_MAP.primary;
  const sub = description ?? subtitle;

  const body =
    variant === "compact" ? (
      <Card className={cn("h-full border-border/80 shadow-sm", className)}>
        <CardContent className="p-4">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className={cn("mt-1 font-bold tabular-nums", valueClassName ?? "text-2xl")}>{value}</p>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        </CardContent>
      </Card>
    ) : (
      <Card className={cn("h-full border-border/80 shadow-sm", className)}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground leading-snug pr-2">
            {title}
          </CardTitle>
          {Icon ? (
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                palette.bg
              )}
            >
              <Icon className={cn("h-4 w-4", palette.icon)} aria-hidden />
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="pt-0">
          <div className={cn("text-2xl font-bold tracking-tight tabular-nums", valueClassName)}>
            {value}
          </div>
          {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
        </CardContent>
      </Card>
    );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {body}
      </Link>
    );
  }

  return body;
}
