"use client";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const typeColors = { increase: "success", decrease: "destructive", correction: "warning" };
const columns = [
  { accessorKey: "adjustmentNumber", header: "Adj #", size: 120 },
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "adjustmentType", header: "Type", cell: ({ row }) => <Badge variant={typeColors[row.original.adjustmentType]}>{row.original.adjustmentType}</Badge>, size: 100 },
  { accessorKey: "quantity", header: "Qty", size: 70 },
  { accessorKey: "previousStock", header: "Before", size: 70 },
  { accessorKey: "newStock", header: "After", size: 70 },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt), size: 100 },
];

export function StockAdjustmentsClient() {
  return <GenericCRUDPage resource="stock-adjustments" title="Stock Adjustments" columns={columns} statCards={(s) => [{ label: "Total Adjustments", value: s.total }]} />;
}
