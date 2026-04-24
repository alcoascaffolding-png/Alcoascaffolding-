"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDate, formatCurrency, isFeatureEnabled } from "@/lib/utils";
import {
  MoreHorizontal, Eye, Pencil, Trash2, Download, Mail, MessageSquare, Loader2,
} from "lucide-react";

const STATUS_COLORS = {
  draft: "outline", sent: "info", viewed: "secondary", approved: "success",
  rejected: "destructive", expired: "warning", converted: "success",
};

async function fetchQuotations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/quotations?${qs}`);
  const d = await res.json();
  if (!d.success) throw new Error(d.error);
  return d.data;
}

async function fetchStats() {
  const res = await fetch("/api/quotations/stats");
  const d = await res.json();
  return d.data;
}

export function QuotationsClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  /** Quotation id currently running email / WhatsApp (string for stable compare) */
  const [sendingId, setSendingId] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => fetchQuotations(),
    refetchInterval: 60 * 1000,
  });

  const { data: stats } = useQuery({ queryKey: ["quotations-stats"], queryFn: fetchStats });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); setDeleteId(null); toast.success("Quotation deleted"); },
    onError: (e) => toast.error(e.message),
  });

  async function handleDownloadPDF(id, quoteNumber) {
    toast.info("Generating PDF…");
    try {
      const res = await fetch(`/api/quotations/${id}/pdf`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quoteNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF: " + e.message);
    }
  }

  async function handleSendEmail(id) {
    const sid = String(id);
    setSendingId(sid);
    try {
      const res = await fetch(`/api/quotations/${sid}/send-email`, { method: "POST" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast.success("Quotation emailed successfully");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    } catch (e) {
      toast.error("Failed to send email: " + e.message);
    } finally {
      setSendingId(null);
    }
  }

  async function handleSendWhatsApp(id) {
    const sid = String(id);
    setSendingId(sid);
    try {
      const res = await fetch(`/api/quotations/${sid}/send-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      toast.success("WhatsApp message sent");
      qc.invalidateQueries({ queryKey: ["quotations"] });
    } catch (e) {
      toast.error("Failed to send WhatsApp: " + e.message);
    } finally {
      setSendingId(null);
    }
  }

  const columns = [
    {
      accessorKey: "quoteNumber",
      header: "Quote #",
      cell: ({ row }) => <span className="font-mono font-medium text-sm">{row.original.quoteNumber}</span>,
      size: 130,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span>,
    },
    {
      accessorKey: "quoteDate",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.quoteDate)}</span>,
      size: 100,
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) => {
        const expired = new Date(row.original.validUntil) < new Date();
        return (
          <span className={`text-sm ${expired ? "text-destructive" : ""}`}>
            {formatDate(row.original.validUntil)}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.totalAmount || 0)}</span>,
      size: 130,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_COLORS[row.original.status] || "outline"}>
          {row.original.status}
        </Badge>
      ),
      size: 90,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const q = row.original;
        const qid = String(q._id);
        const busy = sendingId === qid;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/quotations/${qid}`); }}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/quotations/${qid}/edit`); }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownloadPDF(qid, q.quoteNumber); }}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendEmail(qid); }} disabled={busy || !q.customerEmail}>
                <Mail className="mr-2 h-4 w-4" /> {busy ? "Sending…" : "Send Email"}
              </DropdownMenuItem>
              {isFeatureEnabled("whatsapp") && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); handleSendWhatsApp(qid); }}
                  disabled={busy || !q.customerPhone}
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> {busy ? "Sending…" : "Send WhatsApp"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(qid); }} disabled={busy}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 50,
    },
  ];

  return (
    <>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-500">{(stats.draft || 0) + (stats.sent || 0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Approved</p><p className="text-2xl font-bold text-emerald-500">{stats.approved}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Value</p><p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p></CardContent></Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search quotations…"
        onRowClick={(row) => router.push(`/quotations/${String(row._id)}`)}
        emptyMessage="No quotations yet. Create your first quotation."
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open && !deleteMut.isPending) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the quotation. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMut.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => {
                e.preventDefault();
                if (deleteId) deleteMut.mutate(deleteId);
              }}
            >
              {deleteMut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
