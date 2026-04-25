"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Package, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

/**
 * Generic CRUD page that displays a table, add/edit dialog, and delete confirmation.
 *
 * Props:
 * - resource: string (e.g. "products")
 * - title: string
 * - description: string
 * - columns: TanStack Table column defs
 * - schema: Zod schema for form validation
 * - defaultValues: object
 * - FormFields: React component receiving { control }
 * - statCards: function(data) → [{label, value}]
 */
export function GenericCRUDPage({
  resource,
  title,
  description,
  columns: externalColumns,
  schema,
  defaultValues,
  FormFields,
  statCards,
}) {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState(null); // null = closed, {} = new, item = edit
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: [resource],
    queryFn: async () => {
      const res = await fetch(`/api/${resource}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: [resource, "stats"],
    queryFn: async () => {
      const res = await fetch(`/api/${resource}/stats`);
      const d = await res.json();
      return d.data;
    },
  });

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  function openCreate() {
    form.reset(defaultValues);
    setEditItem({});
  }

  function openEdit(item) {
    form.reset(item);
    setEditItem(item);
  }

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const isEdit = editItem?._id;
      const url = isEdit ? `/api/${resource}/${editItem._id}` : `/api/${resource}`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      setEditItem(null);
      toast.success(editItem?._id ? "Updated successfully" : "Created successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [resource] });
      setDeleteId(null);
      toast.success("Deleted successfully");
    },
    onError: (e) => toast.error(e.message),
  });

  const actionColumn = {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {FormFields && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); setDeleteId(row.original._id); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
    size: 80,
  };

  const columns = [...externalColumns, actionColumn];

  return (
    <>
      {/* Stats */}
      {stats && statCards && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {statCards(stats).map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        toolbar={
          FormFields && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add {title.slice(0, -1)}
            </Button>
          )
        }
      />

      {/* Create/Edit dialog */}
      {FormFields && (
        <Dialog open={editItem !== null} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editItem?._id ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}</DialogTitle>
              <DialogDescription>
                {editItem?._id
                  ? `Update this ${title.slice(0, -1).toLowerCase()} using the form below.`
                  : `Fill in the form to create a new ${title.slice(0, -1).toLowerCase()}.`}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => saveMut.mutate(v))} className="space-y-4">
                <FormFields control={form.control} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
                  <Button type="submit" disabled={saveMut.isPending}>
                    {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editItem?._id ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {title.slice(0, -1).toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
