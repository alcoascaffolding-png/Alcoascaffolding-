"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useWatch } from "react-hook-form";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import {
  FormTextField,
  FormSelectField,
  FormNumberField,
  FormTextAreaField,
} from "@/components/forms/form-fields";
import { FormSection, FormGrid } from "@/components/forms/form-layout";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const adjustmentTypeOptions = [
  { value: "increase", label: "Increase stock" },
  { value: "decrease", label: "Decrease stock" },
  { value: "correction", label: "Set exact level (correction)" },
];

const stockAdjustmentSchema = z
  .object({
    product: z.string().min(1, "Product is required"),
    adjustmentType: z.enum(["increase", "decrease", "correction"]),
    quantity: z.coerce.number().min(0).default(0),
    correctionNewStock: z.coerce.number().min(0).optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.adjustmentType === "correction") {
      if (data.correctionNewStock === undefined || Number.isNaN(data.correctionNewStock)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["correctionNewStock"],
          message: "New stock level is required",
        });
      }
    } else if (!data.quantity || data.quantity <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["quantity"],
        message: "Quantity must be greater than zero",
      });
    }
  });

const defaultValues = {
  product: "",
  adjustmentType: "increase",
  quantity: 1,
  correctionNewStock: 0,
  reason: "",
  notes: "",
};

const typeColors = { increase: "success", decrease: "destructive", correction: "warning" };

const columns = [
  { accessorKey: "adjustmentNumber", header: "Adj #", size: 120 },
  { accessorKey: "productName", header: "Product" },
  {
    accessorKey: "adjustmentType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={typeColors[row.original.adjustmentType]}>{row.original.adjustmentType}</Badge>
    ),
    size: 100,
  },
  { accessorKey: "quantity", header: "Qty", size: 70 },
  { accessorKey: "previousStock", header: "Before", size: 70 },
  { accessorKey: "newStock", header: "After", size: 70 },
  { accessorKey: "reason", header: "Reason" },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.createdAt),
    size: 100,
  },
];

function StockAdjustmentFormFields({ control }) {
  const adjustmentType = useWatch({ control, name: "adjustmentType" });
  const selectedProductId = useWatch({ control, name: "product" });

  const { data: productsData } = useQuery({
    queryKey: ["products", "adjustment-picker"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=200&active=true");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: selectedProduct } = useQuery({
    queryKey: ["products", "detail", selectedProductId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${selectedProductId}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!selectedProductId,
  });

  const productOptions = (productsData?.items || [])
    .filter((p) => p.isActive !== false)
    .map((p) => ({
      value: String(p._id),
      label: `${p.itemCode} — ${p.name} (stock: ${p.currentStock ?? 0})`,
    }));

  if (
    selectedProduct &&
    !productOptions.some((opt) => opt.value === String(selectedProduct._id))
  ) {
    productOptions.unshift({
      value: String(selectedProduct._id),
      label: `${selectedProduct.itemCode} — ${selectedProduct.name} (stock: ${selectedProduct.currentStock ?? 0})`,
    });
  }

  return (
    <FormSection title="Stock adjustment" description="Record a change to on-hand inventory.">
      <div className="space-y-4">
        <FormSelectField
          control={control}
          name="product"
          label="Product"
          placeholder="Select product…"
          options={productOptions}
        />
        <FormGrid>
          <FormSelectField
            control={control}
            name="adjustmentType"
            label="Adjustment type"
            options={adjustmentTypeOptions}
          />
          {adjustmentType === "correction" ? (
            <FormNumberField
              control={control}
              name="correctionNewStock"
              label="New stock level"
              min={0}
            />
          ) : (
            <FormNumberField control={control} name="quantity" label="Quantity" min={1} />
          )}
        </FormGrid>
        <FormTextField
          control={control}
          name="reason"
          label="Reason"
          placeholder="e.g. Physical count, damaged goods"
        />
        <FormTextAreaField
          control={control}
          name="notes"
          label="Notes"
          placeholder="Optional details"
          rows={2}
        />
      </div>
    </FormSection>
  );
}

export function StockAdjustmentsClient() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const presetValues = productId
    ? {
        product: productId,
        adjustmentType: "increase",
        quantity: 1,
      }
    : null;

  return (
    <GenericCRUDPage
      resource="stock-adjustments"
      title="Stock Adjustments"
      resourceSingular="Stock adjustment"
      columns={columns}
      schema={stockAdjustmentSchema}
      defaultValues={defaultValues}
      FormFields={StockAdjustmentFormFields}
      allowEdit={false}
      initialOpenCreate={!!productId}
      presetValues={presetValues}
      statCards={(s) => [{ label: "Total Adjustments", value: s.total }]}
    />
  );
}
