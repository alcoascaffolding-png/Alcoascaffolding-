"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import {
  FormTextField,
  FormTextAreaField,
  FormNumberField,
  FormSwitchField,
} from "@/components/forms/form-fields";
import { FormSection, FormGrid, FormGridFull } from "@/components/forms/form-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { isLowStock, isOutOfStock } from "@/lib/inventory-utils";
import { cn } from "@/lib/utils";
import { VendorSelectField } from "@/components/shared/PurchaseLineItemsFields";
import { CategorySelectField } from "@/components/shared/CategorySelectField";

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
  reorderLevel: z.coerce.number().min(0).default(0),
  maxStock: z.coerce.number().min(0).default(0),
  preferredVendor: z.string().optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

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
      const out = isOutOfStock(row.original);
      return (
        <div className="flex flex-col gap-0.5">
          <span>
            {current} {row.original.unit}
          </span>
          {out && (
            <Badge variant="destructive" className="w-fit text-[10px] px-1.5 py-0">
              Out of stock
            </Badge>
          )}
          {low && !out && (
            <Badge variant="warning" className="w-fit text-[10px] px-1.5 py-0">
              Low (min {min})
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
    <>
      <FormSection title="Product details" description="Core identification and classification.">
        <FormGrid>
          <FormTextField control={control} name="itemCode" label="Item code" placeholder="e.g. ALU-001" />
          <FormTextField control={control} name="name" label="Product name" placeholder="e.g. Aluminium Tower 4m" />
          <CategorySelectField control={control} name="category" type="product" />
          <FormTextField control={control} name="unit" label="Unit of measure" placeholder="e.g. Nos, Set, M" />
          <FormGridFull>
            <FormTextAreaField
              control={control}
              name="description"
              label="Description"
              placeholder="Specifications, dimensions, or usage notes…"
              rows={3}
            />
          </FormGridFull>
        </FormGrid>
      </FormSection>

      <FormSection title="Pricing (AED)" description="Purchase, sale, and rental rates.">
        <FormGrid cols={3}>
          <FormNumberField control={control} name="purchasePrice" label="Purchase price" placeholder="0.00" min={0} step={0.01} />
          <FormNumberField control={control} name="sellingPrice" label="Selling price" placeholder="0.00" min={0} step={0.01} />
          <FormNumberField control={control} name="rentalPrice" label="Rental / day" placeholder="0.00" min={0} step={0.01} />
        </FormGrid>
      </FormSection>

      <FormSection title="Inventory" description="Stock levels and replenishment thresholds.">
        <FormGrid cols={3}>
          <FormNumberField control={control} name="currentStock" label="Current stock" placeholder="0" min={0} />
          <FormNumberField
            control={control}
            name="minStock"
            label="Min stock (alert)"
            placeholder="0"
            min={0}
            description="Warn when stock reaches this level"
          />
          <FormNumberField
            control={control}
            name="reorderLevel"
            label="Reorder level"
            placeholder="0"
            min={0}
            description="Suggested qty when replenishing"
          />
          <FormNumberField control={control} name="maxStock" label="Max stock" placeholder="0" min={0} />
        </FormGrid>
      </FormSection>

      <FormSection title="Supplier & status">
        <div className="space-y-4">
          <VendorSelectField
            control={control}
            name="preferredVendor"
            label="Preferred vendor"
            description="Used when auto-creating a purchase order from low stock"
          />
          <FormSwitchField
            control={control}
            name="isActive"
            label="Active product"
            description="Inactive products are hidden from pickers and sales forms"
          />
        </div>
      </FormSection>
    </>
  );
}

function mapProductToForm(item) {
  const vendor = item.preferredVendor;
  const vendorId =
    vendor && typeof vendor === "object" && vendor._id != null
      ? String(vendor._id)
      : vendor != null
        ? String(vendor)
        : "__none__";

  return {
    itemCode: item.itemCode || "",
    name: item.name || "",
    category: item.category || "",
    unit: item.unit || "Nos",
    purchasePrice: item.purchasePrice ?? 0,
    sellingPrice: item.sellingPrice ?? 0,
    rentalPrice: item.rentalPrice ?? 0,
    currentStock: item.currentStock ?? 0,
    minStock: item.minStock ?? 0,
    reorderLevel: item.reorderLevel ?? 0,
    maxStock: item.maxStock ?? 0,
    preferredVendor: vendorId,
    isActive: item.isActive !== false,
    description: item.description || "",
  };
}

function prepareProductPayload(values) {
  return {
    ...values,
    preferredVendor:
      values.preferredVendor && values.preferredVendor !== "__none__"
        ? values.preferredVendor
        : undefined,
  };
}

const STOCK_FILTERS = [
  { value: "all", label: "All products" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
  { value: "critical", label: "Low + out of stock" },
];

export function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stockFilter = searchParams.get("stock") || "all";

  const extraListParams = useMemo(() => {
    if (!stockFilter || stockFilter === "all") return {};
    return { stock: stockFilter };
  }, [stockFilter]);

  function setStockFilter(value) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete("stock");
    else params.set("stock", value);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
  }

  return (
    <GenericCRUDPage
      resource="products"
      title="Products"
      resourceSingular="Product"
      description="Scaffolding products and equipment"
      columns={columns}
      schema={productSchema}
      extraListParams={extraListParams}
      serverPagination
      serverSearch
      defaultPageSize={20}
      detailPath="/products"
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
        reorderLevel: 0,
        maxStock: 0,
        preferredVendor: "__none__",
        isActive: true,
        description: "",
      }}
      mapItemToForm={mapProductToForm}
      prepareSavePayload={prepareProductPayload}
      FormFields={ProductFormFields}
      statCards={(s) => [
        { label: "Total Products", value: s.total ?? 0 },
        { label: "Active", value: s.active ?? s.total ?? 0 },
        {
          label: "Low Stock",
          value: s.lowStock ?? 0,
          valueClassName: s.lowStock > 0 ? "text-2xl font-bold text-amber-600" : "text-2xl font-bold",
        },
        {
          label: "Out of Stock",
          value: s.outOfStock ?? 0,
          valueClassName: s.outOfStock > 0 ? "text-2xl font-bold text-red-600" : "text-2xl font-bold",
        },
      ]}
      statCardLinks={{
        "Low Stock": "/products?stock=low",
        "Out of Stock": "/products?stock=out",
      }}
      getRowClassName={(row) =>
        cn(
          isOutOfStock(row) && "bg-red-50/50 dark:bg-red-950/20",
          isLowStock(row) && !isOutOfStock(row) && "bg-amber-50/40 dark:bg-amber-950/15"
        )
      }
      toolbarExtra={
        <>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Stock filter" />
            </SelectTrigger>
            <SelectContent>
              {STOCK_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/purchase-orders?from=low-stock">
            <Button size="sm" variant="outline">
              Create PO from low stock
            </Button>
          </Link>
        </>
      }
      emptyMessage={
        stockFilter !== "all"
          ? "No products match this stock filter."
          : "No products found."
      }
    />
  );
}
