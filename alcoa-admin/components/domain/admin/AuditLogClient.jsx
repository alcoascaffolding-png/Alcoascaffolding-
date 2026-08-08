"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const actionColors = {
  create: "success",
  update: "info",
  delete: "destructive",
  send_email: "warning",
  send_whatsapp: "warning",
  import: "info",
  status_change: "outline",
};

/** Compact list-filter trigger — clear contrast like form/status selects, not washed-out. */
const filterTriggerClassName =
  "h-9 w-full min-w-[9.5rem] sm:w-[11.5rem] rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm hover:bg-muted/50 focus:ring-2 focus:ring-ring/30 focus:ring-offset-1 [&>span]:text-foreground [&_svg]:opacity-60";

const filterContentClassName =
  "rounded-lg border-border/80 bg-popover p-1 shadow-md";

const filterItemClassName =
  "cursor-pointer rounded-md py-2 pl-8 pr-3 text-sm font-medium focus:bg-accent focus:text-accent-foreground";

const filterLabelClassName =
  "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

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
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Select value={resource} onValueChange={setResource}>
          <SelectTrigger className={cn(filterTriggerClassName, "sm:w-[12.5rem]")}>
            <SelectValue placeholder="All modules" />
          </SelectTrigger>
          <SelectContent className={filterContentClassName} position="popper">
            <div className={filterLabelClassName}>Filter by module</div>
            <SelectItem value="all" className={filterItemClassName}>
              All modules
            </SelectItem>
            <SelectSeparator className="my-1 bg-border/60" />
            <SelectGroup>
              <SelectLabel className={cn(filterLabelClassName, "pl-2 font-semibold")}>
                Sales
              </SelectLabel>
              <SelectItem value="quotations" className={filterItemClassName}>
                Quotations
              </SelectItem>
              <SelectItem value="sales-orders" className={filterItemClassName}>
                Sales orders
              </SelectItem>
              <SelectItem value="sales-invoices" className={filterItemClassName}>
                Tax invoices
              </SelectItem>
              <SelectItem value="delivery-notes" className={filterItemClassName}>
                Delivery notes
              </SelectItem>
              <SelectItem value="receipts" className={filterItemClassName}>
                Receipts
              </SelectItem>
            </SelectGroup>
            <SelectSeparator className="my-1 bg-border/60" />
            <SelectGroup>
              <SelectLabel className={cn(filterLabelClassName, "pl-2 font-semibold")}>
                Purchases
              </SelectLabel>
              <SelectItem value="purchase-orders" className={filterItemClassName}>
                Purchase orders
              </SelectItem>
              <SelectItem value="purchase-invoices" className={filterItemClassName}>
                Purchase invoices
              </SelectItem>
              <SelectItem value="payments" className={filterItemClassName}>
                Payments
              </SelectItem>
              <SelectItem value="vendors" className={filterItemClassName}>
                Vendors
              </SelectItem>
            </SelectGroup>
            <SelectSeparator className="my-1 bg-border/60" />
            <SelectGroup>
              <SelectLabel className={cn(filterLabelClassName, "pl-2 font-semibold")}>
                Other
              </SelectLabel>
              <SelectItem value="products" className={filterItemClassName}>
                Products
              </SelectItem>
              <SelectItem value="stock-adjustments" className={filterItemClassName}>
                Stock adjustments
              </SelectItem>
              <SelectItem value="categories" className={filterItemClassName}>
                Categories
              </SelectItem>
              <SelectItem value="bank-accounts" className={filterItemClassName}>
                Bank accounts
              </SelectItem>
              <SelectItem value="contact-messages" className={filterItemClassName}>
                Contact messages
              </SelectItem>
              <SelectItem value="users" className={filterItemClassName}>
                Users
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className={cn(filterTriggerClassName, "sm:w-[10.5rem]")}>
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent className={filterContentClassName} position="popper">
            <div className={filterLabelClassName}>Filter by action</div>
            <SelectItem value="all" className={filterItemClassName}>
              All actions
            </SelectItem>
            <SelectSeparator className="my-1 bg-border/60" />
            <SelectItem value="create" className={filterItemClassName}>
              Create
            </SelectItem>
            <SelectItem value="update" className={filterItemClassName}>
              Update
            </SelectItem>
            <SelectItem value="delete" className={filterItemClassName}>
              Delete
            </SelectItem>
            <SelectItem value="send_email" className={filterItemClassName}>
              Send email
            </SelectItem>
            <SelectItem value="send_whatsapp" className={filterItemClassName}>
              Send WhatsApp
            </SelectItem>
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
