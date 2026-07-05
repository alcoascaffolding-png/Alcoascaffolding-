"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ExportButton } from "@/components/data-table/ExportButton";
import { useDocumentListOutbound } from "@/hooks/use-document-list-outbound";
import { QuotationStatusChanger } from "@/components/domain/quotations/QuotationStatusChanger";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const API_QUOTATIONS = "/api/quotations";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending (draft / sent)" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

async function fetchQuotations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_QUOTATIONS}?${qs}`);
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
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const statusFilter = searchParams.get("status") || "all";

  const listParams = useMemo(() => {
    const params = {
      page: String(pagination.pageIndex + 1),
      limit: String(pagination.pageSize),
    };
    if (statusFilter && statusFilter !== "all") params.status = statusFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  }, [pagination.pageIndex, pagination.pageSize, statusFilter, debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["quotations", listParams],
    queryFn: () => fetchQuotations(listParams),
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
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

  function setStatusFilter(value) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete("status");
    else params.set("status", value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    const qs = params.toString();
    router.replace(qs ? `/quotations?${qs}` : "/quotations", { scroll: false });
  }

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      {
        label: "Pending",
        value: (stats.draft || 0) + (stats.sent || 0),
        valueClassName: "text-2xl text-chart-2",
      },
      { label: "Accepted", value: stats.approved, valueClassName: "text-2xl text-emerald-500" },
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
          ![
            "accepted",
            "approved",
            "converted",
            "converted_to_sales_order",
            "converted_to_invoice",
          ].includes(row.original.status);
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
        const busy = !!sendingId;
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
        searchPlaceholder="Search by quote #, customer, reference…"
        serverSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        manualPagination
        pageCount={data?.pages || 1}
        totalRecords={data?.total || 0}
        paginationState={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => router.push(`/quotations/${String(row._id)}`)}
        emptyMessage={
          statusFilter !== "all" || debouncedSearch
            ? "No quotations match your filters."
            : "No quotations yet. Create your first quotation."
        }
        toolbar={
          <>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportButton resource="quotations" filename="quotations" />
          </>
        }
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
