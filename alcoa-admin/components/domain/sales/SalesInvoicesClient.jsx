"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { formatDate, formatCurrency } from "@/lib/utils";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { StatsCardsGrid } from "@/components/domain/documents/StatsCardsGrid";
import { DocumentRowActionMenu } from "@/components/domain/documents/DocumentRowActionMenu";
import { ExportButton } from "@/components/data-table/ExportButton";
import { useDocumentListOutbound } from "@/hooks/use-document-list-outbound";
import { InvoicePaymentStatusChanger } from "@/components/domain/sales/InvoicePaymentStatusChanger";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const API_INVOICES = "/api/sales-invoices";

const PAYMENT_FILTERS = [
  { value: "all", label: "All payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially paid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

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
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const listParams = useMemo(() => {
    const params = {
      page: String(pagination.pageIndex + 1),
      limit: String(pagination.pageSize),
    };
    if (paymentFilter && paymentFilter !== "all") params.paymentStatus = paymentFilter;
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  }, [pagination.pageIndex, pagination.pageSize, paymentFilter, debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["sales-invoices", listParams],
    queryFn: () => fetchInvoices(listParams),
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
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
            hasEmail={!!resolveDocumentCustomerEmail(inv)}
            hasPhone={!!resolveDocumentCustomerPhone(inv)}
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
        searchPlaceholder="Search by invoice #, customer, TRN…"
        serverSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        manualPagination
        pageCount={data?.pages || 1}
        totalRecords={data?.total || 0}
        paginationState={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => router.push(`/sales-invoices/${String(row._id)}`)}
        emptyMessage={
          paymentFilter !== "all" || debouncedSearch
            ? "No tax invoices match your filters."
            : "No tax invoices yet. Create your first tax invoice."
        }
        toolbar={
          <>
            <Select
              value={paymentFilter}
              onValueChange={(value) => {
                setPaymentFilter(value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[170px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportButton resource="sales-invoices" filename="tax-invoices" />
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
