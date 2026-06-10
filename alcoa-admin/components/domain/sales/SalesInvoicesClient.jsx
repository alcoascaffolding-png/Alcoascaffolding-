"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
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
import { formatDate, formatCurrency } from "@/lib/utils";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { StatsCardsGrid } from "@/components/domain/documents/StatsCardsGrid";
import { DocumentRowActionMenu } from "@/components/domain/documents/DocumentRowActionMenu";
import { useDocumentListOutbound } from "@/hooks/use-document-list-outbound";
import { InvoicePaymentStatusChanger } from "@/components/domain/sales/InvoicePaymentStatusChanger";

const API_INVOICES = "/api/sales-invoices";

async function fetchInvoices(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/sales-invoices?${qs}`);
  const d = await res.json();
  if (!d.success) throw new Error(d.error);
  return d.data;
}

async function fetchStats() {
  const res = await fetch("/api/sales-invoices/stats");
  const d = await res.json();
  return d.data;
}

export function SalesInvoicesClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["sales-invoices"],
    queryFn: () => fetchInvoices({ limit: "200" }),
    refetchInterval: 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ["sales-invoices-stats"],
    queryFn: fetchStats,
  });

  const { showWhatsApp, sendingId, downloadPdf, sendEmail, sendWhatsApp, copyWhatsAppLink } =
    useDocumentListOutbound({
      apiBase: API_INVOICES,
      listQueryKey: ["sales-invoices"],
      statsQueryKey: ["sales-invoices-stats"],
    });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/sales-invoices/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-invoices"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices-stats"] });
      setDeleteId(null);
      toast.success("Tax invoice deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const outstanding = stats?.outstanding ?? 0;

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      { label: "Unpaid", value: stats.unpaid ?? 0, valueClassName: "text-2xl text-chart-2" },
      { label: "Paid", value: stats.paid ?? 0, valueClassName: "text-2xl text-emerald-500" },
      {
        label: "Total Value",
        value: formatCurrency(stats.totalValue || 0),
        valueClassName: "text-lg",
        subtitle: `Outstanding ${formatCurrency(outstanding)}`,
      },
    ];

  const columns = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">{row.original.invoiceNumber}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span>,
      size: 240,
      minSize: 160,
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.invoiceDate)}</span>,
      size: 100,
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.dueDate ? formatDate(row.original.dueDate) : "—"}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.total || 0)}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "paymentStatus",
      header: "Status",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <InvoicePaymentStatusChanger
            id={String(row.original._id)}
            value={row.original.paymentStatus}
            size="sm"
          />
        </div>
      ),
      size: 180,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const inv = row.original;
        const iid = String(inv._id);
        const busy = sendingId === iid;
        return (
          <DocumentRowActionMenu
            showWhatsApp={showWhatsApp}
            busy={busy}
            hasEmail={!!inv.customerEmail}
            hasPhone={!!inv.customerPhone}
            onView={() => router.push(`/sales-invoices/${iid}`)}
            onEdit={() => router.push(`/sales-invoices/${iid}/edit`)}
            onDownloadPdf={() => downloadPdf(iid, inv.invoiceNumber)}
            onSendEmail={() => sendEmail(iid)}
            onSendWhatsApp={() => sendWhatsApp(iid)}
            onCopyWhatsAppLink={() => copyWhatsAppLink(iid)}
            onDelete={() => setDeleteId(iid)}
          />
        );
      },
      size: 50,
    },
  ];

  return (
    <>
      <StatsCardsGrid items={statItems || []} />
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search tax invoices…"
        onRowClick={(row) => router.push(`/sales-invoices/${String(row._id)}`)}
        emptyMessage="No tax invoices yet. Create your first tax invoice."
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleteMut.isPending) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tax invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tax invoice. This action cannot be undone.
            </AlertDialogDescription>
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
                  <InlineSkeleton className="mr-2 inline" />
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
