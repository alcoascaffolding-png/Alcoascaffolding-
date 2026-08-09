"use client";

import { useState } from "react";
import { z } from "zod";
import { Eye } from "lucide-react";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { StatusToggleAction } from "@/components/domain/StatusToggleAction";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  sortOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

const MODULE_CONFIG = {
  product: {
    apiResource: "products/categories",
    permissionResource: "products",
    categoryType: "product",
    title: "Product Categories",
    resourceSingular: "Category",
    description: "Categories used when classifying inventory products",
    namePlaceholder: "e.g. Aluminium Scaffolding",
    formDescription:
      "Inactive categories are hidden from product forms but remain on existing products.",
  },
  vendor: {
    apiResource: "vendors/categories",
    permissionResource: "vendors",
    categoryType: "vendor",
    title: "Vendor Categories",
    resourceSingular: "Category",
    description: "Categories used when classifying purchase vendors",
    namePlaceholder: "e.g. Supplier",
    formDescription:
      "Inactive categories are hidden from vendor forms but remain on existing vendors.",
  },
};

function CategoryFormFields({ control, config }) {
  return (
    <FormSection title="Category details" description={config.formDescription}>
      <FormGrid>
        <FormTextField
          control={control}
          name="name"
          label="Name"
          placeholder={config.namePlaceholder}
        />
        <FormNumberField
          control={control}
          name="sortOrder"
          label="Sort order"
          placeholder="0"
          min={0}
          description="Lower numbers appear first in dropdowns"
        />
        <FormSwitchField
          control={control}
          name="isActive"
          label="Active"
          description="Inactive categories are hidden from dropdowns"
        />
        <FormGridFull>
          <FormTextAreaField
            control={control}
            name="description"
            label="Description (optional)"
            placeholder="Internal notes about when to use this category…"
            rows={2}
          />
        </FormGridFull>
      </FormGrid>
    </FormSection>
  );
}

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "sortOrder",
    header: "Order",
    size: 70,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive !== false ? "success" : "secondary"}>
        {row.original.isActive !== false ? "Active" : "Inactive"}
      </Badge>
    ),
    size: 90,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {row.original.description || "—"}
      </span>
    ),
  },
];

function mapItemToForm(item) {
  return {
    name: item.name || "",
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive !== false,
    description: item.description || "",
  };
}

const DEFAULT_VALUES = {
  name: "",
  sortOrder: 0,
  isActive: true,
  description: "",
};

function CategoryViewDialog({ category, onClose }) {
  const c = category;
  return (
    <Dialog open={!!c} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {c?.name}
            {c && (
              <Badge variant={c.isActive !== false ? "success" : "secondary"}>
                {c.isActive !== false ? "Active" : "Inactive"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Read-only category details.</DialogDescription>
        </DialogHeader>
        {c && (
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-start justify-between gap-4 py-2 border-b">
              <span className="text-muted-foreground">Sort order</span>
              <span className="font-medium">{c.sortOrder ?? 0}</span>
            </div>
            <div className="flex flex-col gap-1 py-2">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium">{c.description || "—"}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModuleCategoryFormFields({ control, moduleType }) {
  return <CategoryFormFields control={control} config={MODULE_CONFIG[moduleType]} />;
}

function ProductCategoryFormFields(props) {
  return <ModuleCategoryFormFields {...props} moduleType="product" />;
}

function VendorCategoryFormFields(props) {
  return <ModuleCategoryFormFields {...props} moduleType="vendor" />;
}

const MODULE_FORM_FIELDS = {
  product: ProductCategoryFormFields,
  vendor: VendorCategoryFormFields,
};

/**
 * @param {{ moduleType: "product" | "vendor" }} props
 */
export function ModuleCategoriesClient({ moduleType }) {
  const config = MODULE_CONFIG[moduleType];
  const FormFields = MODULE_FORM_FIELDS[moduleType];
  const [viewItem, setViewItem] = useState(null);
  const optionsKey = [["category-options", config.categoryType]];

  return (
    <>
      <GenericCRUDPage
        resource={config.apiResource}
        permissionResource={config.permissionResource}
        title={config.title}
        resourceSingular={config.resourceSingular}
        description={config.description}
        columns={columns}
        schema={schema}
        serverPagination
        serverSearch
        defaultPageSize={50}
        defaultSorting={[{ id: "sortOrder", desc: false }]}
        mapItemToForm={mapItemToForm}
        defaultValues={DEFAULT_VALUES}
        FormFields={FormFields}
        prepareSavePayload={(values) => ({
          ...values,
          name: values.name.trim(),
          type: config.categoryType,
        })}
        invalidateQueryKeys={optionsKey}
        extraRowActions={(row) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                setViewItem(row);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <StatusToggleAction
              resource={config.apiResource}
              item={row}
              label="category"
              invalidateKeys={optionsKey}
            />
          </>
        )}
        statCards={(s) => [
          { label: "Total", value: s.total ?? 0 },
          { label: "Active", value: s.active ?? 0 },
          { label: "Inactive", value: s.inactive ?? 0 },
        ]}
        emptyMessage="No categories yet. Add your first category."
      />
      <CategoryViewDialog category={viewItem} onClose={() => setViewItem(null)} />
    </>
  );
}

/** @deprecated Use ModuleCategoriesClient */
export function CategoriesClient() {
  return <ModuleCategoriesClient moduleType="product" />;
}
