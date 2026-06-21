"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileDown, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";

const statusColors = {
  draft: "outline",
  sent: "info",
  confirmed: "warning",
  partially_received: "warning",
  received: "success",
  cancelled: "destructive",
};

export function PurchaseOrderDetail({ id }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const { data: po, isLoading, error } = useQuery({
    queryKey: ["purchase-orders", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/purchase-orders/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const vendor =
    po.vendor && typeof po.vendor === "object" ? po.vendor : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/purchase-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{po.poNumber}</h1>
            <p className="text-sm text-muted-foreground">{po.vendorName}</p>
          </div>
          <Badge variant={statusColors[po.status] || "outline"}>
            {String(po.status || "").replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={sending}
            onClick={async () => {
              setSending(true);
              try {
                const res = await fetch(`/api/purchase-orders/${id}/send-email`, { method: "POST" });
                const d = await res.json();
                if (!d.success) throw new Error(d.error);
                toast.success(`Emailed to ${d.data?.sentTo || "vendor"}`);
              } catch (e) {
                toast.error(e.message);
              } finally {
                setSending(false);
              }
            }}
          >
            <Mail className="h-4 w-4 mr-1" />
            Email vendor
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const res = await fetch(`/api/purchase-orders/${id}/pdf`);
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}));
                  throw new Error(d.error || "PDF failed");
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${po.poNumber}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              } catch (e) {
                alert(e.message);
              }
            }}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Download PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push(`/purchase-orders?edit=${id}`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Order date: </span>
              {formatDate(po.orderDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Expected delivery: </span>
              {po.deliveryDate ? formatDate(po.deliveryDate) : "—"}
            </p>
            {vendor && (
              <p>
                <span className="text-muted-foreground">Vendor code: </span>
                <span className="font-mono">{vendor.vendorCode}</span>
              </p>
            )}
            {vendor && (
              <p>
                <Link href={`/vendors?search=${encodeURIComponent(vendor.companyName || "")}`} className="text-primary hover:underline">
                  View vendor
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amounts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Subtotal: <strong>{formatCurrency(po.subtotal || 0)}</strong>
            </p>
            <p>
              VAT: <strong>{formatCurrency(po.vatAmount || 0)}</strong>
            </p>
            <p>
              Total: <strong>{formatCurrency(po.total || 0)}</strong>
            </p>
            {po.stockApplied && (
              <p className="text-emerald-600 text-xs">Stock has been applied for received items.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {(po.items || []).map((row, i) => (
                  <tr key={row._id || i} className="border-b border-border/60">
                    <td className="py-2">{row.description}</td>
                    <td className="py-2 text-right">
                      {row.quantity} {row.unit}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatCurrency(row.unitPrice || 0)}
                    </td>
                    <td className="py-2 text-right tabular-nums font-medium">
                      {formatCurrency(row.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {po.notes && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground whitespace-pre-line">{po.notes}</p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
