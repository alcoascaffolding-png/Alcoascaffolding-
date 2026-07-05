"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AsyncButton } from "@/components/ui/async-button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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
import { Pencil, Trash2, Plus } from "lucide-react";
import { BlockingSaveOverlay } from "@/components/loading/loading-kit";
import { TOAST, mutationErrorMessage } from "@/lib/toast-messages";
import { canWriteResource, canDeleteDocuments } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * Generic CRUD page — table, add/edit dialog, delete confirmation.
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
  allowEdit = true,
  mapItemToForm,
  initialOpenCreate = false,
  presetValues = null,
  detailPath,
  prepareSavePayload,
  /** Singular label for toasts, e.g. "Product" */
  resourceSingular,
  /** Extra query params appended to list fetch, e.g. { stock: "low" } */
  extraListParams = {},
  /** Additional toolbar nodes (filters, export, etc.) */
  toolbarExtra,
  /** Custom empty state message */
  emptyMessage,
  /** Optional row className(row) for highlighting */
  getRowClassName,
  /** Make stat cards clickable — { label: href } */
  statCardLinks,
  /** Enable server-side pagination (page/limit API params) */
  serverPagination = false,
  /** Debounced server-side search (passes `search` query param) */
  serverSearch = false,
  defaultPageSize = 20,
  /** Extra react-query keys to invalidate after save/delete */
  invalidateQueryKeys = [],
  /** Extra icon buttons in the row actions column (before edit/delete) */
  extraRowActions,
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const canWrite = canWriteResource(userRole, resource);
  const canDelete = canDeleteDocuments(userRole);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: defaultPageSize });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const singular = resourceSingular || title.replace(/s$/, "");
  const listQueryKey = serverPagination || serverSearch
    ? [resource, extraListParams, pagination.pageIndex, pagination.pageSize, debouncedSearch]
    : [resource, extraListParams];

  const { data, isLoading } = useQuery({
    queryKey: listQueryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(serverPagination ? pagination.pageSize : 100),
      });
      if (serverPagination) {
        params.set("page", String(pagination.pageIndex + 1));
      }
      if (serverSearch && debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      Object.entries(extraListParams).forEach(([k, v]) => {
        if (v != null && v !== "") params.set(k, String(v));
      });
      const res = await fetch(`/api/${resource}?${params}`);
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

  useEffect(() => {
    if (!initialOpenCreate) return;
    form.reset({ ...defaultValues, ...(presetValues || {}) });
    setEditItem({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (serverPagination || serverSearch) {
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }
  }, [extraListParams, serverPagination, serverSearch, debouncedSearch]);

  function openCreate() {
    form.reset(defaultValues);
    setEditItem({});
  }

  function openEdit(item) {
    form.reset(mapItemToForm ? mapItemToForm(item) : item);
    setEditItem(item);
  }

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: [resource] });
    qc.invalidateQueries({ queryKey: [resource, "stats"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    qc.invalidateQueries({ queryKey: ["dashboard-inventory"] });
    for (const key of invalidateQueryKeys) {
      qc.invalidateQueries({ queryKey: key });
    }
  }

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const isEdit = editItem?._id;
      const url = isEdit ? `/api/${resource}/${editItem._id}` : `/api/${resource}`;
      const method = isEdit ? "PATCH" : "POST";
      const payload = prepareSavePayload ? prepareSavePayload(values, !!isEdit) : values;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    onSuccess: () => {
      invalidateAll();
      const wasEdit = !!editItem?._id;
      setEditItem(null);
      toast.success(wasEdit ? TOAST.updated(singular) : TOAST.created(singular));
    },
    onError: (e) => toast.error(mutationErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      invalidateAll();
      setDeleteId(null);
      toast.success(TOAST.deleted(singular));
    },
    onError: (e) => toast.error(mutationErrorMessage(e)),
  });

  const isEditing = !!editItem?._id;

  const actionColumn = {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {extraRowActions?.(row.original)}
        {FormFields && allowEdit && canWrite && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.original._id); }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    ),
    size: 110,
  };

  const columns = [...externalColumns, actionColumn];

  return (
    <>
      {stats && statCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {statCards(stats).map((s) => {
            const href = statCardLinks?.[s.label];
            const inner = (
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn("font-bold", s.valueClassName ?? "text-2xl")}>{s.value}</p>
                {s.subtitle ? (
                  <p className="text-xs text-muted-foreground mt-1">{s.subtitle}</p>
                ) : null}
              </CardContent>
            );
            return href ? (
              <button
                key={s.label}
                type="button"
                onClick={() => router.push(href)}
                className="text-left rounded-lg border bg-card shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {inner}
              </button>
            ) : (
              <Card key={s.label}>{inner}</Card>
            );
          })}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        emptyMessage={emptyMessage || `No ${title.toLowerCase()} found.`}
        emptyIcon={resource === "products" ? "products" : "default"}
        manualPagination={serverPagination}
        pageCount={serverPagination ? (data?.pages || 1) : undefined}
        totalRecords={serverPagination ? (data?.total || 0) : undefined}
        paginationState={serverPagination ? pagination : undefined}
        onPaginationChange={serverPagination ? setPagination : undefined}
        serverSearch={serverSearch}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onRowClick={
          detailPath
            ? (row) => router.push(`${detailPath}/${String(row._id)}`)
            : undefined
        }
        getRowClassName={getRowClassName}
        toolbar={
          <>
            {toolbarExtra}
            {FormFields && canWrite && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add {singular}
              </Button>
            )}
          </>
        }
      />

      {FormFields && canWrite && (
        <Dialog
          open={editItem !== null}
          onOpenChange={(open) => {
            if (!open && !saveMut.isPending) setEditItem(null);
          }}
        >
          <DialogContent
            className={cn(
              "flex flex-col gap-0 overflow-hidden p-0",
              "fixed inset-0 z-50 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0",
              "sm:inset-auto sm:left-[50%] sm:top-[2vh] sm:h-[96vh] sm:w-[min(96vw,1100px)] sm:max-w-[1100px] sm:translate-x-[-50%] sm:translate-y-0 sm:rounded-xl sm:border sm:shadow-2xl"
            )}
          >
            {saveMut.isPending && (
              <BlockingSaveOverlay
                title={isEditing ? `Updating ${singular.toLowerCase()}…` : `Creating ${singular.toLowerCase()}…`}
                description="Please wait while we save your changes."
              />
            )}
            <DialogHeader className="shrink-0 space-y-1 border-b border-border/80 bg-background px-5 py-5 text-left sm:px-8">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {isEditing ? `Edit ${singular}` : `New ${singular}`}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {isEditing
                  ? `Update the details below and save your changes.`
                  : `Complete the sections below to add a new ${singular.toLowerCase()} to your records.`}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
                className="flex min-h-0 flex-1 flex-col"
                aria-busy={saveMut.isPending}
              >
                <div className="flex-1 overflow-y-auto bg-muted/20 px-5 py-6 dark:bg-muted/10 sm:px-8 sm:py-8">
                  <div className="mx-auto max-w-4xl space-y-8">
                    <FormFields control={form.control} />
                  </div>
                </div>
                <DialogFooter className="shrink-0 gap-3 border-t border-border/80 bg-background px-5 py-4 sm:px-8">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-[100px]"
                    onClick={() => setEditItem(null)}
                    disabled={saveMut.isPending}
                  >
                    Cancel
                  </Button>
                  <AsyncButton
                    type="submit"
                    className="min-w-[120px]"
                    loading={saveMut.isPending}
                    idleLabel={isEditing ? "Save changes" : `Create ${singular}`}
                    pendingLabel={isEditing ? "Saving…" : "Creating…"}
                  />
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open && !deleteMut.isPending) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMut.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteMut.isPending || !deleteId) return;
                deleteMut.mutate(deleteId);
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
