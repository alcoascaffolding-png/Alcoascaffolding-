"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import {
  FormTextField,
  FormSelectField,
  FormTextAreaField,
} from "@/components/forms/form-fields";
import {
  PurchaseLineItemsFields,
  VendorSelectField,
} from "@/components/shared/PurchaseLineItemsFields";
import { formatCurrency, formatDate } from "@/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1),
  product: z.string().optional(),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().default("Nos"),
  unitPrice: z.coerce.number().min(0),
});

const piSchema = z.object({
  vendor: z.string().optional(),
  vendorName: z.string().min(1, "Vendor name is required"),
  purchaseOrder: z.string().optional(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  paymentStatus: z.enum(["unpaid", "partially_paid", "paid", "overdue"]),
  items: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
});

const defaultValues = {
  vendor: "__none__",
  vendorName: "",
  purchaseOrder: "__none__",
  invoiceDate: new Date().toISOString().slice(0, 10),
  dueDate: "",
  paymentStatus: "unpaid",
  items: [{ description: "", product: "", quantity: 1, unit: "Nos", unitPrice: 0 }],
  notes: "",
};

const payColors = { unpaid: "destructive", partially_paid: "warning", paid: "success", overdue: "destructive" };

const columns = [
  { accessorKey: "invoiceNumber", header: "Invoice #", size: 120 },
  { accessorKey: "vendorName", header: "Vendor" },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <Badge variant={payColors[row.original.paymentStatus]}>
        {row.original.paymentStatus?.replace(/_/g, " ")}
      </Badge>
    ),
    size: 120,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total || 0),
    size: 120,
  },
  {
    accessorKey: "invoiceDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.invoiceDate),
    size: 100,
  },
];

function PurchaseInvoiceFormFields({ control }) {
  const { setValue } = useFormContext();
  const vendorId = useWatch({ control, name: "vendor" });
  const poId = useWatch({ control, name: "purchaseOrder" });

  const { data: vendorsData } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch("/api/vendors?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: poData } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: async () => {
      const res = await fetch("/api/purchase-orders?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  useEffect(() => {
    if (!vendorId || vendorId === "__none__") return;
    const vendor = vendorsData?.items?.find((v) => String(v._id) === String(vendorId));
    if (vendor?.companyName) setValue("vendorName", vendor.companyName);
  }, [vendorId, vendorsData, setValue]);

  useEffect(() => {
    if (!poId || poId === "__none__") return;
    const po = poData?.items?.find((p) => String(p._id) === String(poId));
    if (!po) return;
    if (po.vendorName) setValue("vendorName", po.vendorName);
    if (po.vendor) setValue("vendor", String(po.vendor));
    if (po.items?.length) {
      setValue(
        "items",
        po.items.map((row) => ({
          description: row.description,
          product: row.product ? String(row.product) : "",
          quantity: row.quantity,
          unit: row.unit || "Nos",
          unitPrice: row.unitPrice,
        }))
      );
    }
  }, [poId, poData, setValue]);

  const poOptions = [
    { value: "__none__", label: "— No linked PO —" },
    ...(poData?.items || []).map((po) => ({
      value: po._id,
      label: `${po.poNumber} — ${po.vendorName}`,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <VendorSelectField control={control} />
        <FormTextField control={control} name="vendorName" label="Vendor name" />
        <FormSelectField control={control} name="purchaseOrder" label="Purchase order" options={poOptions} />
        <FormTextField control={control} name="invoiceDate" label="Invoice date" type="date" />
        <FormTextField control={control} name="dueDate" label="Due date" type="date" />
        <FormSelectField
          control={control}
          name="paymentStatus"
          label="Payment status"
          options={[
            { value: "unpaid", label: "Unpaid" },
            { value: "partially_paid", label: "Partially paid" },
            { value: "paid", label: "Paid" },
          ]}
        />
      </div>
      <PurchaseLineItemsFields />
      <FormTextAreaField control={control} name="notes" label="Notes" rows={2} />
    </div>
  );
}

function mapPurchaseInvoiceToForm(item) {
  const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
  const vendorId =
    item.vendor && typeof item.vendor === "object" && item.vendor._id != null
      ? String(item.vendor._id)
      : item.vendor != null
        ? String(item.vendor)
        : "__none__";
  const poId =
    item.purchaseOrder && typeof item.purchaseOrder === "object" && item.purchaseOrder._id != null
      ? String(item.purchaseOrder._id)
      : item.purchaseOrder != null
        ? String(item.purchaseOrder)
        : "__none__";
  return {
    vendor: vendorId,
    vendorName: item.vendorName || "",
    purchaseOrder: poId,
    invoiceDate: fmt(item.invoiceDate) || new Date().toISOString().slice(0, 10),
    dueDate: fmt(item.dueDate),
    paymentStatus: item.paymentStatus || "unpaid",
    items:
      item.items?.length > 0
        ? item.items.map((row) => ({
            description: row.description,
            product: row.product ? String(row.product) : "",
            quantity: row.quantity,
            unit: row.unit || "Nos",
            unitPrice: row.unitPrice,
          }))
        : defaultValues.items,
    notes: item.notes || "",
  };
}

export function PurchaseInvoicesClient() {
  return (
    <GenericCRUDPage
      resource="purchase-invoices"
      title="Purchase Invoices"
      columns={columns}
      schema={piSchema}
      defaultValues={defaultValues}
      FormFields={PurchaseInvoiceFormFields}
      mapItemToForm={mapPurchaseInvoiceToForm}
      detailPath="/purchase-invoices"
      statCards={(s) => [
        { label: "Total Invoices", value: s.total },
        { label: "Unpaid", value: s.unpaid || 0 },
      ]}
    />
  );
}
