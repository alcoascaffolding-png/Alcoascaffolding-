"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TOAST, mutationErrorMessage } from "@/lib/toast-messages";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { StatsCardsGrid } from "@/components/domain/documents/StatsCardsGrid";
import { DocumentRowActionMenu } from "@/components/domain/documents/DocumentRowActionMenu";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ImportButton } from "@/components/data-table/ImportButton";
import { ExportButton } from "@/components/data-table/ExportButton";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "prospect", label: "Prospect" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

const STATUS_COLORS = {
  active: "success", inactive: "secondary",
  blocked: "destructive", prospect: "warning",
};

async function fetchCustomers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/customers?${qs}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchStats() {
  const res = await fetch("/api/customers/stats");
  const data = await res.json();
  return data.data;
}

export function CustomersClient() {
  const router = useRouter();
  const qc = useQueryClient();
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
    queryKey: ["customers", listParams],
    queryFn: () => fetchCustomers(listParams),
    refetchInterval: 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const { data: stats } = useQuery({
    queryKey: ["customers-stats"],
    queryFn: fetchStats,
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setDeleteId(null);
      toast.success(TOAST.deleted("Customer"));
    },
    onError: (e) => toast.error(mutationErrorMessage(e)),
  });

  const statItems =
    stats &&
    [
      { label: "Total", value: stats.total },
      { label: "Active", value: stats.active, valueClassName: "text-2xl text-emerald-500" },
      { label: "Prospects", value: stats.prospect, valueClassName: "text-2xl text-chart-2" },
      {
        label: "Total Revenue",
        value: formatCurrency(stats.totalRevenue),
        valueClassName: "text-lg",
      },
    ];

  const columns = [
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.companyName}</p>
          <p className="text-xs text-muted-foreground">{row.original.businessType}</p>
        </div>
      ),
    },
    {
      accessorKey: "primaryEmail",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.primaryEmail
            ? row.original.primaryEmail
            : <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      accessorKey: "primaryPhone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.primaryPhone || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_COLORS[row.original.status] || "outline"}>
          {row.original.status}
        </Badge>
      ),
      size: 100,
    },
    {
      accessorKey: "totalRevenue",
      header: "Revenue",
      cell: ({ row }) => formatCurrency(row.original.totalRevenue || 0),
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        const cid = String(c._id);
        const email = c.primaryEmail || "";
        return (
          // WhatsApp is intentionally hidden for customers per product request.
          <DocumentRowActionMenu
            showWhatsApp={false}
            hasEmail={!!email}
            onView={() => router.push(`/customers/${cid}`)}
            onEdit={() => router.push(`/customers/${cid}/edit`)}
            onSendEmail={() => {
              if (!email) return;
              window.location.href = `mailto:${email}?subject=${encodeURIComponent(
                `Alcoa Scaffolding — ${c.companyName}`
              )}`;
            }}
            onDelete={() => setDeleteId(cid)}
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
        searchPlaceholder="Search by company, email, phone, TRN…"
        serverSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        manualPagination
        pageCount={data?.pages || 1}
        totalRecords={data?.total || 0}
        paginationState={pagination}
        onPaginationChange={setPagination}
        onRowClick={(row) => router.push(`/customers/${String(row._id)}`)}
        emptyMessage={
          statusFilter !== "all" || debouncedSearch
            ? "No customers match your filters."
            : "No customers yet. Add your first customer."
        }
        toolbar={
          <>
            <ImportButton
              resource="customers"
              label="Customers"
              onSuccess={() => {
                qc.invalidateQueries({ queryKey: ["customers"] });
                qc.invalidateQueries({ queryKey: ["customers-stats"] });
              }}
            />
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
          <ExportButton resource="customers" filename="customers" />
          </>
        }
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open && !deleteMut.isPending) setDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer and all related data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMut.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={(e) => { e.preventDefault(); if (deleteId) deleteMut.mutate(deleteId); }}
            >
              {deleteMut.isPending
                ? <><InlineSkeleton className="mr-2 inline" />Deleting…</>
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
