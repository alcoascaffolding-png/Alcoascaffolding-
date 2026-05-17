"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { formatCurrency, formatDate } from "@/lib/utils";

const columns = [
  { accessorKey: "paymentNumber", header: "Payment #", size: 120 },
  { accessorKey: "vendorName", header: "Vendor" },
  { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount || 0), size: 120 },
  { accessorKey: "paymentMethod", header: "Method", size: 110 },
  { accessorKey: "paymentDate", header: "Date", cell: ({ row }) => formatDate(row.original.paymentDate), size: 100 },
];

export function PaymentsClient() {
  return <GenericCRUDPage resource="payments" title="Payments" columns={columns} statCards={(s) => [{ label: "Total Payments", value: s.total }]} />;
}
