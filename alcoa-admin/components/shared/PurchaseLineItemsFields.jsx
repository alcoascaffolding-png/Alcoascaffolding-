"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FormTextField,
  FormNumberField,
  FormSelectField,
} from "@/components/forms/form-fields";
import { ProductPicker } from "@/components/shared/ProductPicker";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

const unitOpts = ["Nos", "Set", "M", "Sqm"].map((v) => ({ value: v, label: v }));

const defaultLine = { description: "", product: "", quantity: 1, unit: "Nos", unitPrice: 0 };

const fieldLabel =
  "text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block";

export function PurchaseLineItemsFields() {
  const { control, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = useWatch({ control, name: "items" }) || [];

  const subtotal = items.reduce(
    (s, row) => s + (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0),
    0
  );
  const vat = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + vat) * 100) / 100;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">Line items</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pick a catalogue product or enter a description manually.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const qty = Number(items[index]?.quantity) || 0;
          const unitPrice = Number(items[index]?.unitPrice) || 0;
          const lineAmount = Math.round(qty * unitPrice * 100) / 100;
          const title = items[index]?.description?.trim() || `Line item ${index + 1}`;

          return (
            <div
              key={field.id}
              className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium leading-none">{title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Item {index + 1} of {fields.length}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className={fieldLabel}>Product (optional)</p>
                  <ProductPicker
                    value={items[index]?.product || ""}
                    quoteType="sales"
                    onSelect={(product) => {
                      if (!product) {
                        setValue(`items.${index}.product`, "");
                        return;
                      }
                      setValue(`items.${index}.product`, String(product._id));
                      setValue(`items.${index}.description`, product.name);
                      setValue(
                        `items.${index}.unitPrice`,
                        Number(product.purchasePrice) || Number(product.sellingPrice) || 0
                      );
                      setValue(`items.${index}.unit`, product.unit || "Nos");
                    }}
                  />
                </div>

                <FormTextField
                  control={control}
                  name={`items.${index}.description`}
                  label="Description"
                  placeholder="Item description"
                />

                <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-3">
                  <FormNumberField
                    control={control}
                    name={`items.${index}.quantity`}
                    label="Qty"
                    min={0.01}
                  />
                  <FormSelectField
                    control={control}
                    name={`items.${index}.unit`}
                    label="Unit"
                    options={unitOpts}
                  />
                  <FormNumberField
                    control={control}
                    name={`items.${index}.unitPrice`}
                    label="Unit price"
                    min={0}
                    className="col-span-2 sm:col-span-1"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t bg-muted/20 px-4 py-2.5 text-sm">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Qty × Price
                  </span>
                  <span className="font-medium tabular-nums">
                    {qty} × {unitPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 sm:ml-auto">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Amount
                  </span>
                  <span className="text-base font-semibold tabular-nums text-primary">
                    {formatCurrency(lineAmount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-dashed text-sm font-medium"
        onClick={() => append({ ...defaultLine })}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add line
      </Button>

      <Separator className="my-1" />

      <div className="ml-auto w-full space-y-1.5 border-t pt-3 text-sm sm:max-w-sm">
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-muted-foreground">VAT (5%)</span>
          <span className="tabular-nums">{formatCurrency(vat)}</span>
        </div>
        <Separator />
        <div className="flex justify-between gap-6 text-base font-bold">
          <span>Total</span>
          <span className="tabular-nums text-primary">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

export function VendorSelectField({
  control,
  name = "vendor",
  label = "Vendor",
  description = "Pick a vendor — company name auto-fills below",
}) {
  const { data } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch("/api/vendors?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const options = [
    { value: "__none__", label: "— Select vendor —" },
    ...(data?.items || [])
      .filter((v) => v.status === "active")
      .map((v) => ({ value: v._id, label: `${v.vendorCode} — ${v.companyName}` })),
  ];

  return (
    <FormSelectField
      control={control}
      name={name}
      label={label}
      placeholder="Select a vendor…"
      options={options}
      description={description}
    />
  );
}

export const purchaseLineItemSchema = {
  description: (z) => z.string().min(1, "Description required"),
  quantity: (z) => z.coerce.number().min(0.01),
  unit: (z) => z.string().default("Nos"),
  unitPrice: (z) => z.coerce.number().min(0),
  product: (z) => z.string().optional(),
};
