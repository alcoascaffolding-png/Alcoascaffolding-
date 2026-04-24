"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  MoreHorizontal, Pencil, Trash2, Users, UserCheck, TrendingUp,
  Eye, Mail, MessageSquare, Loader2,
} from "lucide-react";

const STATUS_COLORS = {
  active: "success", inactive: "secondary",
  blocked: "destructive", prospect: "warning",
};

function digits(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "").replace(/^0+/, "");
}

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

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetchCustomers(),
    refetchInterval: 60 * 1000,
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
      toast.success("Customer deleted");
    },
    onError: (e) => toast.error(e.message),
  });

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
        const phone = c.primaryWhatsApp || c.primaryPhone || "";
        const waDigits = digits(phone);
        const waHref = waDigits
          ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`Hello ${c.companyName}, `)}`
          : null;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">

              {/* View */}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/customers/${cid}`); }}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>

              {/* Edit */}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/customers/${cid}/edit`); }}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Email */}
              {c.primaryEmail ? (
                <DropdownMenuItem asChild>
                  <a
                    href={`mailto:${c.primaryEmail}?subject=${encodeURIComponent(`Alcoa Scaffolding — ${c.companyName}`)}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <Mail className="mr-2 h-4 w-4 opacity-40" />
                  <span className="opacity-40">No email</span>
                </DropdownMenuItem>
              )}

              {/* WhatsApp */}
              {waHref ? (
                <DropdownMenuItem asChild>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-600"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled>
                  <MessageSquare className="mr-2 h-4 w-4 opacity-40" />
                  <span className="opacity-40">No phone</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {/* Delete */}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); setDeleteId(cid); }}
              >
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
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">{stats.prospect}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => router.push(`/customers/${String(row._id)}`)}
        emptyMessage="No customers yet. Add your first customer."
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
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" aria-hidden />Deleting…</>
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
