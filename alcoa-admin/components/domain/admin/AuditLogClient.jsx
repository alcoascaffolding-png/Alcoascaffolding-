"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

const actionColors = {
  create: "success",
  update: "info",
  delete: "destructive",
  send_email: "warning",
  status_change: "outline",
};

const columns = [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString("en-GB")
        : "—",
    size: 160,
  },
  {
    accessorKey: "userEmail",
    header: "User",
    cell: ({ row }) => {
      const u = row.original.user;
      const name = u && typeof u === "object" ? u.name : null;
      return name || row.original.userEmail || "—";
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Badge variant={actionColors[row.original.action] || "outline"}>
        {row.original.action?.replace(/_/g, " ")}
      </Badge>
    ),
    size: 110,
  },
  {
    accessorKey: "resource",
    header: "Module",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.resource}</span>
    ),
    size: 140,
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground truncate max-w-md block">
        {row.original.summary || "—"}
      </span>
    ),
  },
];

export function AuditLogClient() {
  const [resource, setResource] = useState("all");
  const [action, setAction] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", resource, action],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (resource !== "all") params.set("resource", resource);
      if (action !== "all") params.set("action", action);
      const res = await fetch(`/api/audit-logs?${params}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={resource} onValueChange={setResource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            <SelectItem value="quotations">Quotations</SelectItem>
            <SelectItem value="sales-orders">Sales orders</SelectItem>
            <SelectItem value="sales-invoices">Tax invoices</SelectItem>
            <SelectItem value="delivery-notes">Delivery notes</SelectItem>
            <SelectItem value="purchase-orders">Purchase orders</SelectItem>
            <SelectItem value="purchase-invoices">Purchase invoices</SelectItem>
            <SelectItem value="products">Products</SelectItem>
            <SelectItem value="receipts">Receipts</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
            <SelectItem value="users">Users</SelectItem>
          </SelectContent>
        </Select>
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="send_email">Send email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchPlaceholder="Filter visible rows…"
      />
    </div>
  );
}
