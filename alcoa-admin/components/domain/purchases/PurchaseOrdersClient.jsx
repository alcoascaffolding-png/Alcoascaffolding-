"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  description: z.string().min(1, "Description required"),
  product: z.string().optional(),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().default("Nos"),
  unitPrice: z.coerce.number().min(0),
});

const poSchema = z.object({
  vendor: z.string().optional(),
  vendorName: z.string().min(1, "Vendor name is required"),
  orderDate: z.string().min(1),
  deliveryDate: z.string().optional(),
  status: z.enum(["draft", "sent", "confirmed", "partially_received", "received", "cancelled"]),
  items: z.array(lineItemSchema).min(1, "At least one line item"),
  paymentTerms: z.string().optional(),
  deliveryAddress: z.string().optional(),
  termsAndConditions: z.string().optional(),
  notes: z.string().optional(),
});

const defaultValues = {
  vendor: "__none__",
  vendorName: "",
  orderDate: new Date().toISOString().slice(0, 10),
  deliveryDate: "",
  status: "draft",
  items: [{ description: "", product: "", quantity: 1, unit: "Nos", unitPrice: 0 }],
  paymentTerms: "",
  deliveryAddress: "",
  termsAndConditions: "",
  notes: "",
};

const statusColors = {
  draft: "outline",
  sent: "info",
  confirmed: "warning",
  partially_received: "warning",
  received: "success",
  cancelled: "destructive",
};

const statusOptions = [
  "draft",
  "sent",
  "confirmed",
  "partially_received",
  "received",
  "cancelled",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const columns = [
  { accessorKey: "poNumber", header: "PO #", size: 120 },
  { accessorKey: "vendorName", header: "Vendor" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusColors[row.original.status]}>
        {row.original.status?.replace(/_/g, " ")}
      </Badge>
    ),
    size: 140,
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatCurrency(row.original.total || 0),
    size: 120,
  },
  {
    accessorKey: "orderDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.orderDate),
    size: 100,
  },
];

function PurchaseOrderFormFields({ control }) {
  const { setValue } = useFormContext();
  const vendorId = useWatch({ control, name: "vendor" });

  const { data: vendorsData } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch("/api/vendors?limit=200");
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

  return (
    <div className="space-y-8 pb-4">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Order details</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Vendor, dates, status, and payment terms.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <VendorSelectField control={control} />
          <FormTextField control={control} name="vendorName" label="Vendor name" />
          <FormTextField control={control} name="orderDate" label="Order date" type="date" />
          <FormTextField control={control} name="deliveryDate" label="Expected delivery" type="date" />
          <FormSelectField control={control} name="status" label="Status" options={statusOptions} />
          <FormTextField
            control={control}
            name="paymentTerms"
            label="Payment terms"
            placeholder="e.g. 30 Days — blank uses the vendor's terms"
          />
        </div>
      </section>

      <section>
        <PurchaseLineItemsFields />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Delivery & terms</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Address and terms printed on the LPO. Leave terms blank to use the standard set.
          </p>
        </div>
        <FormTextAreaField
          control={control}
          name="deliveryAddress"
          label="Deliver to"
          rows={3}
          placeholder="Delivery address printed on the LPO"
        />
        <FormTextAreaField
          control={control}
          name="termsAndConditions"
          label="Terms & Conditions"
          rows={5}
          placeholder="Leave blank to print the standard LPO terms"
        />
        <FormTextAreaField control={control} name="notes" label="Notes" rows={2} />
      </section>
    </div>
  );
}

function mapPurchaseDocToForm(item) {
  const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
  const vendorId =
    item.vendor && typeof item.vendor === "object" && item.vendor._id != null
      ? String(item.vendor._id)
      : item.vendor != null
        ? String(item.vendor)
        : "__none__";
  return {
    vendor: vendorId,
    vendorName: item.vendorName || "",
    orderDate: fmt(item.orderDate) || new Date().toISOString().slice(0, 10),
    deliveryDate: fmt(item.deliveryDate),
    status: item.status || "draft",
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
    paymentTerms: item.paymentTerms || "",
    deliveryAddress: item.deliveryAddress || "",
    termsAndConditions: item.termsAndConditions || "",
    notes: item.notes || "",
  };
}

export function PurchaseOrdersClient() {
  const searchParams = useSearchParams();
  const fromLowStock = searchParams.get("from") === "low-stock";

  const { data: reorderData, isSuccess: reorderReady } = useQuery({
    queryKey: ["products", "reorder-lines"],
    queryFn: async () => {
      const res = await fetch("/api/products/reorder-lines");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: fromLowStock,
  });

  const presetValues =
    fromLowStock && reorderData?.lines?.length
      ? {
          ...(reorderData.suggestedVendor
            ? {
                vendor: reorderData.suggestedVendor.vendorId,
                vendorName: reorderData.suggestedVendor.vendorName,
              }
            : {}),
          items: reorderData.lines.map((line) => ({
            description: line.description,
            product: line.product,
            quantity: line.quantity,
            unit: line.unit,
            unitPrice: line.unitPrice,
          })),
          notes: `Replenishment PO for ${reorderData.count} low/out-of-stock product(s). Review quantities before sending.`,
          status: "draft",
        }
      : null;

  return (
    <GenericCRUDPage
      resource="purchase-orders"
      title="Purchase Orders"
      resourceSingular="Purchase order"
      columns={columns}
      schema={poSchema}
      defaultValues={defaultValues}
      FormFields={PurchaseOrderFormFields}
      mapItemToForm={mapPurchaseDocToForm}
      initialOpenCreate={fromLowStock && reorderReady && !!reorderData?.lines?.length}
      presetValues={presetValues}
      statCards={(s) => [
        { label: "Total POs", value: s.total },
        { label: "Received", value: s.received || 0 },
      ]}
      detailPath="/purchase-orders"
    />
  );
}
