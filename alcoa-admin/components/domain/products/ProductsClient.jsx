"use client";

import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import {
  FormTextField,
  FormSelectField,
  FormNumberField,
  FormSwitchField,
} from "@/components/forms/form-fields";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const productSchema = z.object({
  itemCode: z.string().min(1, "Item code required"),
  name: z.string().min(1, "Name required"),
  category: z.string().optional(),
  unit: z.string().default("Nos"),
  sellingPrice: z.coerce.number().min(0).default(0),
  rentalPrice: z.coerce.number().min(0).default(0),
  purchasePrice: z.coerce.number().min(0).default(0),
  currentStock: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  maxStock: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

const categoryOptions = [
  { value: "Aluminium Scaffolding", label: "Aluminium Scaffolding" },
  { value: "Steel Scaffolding", label: "Steel Scaffolding" },
  { value: "Ladders", label: "Ladders" },
  { value: "Accessories", label: "Accessories" },
  { value: "Safety Equipment", label: "Safety Equipment" },
  { value: "Other", label: "Other" },
];

function isLowStock(row) {
  const min = Number(row.minStock) || 0;
  const current = Number(row.currentStock) ?? 0;
  return row.isActive !== false && min > 0 && current <= min;
}

const columns = [
  { accessorKey: "itemCode", header: "Code", size: 100 },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="outline">{row.original.category}</Badge>
      ) : null,
  },
  {
    accessorKey: "currentStock",
    header: "Stock",
    cell: ({ row }) => {
      const current = row.original.currentStock ?? 0;
      const min = row.original.minStock ?? 0;
      const low = isLowStock(row.original);
      return (
        <div className="flex flex-col gap-0.5">
          <span>
            {current} {row.original.unit}
          </span>
          {low && (
            <Badge variant="destructive" className="w-fit text-[10px] px-1.5 py-0">
              Low (min {min})
            </Badge>
          )}
          {!low && current <= 0 && row.original.isActive !== false && (
            <Badge variant="warning" className="w-fit text-[10px] px-1.5 py-0">
              Out of stock
            </Badge>
          )}
        </div>
      );
    },
    size: 110,
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Price",
    cell: ({ row }) => formatCurrency(row.original.sellingPrice || 0),
    size: 110,
  },
  {
    accessorKey: "rentalPrice",
    header: "Rental/Day",
    cell: ({ row }) => formatCurrency(row.original.rentalPrice || 0),
    size: 110,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive !== false ? "success" : "secondary"}>
        {row.original.isActive !== false ? "Active" : "Inactive"}
      </Badge>
    ),
    size: 80,
  },
];

function ProductFormFields({ control }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormTextField control={control} name="itemCode" label="Item Code" placeholder="ALU-001" />
      <FormTextField
        control={control}
        name="name"
        label="Product Name"
        placeholder="Aluminium Tower 4m"
      />
      <FormSelectField control={control} name="category" label="Category" options={categoryOptions} />
      <FormTextField control={control} name="unit" label="Unit" placeholder="Nos" />
      <FormNumberField
        control={control}
        name="purchasePrice"
        label="Purchase Price (AED)"
        min={0}
        step={0.01}
      />
      <FormNumberField
        control={control}
        name="sellingPrice"
        label="Selling Price (AED)"
        min={0}
        step={0.01}
      />
      <FormNumberField
        control={control}
        name="rentalPrice"
        label="Rental Price/Day (AED)"
        min={0}
        step={0.01}
      />
      <FormNumberField control={control} name="currentStock" label="Current Stock" min={0} />
      <FormNumberField
        control={control}
        name="minStock"
        label="Min Stock (alert)"
        min={0}
        description="Alert when stock falls to this level"
      />
      <FormNumberField control={control} name="maxStock" label="Max Stock" min={0} />
      <div className="col-span-2">
        <FormSwitchField control={control} name="isActive" label="Active product" />
      </div>
      <FormTextField
        control={control}
        name="description"
        label="Description"
        placeholder="Optional description"
        className="col-span-2"
      />
    </div>
  );
}

export function ProductsClient() {
  return (
    <GenericCRUDPage
      resource="products"
      title="Products"
      description="Scaffolding products and equipment"
      columns={columns}
      schema={productSchema}
      defaultValues={{
        itemCode: "",
        name: "",
        category: "",
        unit: "Nos",
        purchasePrice: 0,
        sellingPrice: 0,
        rentalPrice: 0,
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        isActive: true,
        description: "",
      }}
      FormFields={ProductFormFields}
      statCards={(s) => [
        { label: "Total Products", value: s.total ?? 0 },
        { label: "Active", value: s.active ?? s.total ?? 0 },
        { label: "Low Stock", value: s.lowStock ?? 0 },
        { label: "Out of Stock", value: s.outOfStock ?? 0 },
      ]}
    />
  );
}
