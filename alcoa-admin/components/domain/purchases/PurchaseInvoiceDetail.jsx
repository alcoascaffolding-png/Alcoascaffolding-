"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Banknote, FileDown, Mail } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";

const payColors = {
  unpaid: "destructive",
  partially_paid: "warning",
  paid: "success",
  overdue: "destructive",
};

export function PurchaseInvoiceDetail({ id }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const { data: inv, isLoading, error } = useQuery({
    queryKey: ["purchase-invoices", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/purchase-invoices/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const balance =
    inv.balance != null ? Number(inv.balance) : Math.max(0, (inv.total || 0) - (inv.paidAmount || 0));
  const po =
    inv.purchaseOrder && typeof inv.purchaseOrder === "object" ? inv.purchaseOrder : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/purchase-invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{inv.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{inv.vendorName}</p>
          </div>
          <Badge variant={payColors[inv.paymentStatus] || "outline"}>
            {String(inv.paymentStatus || "").replace(/_/g, " ")}
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
                const res = await fetch(`/api/purchase-invoices/${id}/send-email`, { method: "POST" });
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
                const res = await fetch(`/api/purchase-invoices/${id}/pdf`);
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}));
                  throw new Error(d.error || "PDF failed");
                }
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${inv.invoiceNumber}.pdf`;
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
          {balance > 0.01 && inv.paymentStatus !== "paid" && (
            <Link href={`/payments?invoice=${id}`}>
              <Button size="sm">
                <Banknote className="h-4 w-4 mr-1" />
                Record Payment
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Date: </span>
              {formatDate(inv.invoiceDate)}
            </p>
            <p>
              <span className="text-muted-foreground">Due: </span>
              {inv.dueDate ? formatDate(inv.dueDate) : "—"}
            </p>
            {po && (
              <p>
                <span className="text-muted-foreground">Purchase order: </span>
                <span className="font-mono">{po.poNumber}</span>
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
              Subtotal: <strong>{formatCurrency(inv.subtotal || 0)}</strong>
            </p>
            <p>
              VAT: <strong>{formatCurrency(inv.vatAmount || 0)}</strong>
            </p>
            <p>
              Total: <strong>{formatCurrency(inv.total || 0)}</strong>
            </p>
            <p>
              Paid: <strong>{formatCurrency(inv.paidAmount || 0)}</strong>
            </p>
            <p className="text-destructive font-medium">
              Balance: {formatCurrency(balance)}
            </p>
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
                {(inv.items || []).map((row, i) => (
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
          {inv.notes && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground whitespace-pre-line">{inv.notes}</p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
