"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Download, Mail, MessageSquare, Loader2 } from "lucide-react";
import { formatDate, formatCurrency, isFeatureEnabled, isLocalCalendarDayBeforeToday } from "@/lib/utils";

const STATUS_MAP = {
  draft: "outline", sent: "info", viewed: "secondary", approved: "success",
  rejected: "destructive", expired: "warning", converted: "success",
};

export function QuotationDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [sending, setSending] = useState(null);

  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ["quotations", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/quotations/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation deleted");
      router.push("/quotations");
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleDownloadPDF() {
    setSending("pdf");
    try {
      const res = await fetch(`/api/quotations/${id}/pdf`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quotation.quoteNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Failed: " + e.message);
    } finally {
      setSending(null);
    }
  }

  async function handleSendEmail() {
    setSending("email");
    try {
      const res = await fetch(`/api/quotations/${id}/send-email`, { method: "POST" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast.success("Quotation emailed to " + quotation.customerEmail);
      qc.invalidateQueries({ queryKey: ["quotations", "detail", id] });
    } catch (e) {
      toast.error("Failed: " + e.message);
    } finally {
      setSending(null);
    }
  }

  if (isLoading) return <div className="h-96 bg-muted animate-pulse rounded-lg" />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const q = quotation;

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/quotations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{q.quoteNumber}</h1>
            <p className="text-sm text-muted-foreground">{q.customerName}</p>
          </div>
          <Badge variant={STATUS_MAP[q.status] || "outline"}>{q.status}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={sending === "pdf"}>
            {sending === "pdf" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail} disabled={sending === "email" || !q.customerEmail}>
            {sending === "email" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
            Email
          </Button>
          {isFeatureEnabled("whatsapp") && (
            <Button variant="outline" size="sm" disabled={!q.customerPhone}>
              <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/quotations/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items table */}
          <Card>
            <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
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
                    {q.items?.map((item, i) => (
                      <tr key={item._id || i} className="border-b last:border-0">
                        <td className="py-2.5 pr-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-2.5 pr-4">
                          <p className="font-medium">{item.equipmentType}</p>
                          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                        </td>
                        <td className="py-2.5 pr-4 text-right">{item.quantity} {item.unit}</td>
                        <td className="py-2.5 pr-4 text-right">{formatCurrency(item.ratePerUnit)}</td>
                        <td className="py-2.5 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />
              <div className="flex flex-col items-end gap-2 text-sm">
                <div className="flex gap-8 w-full max-w-xs justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(q.subtotal)}</span>
                </div>
                {q.deliveryCharges > 0 && (
                  <div className="flex gap-8 w-full max-w-xs justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatCurrency(q.deliveryCharges)}</span>
                  </div>
                )}
                {q.discount > 0 && (
                  <div className="flex gap-8 w-full max-w-xs justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>- {formatCurrency(q.discount)}</span>
                  </div>
                )}
                <div className="flex gap-8 w-full max-w-xs justify-between">
                  <span className="text-muted-foreground">VAT ({q.vatPercentage}%)</span>
                  <span>{formatCurrency(q.vatAmount)}</span>
                </div>
                <Separator className="w-full max-w-xs" />
                <div className="flex gap-8 w-full max-w-xs justify-between font-bold text-base">
                  <span>Total ({q.currency})</span>
                  <span className="text-primary">{formatCurrency(q.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {q.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{q.notes}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Quote Date</span><span>{formatDate(q.quoteDate)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valid Until</span>
                <span
                  className={
                    isLocalCalendarDayBeforeToday(q.validUntil) && !["approved", "converted"].includes(q.status)
                      ? "text-destructive font-medium"
                      : ""
                  }
                >
                  {formatDate(q.validUntil)}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quote Type</span><span className="capitalize">{q.quoteType}</span></div>
              {q.paymentTerms && <div className="flex justify-between"><span className="text-muted-foreground">Payment Terms</span><span>{q.paymentTerms}</span></div>}
              {q.deliveryTerms && <div className="flex justify-between"><span className="text-muted-foreground">Delivery Terms</span><span className="text-right max-w-[150px]">{q.deliveryTerms}</span></div>}
              {q.salesExecutive && <div className="flex justify-between"><span className="text-muted-foreground">Sales Executive</span><span>{q.salesExecutive}</span></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{q.customerName}</p>
              {q.customerEmail && <p className="text-muted-foreground">{q.customerEmail}</p>}
              {q.customerPhone && <p className="text-muted-foreground">{q.customerPhone}</p>}
              {q.customerAddress && <p className="text-muted-foreground text-xs">{q.customerAddress}</p>}
            </CardContent>
          </Card>

          {q.bankDetails?.accountNumber && (
            <Card>
              <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {q.bankDetails.bankName && <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span>{q.bankDetails.bankName}</span></div>}
                {q.bankDetails.accountName && <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span>{q.bankDetails.accountName}</span></div>}
                {q.bankDetails.accountNumber && <div className="flex justify-between"><span className="text-muted-foreground">Acc No.</span><span>{q.bankDetails.accountNumber}</span></div>}
                {q.bankDetails.iban && <div className="flex justify-between"><span className="text-muted-foreground">IBAN</span><span className="text-xs">{q.bankDetails.iban}</span></div>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {q.quoteNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate()} className="bg-destructive hover:bg-destructive/90 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
