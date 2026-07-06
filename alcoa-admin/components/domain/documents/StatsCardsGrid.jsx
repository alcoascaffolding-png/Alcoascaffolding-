"use client";

import { MetricCard } from "@/components/ui/metric-card";

/**
 * @param {{ label: string; value: React.ReactNode; valueClassName?: string; subtitle?: React.ReactNode; href?: string }[]} items
 */
export function StatsCardsGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {items.map((s) => (
        <MetricCard
          key={s.label}
          title={s.label}
          value={s.value}
          subtitle={s.subtitle}
          valueClassName={s.valueClassName}
          href={s.href}
          variant="compact"
        />
      ))}
    </div>
  );
}
