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
import { formatDate } from "@/lib/utils";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { StatsCardsGrid } from "@/components/domain/documents/StatsCardsGrid";
import { DocumentRowActionMenu } from "@/components/domain/documents/DocumentRowActionMenu";
import { ExportButton } from "@/components/data-table/ExportButton";
import { useDocumentListOutbound } from "@/hooks/use-document-list-outbound";
import { DeliveryNoteStatusChanger } from "@/components/domain/delivery/DeliveryNoteStatusChanger";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";

const API = "/api/delivery-notes";

async function fetchNotes(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}?${qs}`);
  const d = await res.json();
  if (!d.success) throw new Error(d.error);
  return d.data;
}

async function fetchStats() {
  const res = await fetch("/api/delivery-notes/stats");
  const d = await res.json();
  return d.data;
}

export function DeliveryNotesClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["delivery-notes"],
    queryFn: () => fetchNotes({ limit: "200" }),
    refetchInterval: 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ["delivery-notes-stats"],
    queryFn: fetchStats,
  });

  const { showWhatsApp, sendingId, downloadPdf, sendEmail, sendWhatsApp, copyWhatsAppLink } =
    useDocumentListOutbound({
      apiBase: API,
      listQueryKey: ["delivery-notes"],
      statsQueryKey: ["delivery-notes-stats"],
    });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-notes"] });
      qc.invalidateQueries({ queryKey: ["delivery-notes-stats"] });
      setDeleteId(null);
      toast.success("Delivery note deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      { label: "Open", value: stats.open ?? 0, valueClassName: "text-2xl text-chart-2" },
      {
        label: "Delivered",
        value: stats.delivered ?? 0,
        valueClassName: "text-2xl text-emerald-500",
      },
    ];

  const columns = [
    {
      accessorKey: "deliveryNoteNumber",
      header: "DN #",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">{row.original.deliveryNoteNumber}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span>,
      size: 240,
    },
    {
      accessorKey: "salesOrder",
      header: "Order Ref",
      cell: ({ row }) => {
        const so = row.original.salesOrder;
        const num = so && typeof so === "object" ? so.orderNumber : null;
        return <span className="font-mono text-sm">{num || "—"}</span>;
      },
      size: 120,
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivery",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.deliveryDate ? formatDate(row.original.deliveryDate) : "—"}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DeliveryNoteStatusChanger
            id={String(row.original._id)}
            value={row.original.status}
            size="sm"
          />
        </div>
      ),
      size: 170,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const n = row.original;
        const nid = String(n._id);
        const busy = sendingId === nid;
        return (
          <DocumentRowActionMenu
            showWhatsApp={showWhatsApp}
            busy={busy}
            hasEmail={!!resolveDocumentCustomerEmail(n)}
            hasPhone={!!(resolveDocumentCustomerPhone(n) || n.contactPersonPhone)}
            onView={() => router.push(`/delivery-notes/${nid}`)}
            onEdit={() => router.push(`/delivery-notes/${nid}/edit`)}
            onDownloadPdf={() => downloadPdf(nid, n.deliveryNoteNumber)}
            onSendEmail={() => sendEmail(nid)}
            onSendWhatsApp={() => sendWhatsApp(nid)}
            onCopyWhatsAppLink={() => copyWhatsAppLink(nid)}
            onDelete={() => setDeleteId(nid)}
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
        searchPlaceholder="Search delivery notes…"
        onRowClick={(row) => router.push(`/delivery-notes/${String(row._id)}`)}
        emptyMessage="No delivery notes yet. Create one from a sales order or add standalone."
        toolbar={<ExportButton resource="delivery-notes" filename="delivery-notes" />}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleteMut.isPending) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete delivery note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the delivery note. This action cannot be undone.
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
