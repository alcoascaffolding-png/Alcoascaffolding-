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
import { SalesOrderStatusChanger } from "@/components/domain/sales/SalesOrderStatusChanger";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePermissions } from "@/hooks/use-permissions";

const API_ORDERS = "/api/sales-orders";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "invoiced", label: "Invoiced" },
  { value: "cancelled", label: "Cancelled" },
];

async function fetchOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/sales-orders?${qs}`);
  const d = await res.json();
  if (!d.success) throw new Error(d.error);
  return d.data;
}

async function fetchStats() {
  const res = await fetch("/api/sales-orders/stats");
  const d = await res.json();
  return d.data;
}

export function SalesOrdersClient() {
  const router = useRouter();
  const qc = useQueryClient();
  const perms = usePermissions();
  const canEdit = perms.canWrite("sales-orders");
  const canRemove = perms.canWrite("sales-orders") && perms.canDelete("sales-orders");
  const [deleteId, setDeleteId] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

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
    queryKey: ["sales-orders", listParams],
    queryFn: () => fetchOrders(listParams),
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const { data: stats } = useQuery({
    queryKey: ["sales-orders-stats"],
    queryFn: fetchStats,
  });

  const { showWhatsApp, sendingId, downloadPdf, sendEmail, sendWhatsApp, copyWhatsAppLink } =
    useDocumentListOutbound({
      apiBase: API_ORDERS,
      listQueryKey: ["sales-orders"],
      statsQueryKey: ["sales-orders-stats"],
    });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/sales-orders/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-orders-stats"] });
      setDeleteId(null);
      toast.success("Sales order deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      { label: "Open", value: stats.open ?? 0, valueClassName: "text-2xl text-chart-2" },
      {
        label: "Delivered / Done",
        value: stats.fulfilled ?? 0,
        valueClassName: "text-2xl text-emerald-500",
      },
      {
        label: "Total Value",
        value: formatCurrency(stats.totalValue || 0),
        valueClassName: "text-lg",
      },
    ];

  const columns = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-sm">{row.original.orderNumber}</span>
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
      accessorKey: "orderDate",
      header: "Date",
      cell: ({ row }) => <span className="text-sm">{formatDate(row.original.orderDate)}</span>,
      size: 100,
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
      accessorKey: "total",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.total || 0)}</span>
      ),
      size: 130,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <SalesOrderStatusChanger
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
        const o = row.original;
        const oid = String(o._id);
        const busy = !!sendingId;
        return (
          <DocumentRowActionMenu
            showWhatsApp={showWhatsApp}
            busy={busy}
            hasEmail={!!resolveDocumentCustomerEmail(o)}
            hasPhone={!!resolveDocumentCustomerPhone(o)}
            onView={() => router.push(`/sales-orders/${oid}`)}
            onEdit={canEdit ? () => router.push(`/sales-orders/${oid}/edit`) : undefined}
            onDownloadPdf={() => downloadPdf(oid, o.orderNumber)}
            onSendEmail={() => sendEmail(oid)}
            onSendWhatsApp={() => sendWhatsApp(oid)}
            onCopyWhatsAppLink={() => copyWhatsAppLink(oid)}
            onDelete={canRemove ? () => setDeleteId(oid) : undefined}
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
        searchPlaceholder="Search by order #, customer…"
        serverSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        manualPagination
        pageCount={data?.pages || 1}
        totalRecords={data?.total || 0}
        paginationState={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => router.push(`/sales-orders/${String(row._id)}`)}
        emptyMessage={
          statusFilter !== "all" || debouncedSearch
            ? "No sales orders match your filters."
            : "No sales orders yet. Create your first order."
        }
        toolbar={
          <>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportButton resource="sales-orders" filename="sales-orders" />
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
            <AlertDialogTitle>Delete sales order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the order. This action cannot be undone.
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
