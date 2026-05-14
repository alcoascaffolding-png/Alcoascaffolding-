"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { DocumentDetailToolbar } from "@/components/domain/documents/DocumentDetailToolbar";
import { useDocumentDetailOutbound } from "@/hooks/use-document-detail-outbound";
import { SalesOrderStatusChanger } from "@/components/domain/sales/SalesOrderStatusChanger";

export function SalesOrderDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["sales-orders", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const {
    showWhatsApp,
    sending,
    downloadPdf,
    sendEmail,
    sendWhatsApp,
    copyWhatsAppLink,
  } = useDocumentDetailOutbound({
    id,
    apiBase: "/api/sales-orders",
    listQueryKey: ["sales-orders"],
    detailQueryKey: ["sales-orders", "detail", id],
    document: order,
    numberField: "orderNumber",
    statsQueryKey: ["sales-orders-stats"],
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-orders-stats"] });
      toast.success("Sales order deleted");
      router.push("/sales-orders");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const o = order;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{o.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">{o.customerName}</p>
          </div>
          <SalesOrderStatusChanger
            id={id}
            value={o.status}
            detailQueryKey={["sales-orders", "detail", id]}
          />
        </div>
        <DocumentDetailToolbar
          sending={sending}
          showWhatsApp={showWhatsApp}
          hasEmail={!!o.customerEmail}
          hasPhone={!!o.customerPhone}
          onDownloadPdf={downloadPdf}
          onSendEmail={sendEmail}
          onSendWhatsApp={sendWhatsApp}
          onCopyWhatsAppLink={copyWhatsAppLink}
          onEdit={() => router.push(`/sales-orders/${id}/edit`)}
          onDelete={() => setShowDelete(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium">#</th>
                      <th className="text-left py-2 pr-4 font-medium">Description</th>
                      <th className="text-right py-2 pr-4 font-medium">Qty</th>
                      <th className="text-right py-2 pr-4 font-medium">Rate</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {o.items?.map((item, i) => (
                      <tr key={item._id || i} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-2.5 pr-4 font-medium">{item.description}</td>
                        <td className="py-2.5 pr-4 text-right">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2.5 text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="my-4" />
              <div className="flex flex-col items-end gap-2 text-sm">
                <div className="flex gap-8 w-full max-w-xs justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(o.subtotal)}</span>
                </div>
                <div className="flex gap-8 w-full max-w-xs justify-between">
                  <span className="text-muted-foreground">VAT</span>
                  <span>{formatCurrency(o.vatAmount)}</span>
                </div>
                <Separator className="w-full max-w-xs" />
                <div className="flex gap-8 w-full max-w-xs justify-between font-bold text-base">
                  <span>Total ({o.currency})</span>
                  <span className="text-primary">{formatCurrency(o.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {o.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{o.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order date</span>
                <span>{formatDate(o.orderDate)}</span>
              </div>
              {o.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatDate(o.deliveryDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {o.quotation && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Linked quotation</CardTitle>
                {typeof o.quotation === "object" && o.quotation.status != null && (
                  <Badge variant="secondary" className="text-xs font-normal capitalize">
                    {String(o.quotation.status).replace(/_/g, " ")}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-mono font-medium">
                  {typeof o.quotation === "object" ? o.quotation.quoteNumber : "—"}
                </p>
                {typeof o.quotation === "object" && o.quotation.customerName && (
                  <p className="text-muted-foreground">{o.quotation.customerName}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => {
                    const qid =
                      typeof o.quotation === "object" && o.quotation._id != null
                        ? String(o.quotation._id)
                        : String(o.quotation);
                    router.push(`/quotations/${qid}`);
                  }}
                >
                  View quotation
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{o.customerName}</p>
              {o.customerEmail && <p className="text-muted-foreground">{o.customerEmail}</p>}
              {o.customerPhone && <p className="text-muted-foreground">{o.customerPhone}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {o.orderNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMut.mutate()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
