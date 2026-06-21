"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FormTextField, FormNumberField, FormSelectField } from "@/components/forms/form-fields";
import { ProductPicker } from "@/components/shared/ProductPicker";
import { Plus, Trash2 } from "lucide-react";

const unitOpts = ["Nos", "Set", "M", "Sqm"].map((v) => ({ value: v, label: v }));

const defaultLine = { description: "", product: "", quantity: 1, unit: "Nos", unitPrice: 0 };

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Line items</p>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ ...defaultLine })}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add line
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-2 items-end border rounded-lg p-3">
          <div className="col-span-12">
            <p className="text-xs text-muted-foreground mb-1">Product (optional)</p>
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
          <div className="col-span-12 sm:col-span-5">
            <FormTextField
              control={control}
              name={`items.${index}.description`}
              label="Description"
              placeholder="Item description"
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <FormNumberField control={control} name={`items.${index}.quantity`} label="Qty" min={0.01} />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <FormSelectField control={control} name={`items.${index}.unit`} label="Unit" options={unitOpts} />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <FormNumberField control={control} name={`items.${index}.unitPrice`} label="Unit price" min={0} />
          </div>
          <div className="col-span-12 sm:col-span-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive"
              disabled={fields.length <= 1}
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <div className="text-sm text-right space-y-1 text-muted-foreground">
        <p>Subtotal: AED {subtotal.toFixed(2)}</p>
        <p>VAT (5%): AED {vat.toFixed(2)}</p>
        <p className="font-semibold text-foreground">Total: AED {total.toFixed(2)}</p>
      </div>
    </div>
  );
}

export function VendorSelectField({ control, name = "vendor" }) {
  const { setValue } = useFormContext();
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
      label="Vendor"
      options={options}
      description="Pick a vendor — company name auto-fills below"
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
