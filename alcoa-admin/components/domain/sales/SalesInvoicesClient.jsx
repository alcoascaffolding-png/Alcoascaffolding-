"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const paymentColors = { unpaid: "warning", partially_paid: "info", paid: "success", overdue: "destructive", cancelled: "secondary" };
const columns = [
  { accessorKey: "invoiceNumber", header: "Invoice #", size: 130 },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "paymentStatus", header: "Status", cell: ({ row }) => <Badge variant={paymentColors[row.original.paymentStatus]}>{row.original.paymentStatus?.replace("_", " ")}</Badge>, size: 130 },
  { accessorKey: "total", header: "Total", cell: ({ row }) => formatCurrency(row.original.total || 0), size: 120 },
  { accessorKey: "dueDate", header: "Due Date", cell: ({ row }) => formatDate(row.original.dueDate), size: 100 },
];

export function SalesInvoicesClient() {
  return <GenericCRUDPage resource="sales-invoices" title="Sales Invoices" columns={columns} statCards={(s) => [{ label: "Total Invoices", value: s.total }]} />;
}
