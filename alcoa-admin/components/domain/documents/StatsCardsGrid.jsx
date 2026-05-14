"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * @param {{ label: string; value: React.ReactNode; valueClassName?: string; subtitle?: React.ReactNode }[]} items
 */
export function StatsCardsGrid({ items }) {
  if (!items?.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {items.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("font-bold", s.valueClassName ?? "text-2xl")}>{s.value}</p>
            {s.subtitle != null && s.subtitle !== "" && (
              <p className="text-xs text-muted-foreground mt-1">{s.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
