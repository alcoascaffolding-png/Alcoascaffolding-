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
import { formatDate, formatCurrency, isLocalCalendarDayBeforeToday } from "@/lib/utils";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { StatsCardsGrid } from "@/components/domain/documents/StatsCardsGrid";
import { DocumentRowActionMenu } from "@/components/domain/documents/DocumentRowActionMenu";
import { useDocumentListOutbound } from "@/hooks/use-document-list-outbound";
import { QuotationStatusChanger } from "@/components/domain/quotations/QuotationStatusChanger";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";

const API_QUOTATIONS = "/api/quotations";

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => fetchQuotations(),
    refetchInterval: 60 * 1000,
  });

  const { data: stats } = useQuery({ queryKey: ["quotations-stats"], queryFn: fetchStats });

  const { showWhatsApp, sendingId, downloadPdf, sendEmail, sendWhatsApp, copyWhatsAppLink } =
    useDocumentListOutbound({
      apiBase: API_QUOTATIONS,
      listQueryKey: ["quotations"],
      statsQueryKey: ["quotations-stats"],
    });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations-stats"] });
      setDeleteId(null);
      toast.success("Quotation deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      {
        label: "Pending",
        value: (stats.draft || 0) + (stats.sent || 0),
        valueClassName: "text-2xl text-chart-2",
      },
      { label: "Approved", value: stats.approved, valueClassName: "text-2xl text-emerald-500" },
      {
        label: "Total Value",
        value: formatCurrency(stats.totalValue),
        valueClassName: "text-lg",
      },
    ];

  const columns = [
    {
      accessorKey: "quoteNumber",
      header: "Quote #",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">{row.original.quoteNumber}</span>
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
      accessorKey: "quoteDate",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.quoteDate)}</span>,
      size: 100,
    },
    {
      accessorKey: "validUntil",
      header: "Valid Until",
      cell: ({ row }) => {
        const expired =
          isLocalCalendarDayBeforeToday(row.original.validUntil) &&
          !["approved", "converted"].includes(row.original.status);
        return (
          <span className={`text-sm ${expired ? "text-destructive font-medium" : ""}`}>
            {formatDate(row.original.validUntil)}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.totalAmount || 0)}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <QuotationStatusChanger
            id={String(row.original._id)}
            value={row.original.status}
            size="sm"
          />
        </div>
      ),
      size: 160,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const q = row.original;
        const qid = String(q._id);
        const busy = sendingId === qid;
        return (
          <DocumentRowActionMenu
            showWhatsApp={showWhatsApp}
            busy={busy}
            hasEmail={!!resolveDocumentCustomerEmail(q)}
            hasPhone={!!resolveDocumentCustomerPhone(q)}
            onView={() => router.push(`/quotations/${qid}`)}
            onEdit={() => router.push(`/quotations/${qid}/edit`)}
            onDownloadPdf={() => downloadPdf(qid, q.quoteNumber)}
            onSendEmail={() => sendEmail(qid)}
            onSendWhatsApp={() => sendWhatsApp(qid)}
            onCopyWhatsAppLink={() => copyWhatsAppLink(qid)}
            onDelete={() => setDeleteId(qid)}
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
        searchPlaceholder="Search quotations…"
        onRowClick={(row) => router.push(`/quotations/${String(row._id)}`)}
        emptyMessage="No quotations yet. Create your first quotation."
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleteMut.isPending) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quotation. This action cannot be undone.
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
