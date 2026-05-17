"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusColors = { draft: "outline", sent: "info", confirmed: "warning", partially_received: "warning", received: "success", cancelled: "destructive" };
const columns = [
  { accessorKey: "poNumber", header: "PO #", size: 120 },
  { accessorKey: "vendorName", header: "Vendor" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={statusColors[row.original.status]}>{row.original.status?.replace("_", " ")}</Badge>, size: 140 },
  { accessorKey: "total", header: "Total", cell: ({ row }) => formatCurrency(row.original.total || 0), size: 120 },
  { accessorKey: "orderDate", header: "Date", cell: ({ row }) => formatDate(row.original.orderDate), size: 100 },
];

export function PurchaseOrdersClient() {
  return <GenericCRUDPage resource="purchase-orders" title="Purchase Orders" columns={columns} statCards={(s) => [{ label: "Total POs", value: s.total }]} />;
}
