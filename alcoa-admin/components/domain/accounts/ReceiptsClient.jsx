"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { formatCurrency, formatDate } from "@/lib/utils";

const columns = [
  { accessorKey: "receiptNumber", header: "Receipt #", size: 120 },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount || 0), size: 120 },
  { accessorKey: "paymentMethod", header: "Method", size: 110 },
  { accessorKey: "receiptDate", header: "Date", cell: ({ row }) => formatDate(row.original.receiptDate), size: 100 },
];

export function ReceiptsClient() {
  return <GenericCRUDPage resource="receipts" title="Receipts" columns={columns} statCards={(s) => [{ label: "Total Receipts", value: s.total }]} />;
}
