"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Package, History } from "lucide-react";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { isLowStock, isOutOfStock } from "@/lib/inventory-utils";

const SOURCE_LABELS = {
  manual: "Manual adjustment",
  product_edit: "Product form edit",
  purchase_order: "Purchase order",
  delivery_note: "Delivery note",
  stock_adjustment: "Stock adjustment",
};

function MovementRow({ row }) {
  const typeColors = {
    increase: "success",
    decrease: "destructive",
    correction: "warning",
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b last:border-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{row.adjustmentNumber}</span>
          <Badge variant={typeColors[row.adjustmentType] || "outline"} className="text-[10px]">
            {row.adjustmentType}
          </Badge>
          {row.sourceType && row.sourceType !== "manual" && (
            <Badge variant="outline" className="text-[10px]">
              {SOURCE_LABELS[row.sourceType] || row.sourceType}
            </Badge>
          )}
        </div>
        <p className="text-sm mt-1">{row.reason || "—"}</p>
        {row.sourceNumber && (
          <p className="text-xs text-muted-foreground mt-0.5">Ref: {row.sourceNumber}</p>
        )}
      </div>
      <div className="text-sm text-right shrink-0">
        <p>
          <span className="text-muted-foreground">{row.previousStock}</span>
          {" → "}
          <span className="font-semibold">{row.newStock}</span>
          {row.quantity > 0 && (
            <span className="text-muted-foreground text-xs ml-1">(±{row.quantity})</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(row.createdAt)}</p>
      </div>
    </div>
  );
}

export function ProductDetail({ id }) {
  const router = useRouter();
  const [movementPage, setMovementPage] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["products", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ["products", id, "movements", movementPage],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}/movements?page=${movementPage}&limit=15`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const p = product;
  const low = isLowStock(p);
  const out = isOutOfStock(p);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => router.push("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{p.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{p.itemCode}</p>
          </div>
          {out && <Badge variant="destructive">Out of stock</Badge>}
          {low && !out && <Badge variant="warning">Low stock</Badge>}
          {p.isActive === false && <Badge variant="secondary">Inactive</Badge>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/products")}>
            <Pencil className="h-4 w-4 mr-1" /> Edit in list
          </Button>
          <Link href={`/stock-adjustments?productId=${id}`}>
            <Button size="sm" variant="outline">Adjust stock</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Package className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-1.5">
            <History className="h-3.5 w-3.5" /> Movement history
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Current stock</p>
                <p className="text-2xl font-bold">
                  {p.currentStock ?? 0} <span className="text-sm font-normal">{p.unit}</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Min / Reorder</p>
                <p className="text-2xl font-bold">
                  {p.minStock ?? 0} / {p.reorderLevel ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Inventory value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency((p.currentStock || 0) * (p.purchasePrice || 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Purchase</span><span>{formatCurrency(p.purchasePrice || 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Selling</span><span>{formatCurrency(p.sellingPrice || 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rental/day</span><span>{formatCurrency(p.rentalPrice || 0)}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{p.category || "—"}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred vendor</span>
                  <span>
                    {p.preferredVendor?.companyName ||
                      (typeof p.preferredVendor === "string" ? p.preferredVendor : "—")}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Max stock</span><span>{p.maxStock ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{formatDate(p.createdAt)}</span></div>
                {p.description && (
                  <p className="text-muted-foreground pt-2 border-t">{p.description}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock movement history</CardTitle>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <DetailRecordSkeleton className="py-8" />
              ) : movements?.items?.length ? (
                <>
                  {movements.items.map((row) => (
                    <MovementRow key={row._id} row={row} />
                  ))}
                  {movements.pages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={movementPage <= 1}
                        onClick={() => setMovementPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Page {movementPage} of {movements.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={movementPage >= movements.pages}
                        onClick={() => setMovementPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No stock movements recorded for this product yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
