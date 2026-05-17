"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors = { draft: "outline", confirmed: "info", in_progress: "warning", delivered: "success", completed: "success", cancelled: "destructive" };
const columns = [
  { accessorKey: "orderNumber", header: "Order #", size: 120 },
  { accessorKey: "customerName", header: "Customer", cell: ({ row }) => <span className="font-medium">{row.original.customerName}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={statusColors[row.original.status]}>{row.original.status?.replace("_", " ")}</Badge>, size: 110 },
  { accessorKey: "total", header: "Total", cell: ({ row }) => formatCurrency(row.original.total || 0), size: 120 },
  { accessorKey: "orderDate", header: "Date", cell: ({ row }) => formatDate(row.original.orderDate), size: 100 },
];

export function SalesOrdersClient() {
  return <GenericCRUDPage resource="sales-orders" title="Sales Orders" columns={columns} statCards={(s) => [{ label: "Total Orders", value: s.total }]} />;
}
