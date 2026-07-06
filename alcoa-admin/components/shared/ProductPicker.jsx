"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { BrandSpinner } from "@/components/loading/loading-kit";

const NONE = "__none__";

function productRate(product, quoteType) {
  if (quoteType === "sales") return Number(product.sellingPrice) || 0;
  return Number(product.rentalPrice) || Number(product.sellingPrice) || 0;
}

function ProductListItem({ product, quoteType, selected, onPick }) {
  const rate = productRate(product, quoteType);
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/60",
        selected && "bg-muted/50"
      )}
      onClick={() => onPick(product)}
    >
      <Check className={cn("h-4 w-4 mt-0.5 shrink-0", selected ? "opacity-100" : "opacity-0")} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-mono text-xs text-muted-foreground">{product.itemCode}</span>
          <span className="font-medium">{product.name}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {product.currentStock ?? 0} in stock · AED {rate.toFixed(2)}
        </span>
      </span>
    </button>
  );
}

/**
 * Searchable product picker for quotation / order line items.
 */
export function ProductPicker({ value, onSelect, quoteType = "rental", disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const selectedId = value && value !== NONE ? String(value) : NONE;

  const { data: searchResults = [], isLoading: searchLoading, isFetching } = useQuery({
    queryKey: ["products", "picker", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "25",
        active: "true",
      });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data?.items ?? [];
    },
    staleTime: 30 * 1000,
    enabled: open,
  });

  const { data: selectedProduct } = useQuery({
    queryKey: ["products", "picker", "selected", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${selectedId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: selectedId !== NONE,
    staleTime: 5 * 60 * 1000,
  });

  const displayLabel =
    selectedId === NONE
      ? "Pick from catalogue"
      : selectedProduct
        ? `${selectedProduct.itemCode} — ${selectedProduct.name}`
        : "Loading product…";

  function handlePick(product) {
    onSelect(product);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="h-11 w-full justify-between rounded-lg font-normal"
        >
          <span className="truncate text-left">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(400px,calc(100vw-2rem))] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search code or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[min(280px,50vh)] overflow-y-auto p-1">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted/60"
            onClick={() => {
              onSelect(null);
              setOpen(false);
              setSearch("");
            }}
          >
            — Manual entry —
          </button>

          {searchLoading || isFetching ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <BrandSpinner size="sm" />
              Searching…
            </div>
          ) : searchResults.length ? (
            searchResults.map((p) => (
              <ProductListItem
                key={String(p._id)}
                product={p}
                quoteType={quoteType}
                selected={String(p._id) === selectedId}
                onPick={handlePick}
              />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {debouncedSearch.trim() ? "No products found." : "Type to search the catalogue."}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
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
