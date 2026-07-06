"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncButton } from "@/components/ui/async-button";
import {
  formItemClassName,
  formLabelClassName,
  formMessageClassName,
  formSelectClassName,
} from "@/components/forms/form-fields";
import { useCategoryOptions } from "@/hooks/use-category-options";
import { usePermissions } from "@/hooks/use-permissions";

const TYPE_LABELS = { product: "product", vendor: "vendor" };
const MODULE_BY_TYPE = {
  product: { resource: "products", href: "/products/categories", label: "Product Categories" },
  vendor: { resource: "vendors", href: "/vendors/categories", label: "Vendor Categories" },
};

/**
 * Category dropdown with optional inline "Add category" dialog.
 * @param {object} props
 * @param {import("react-hook-form").Control} props.control
 * @param {string} props.name
 * @param {"product"|"vendor"} props.type
 */
export function CategorySelectField({ control, name, type, label = "Category" }) {
  const { setValue } = useFormContext();
  const qc = useQueryClient();
  const module = MODULE_BY_TYPE[type];
  const { canWrite } = usePermissions();
  const canAddCategory = canWrite(module.resource);

  const { data: categoryOptions = [], isLoading } = useCategoryOptions(type);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const createMut = useMutation({
    mutationFn: async (categoryName) => {
      const res = await fetch(`/api/${module.resource}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim(), sortOrder: 0, isActive: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (doc) => {
      qc.invalidateQueries({ queryKey: ["category-options", type] });
      qc.invalidateQueries({ queryKey: [`${module.resource}/categories`] });
      qc.invalidateQueries({ queryKey: [`${module.resource}/categories`, "stats"] });
      setValue(name, doc.name, { shouldValidate: true, shouldDirty: true });
      setDialogOpen(false);
      setNewName("");
      toast.success(`Category "${doc.name}" added`);
    },
    onError: (err) => toast.error(err.message),
  });

  function openAddDialog() {
    setNewName("");
    setDialogOpen(true);
  }

  function handleCreate(e) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Enter a category name");
      return;
    }
    createMut.mutate(trimmed);
  }

  return (
    <>
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          const raw =
            field.value === null || field.value === undefined || field.value === ""
              ? ""
              : String(field.value);
          const matched = categoryOptions.find((o) => o.value === raw);
          const selectValue = matched ? matched.value : undefined;

          return (
            <FormItem className={formItemClassName}>
              <div className="flex items-center justify-between gap-2">
                <FormLabel className={formLabelClassName}>{label}</FormLabel>
                {canAddCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-primary"
                    onClick={openAddDialog}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add category
                  </Button>
                )}
              </div>
              <Select
                key={`${name}-${categoryOptions.length}-${raw}`}
                onValueChange={field.onChange}
                value={selectValue}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className={formSelectClassName}>
                    <SelectValue
                      placeholder={isLoading ? "Loading categories…" : "Select category…"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs leading-relaxed text-muted-foreground">
                {canAddCategory ? (
                  <>Use &ldquo;Add category&rdquo; for a quick entry, or manage all in </>
                ) : (
                  <>Manage categories in </>
                )}
                <Link
                  href={module.href}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {module.label}
                </Link>
              </FormDescription>
              <FormMessage className={formMessageClassName} />
            </FormItem>
          );
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => !createMut.isPending && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add {TYPE_LABELS[type]} category</DialogTitle>
              <DialogDescription>
                Creates an active category and selects it for this {TYPE_LABELS[type]}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="inline-category-name">Category name</Label>
              <Input
                id="inline-category-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={
                  type === "product" ? "e.g. Formwork" : "e.g. Equipment Rental"
                }
                autoFocus
                disabled={createMut.isPending}
                className="h-11"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={createMut.isPending}
              >
                Cancel
              </Button>
              <AsyncButton type="submit" loading={createMut.isPending}>
                Add & select
              </AsyncButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
