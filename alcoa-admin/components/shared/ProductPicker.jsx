"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const NONE = "__none__";

/**
 * Product select for quotation / order line items.
 */
export function ProductPicker({ value, onSelect, quoteType = "rental", disabled }) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "picker"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=200");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data?.items ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(
    () => (data || []).filter((p) => p.isActive !== false),
    [data]
  );

  const selectedId = value && value !== NONE ? String(value) : NONE;

  return (
    <Select
      disabled={disabled || isLoading}
      value={selectedId}
      onValueChange={(id) => {
        if (id === NONE) {
          onSelect(null);
          return;
        }
        const product = products.find((p) => String(p._id) === id);
        onSelect(product || null);
      }}
    >
      <SelectTrigger className="h-9">
        <SelectValue placeholder={isLoading ? "Loading products…" : "Pick from catalogue"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>— Manual entry —</SelectItem>
        {products.map((p) => {
          const rate =
            quoteType === "sales"
              ? Number(p.sellingPrice) || 0
              : Number(p.rentalPrice) || Number(p.sellingPrice) || 0;
          return (
            <SelectItem key={String(p._id)} value={String(p._id)}>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-mono text-xs text-muted-foreground">{p.itemCode}</span>
                <span>{p.name}</span>
                <span className="text-muted-foreground text-xs">
                  ({p.currentStock ?? 0} in stock · AED {rate.toFixed(2)})
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function StockWarningBadge({ currentStock, quantity }) {
  const stock = Number(currentStock);
  const qty = Number(quantity) || 0;
  if (!stock || stock <= 0 || qty <= stock) return null;
  return (
    <Badge variant="warning" className="text-[10px]">
      Requested {qty} — only {stock} available
    </Badge>
  );
}
