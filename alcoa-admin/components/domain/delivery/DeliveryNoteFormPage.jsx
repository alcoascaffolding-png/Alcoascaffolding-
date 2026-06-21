"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField,
  FormSelectField,
  FormTextAreaField,
  FormNumberField,
} from "@/components/forms/form-fields";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { BlockingSaveOverlay } from "@/components/loading/loading-kit";
import { QuotationFormEditSkeleton } from "@/components/loading/skeleton-kit";
import { customerSnapshotToQuotationFormPatch } from "@/lib/map-customer-to-quotation";
import { DocumentCustomerCard } from "@/components/domain/documents/DocumentCustomerCard";
import { ProductPicker } from "@/components/shared/ProductPicker";

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  productId: z.string().optional(),
  equipmentType: z.string().optional(),
  specifications: z.string().optional(),
  size: z.string().optional(),
  weight: z.coerce.number().min(0).default(0),
  cbm: z.coerce.number().min(0).default(0),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().default("Nos"),
});

const noteSchema = z.object({
  customer: z.string().optional(),
  customerName: z.string().min(1, "Customer name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  salesOrder: z.string().optional(),
  quotation: z.string().optional(),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  driverName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  status: z.enum(["draft", "ready", "dispatched", "in_transit", "delivered", "cancelled"]),
  noteType: z.enum(["delivery", "return"]).default("delivery"),
  items: z.array(lineItemSchema).min(1, "At least one line item"),
  notes: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

const today = new Date().toISOString().split("T")[0];
function mapDnItemToForm(it) {
  return {
    description: it.description || it.equipmentType || "",
    productId: it.product ? String(it.product) : "",
    equipmentType: it.equipmentType || "",
    specifications: it.specifications || "",
    size: it.size || "",
    weight: Number(it.weight) || 0,
    cbm: Number(it.cbm) || 0,
    quantity: it.quantity,
    unit: it.unit || "Nos",
  };
}

const defaultItem = {
  description: "",
  productId: "",
  equipmentType: "",
  specifications: "",
  size: "",
  weight: 0,
  cbm: 0,
  quantity: 1,
  unit: "Nos",
};

function findFulfillmentLine(fulfillment, item, index) {
  if (!fulfillment?.lines?.length || !item) return null;
  if (item.productId) {
    const byProduct = fulfillment.lines.find(
      (l) => l.productId && String(l.productId) === String(item.productId)
    );
    if (byProduct) return byProduct;
  }
  const desc = String(item.equipmentType || item.description || "")
    .trim()
    .toLowerCase();
  if (desc) {
    const byDesc = fulfillment.lines.find(
      (l) =>
        String(l.description || l.equipmentType || "")
          .trim()
          .toLowerCase() === desc
    );
    if (byDesc) return byDesc;
  }
  return fulfillment.lines[index] || null;
}

const noteTypeOpts = [
  { value: "delivery", label: "Delivery (outbound)" },
  { value: "return", label: "Return / off-hire (inbound)" },
];

const statusOpts = [
  "draft",
  "ready",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const unitOpts = ["Nos", "Set", "M", "Sqm", "Day", "Week", "Month", "Job"].map((v) => ({
  value: v,
  label: v,
}));

export function DeliveryNoteFormPage({ id }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const isEdit = !!id;
  const prefillSalesOrderId = searchParams.get("salesOrder");

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["delivery-notes", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/delivery-notes/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      customer: "__none__",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      salesOrder: "__none__",
      quotation: "__none__",
      deliveryDate: today,
      deliveryAddress: "",
      driverName: "",
      vehicleNumber: "",
      contactPersonName: "",
      contactPersonPhone: "",
      status: "draft",
      noteType: "delivery",
      items: [{ ...defaultItem }],
      notes: "",
      deliveryInstructions: "",
    },
  });

  useEffect(() => {
    if (!existing) return;
    const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");
    const cust = existing.customer;
    const customerId =
      cust && typeof cust === "object" && cust._id != null
        ? String(cust._id)
        : cust != null
          ? String(cust)
          : "__none__";
    const so = existing.salesOrder;
    const salesOrderId =
      so && typeof so === "object" && so._id != null
        ? String(so._id)
        : so != null
          ? String(so)
          : "__none__";
    const q = existing.quotation;
    const quotationId =
      q && typeof q === "object" && q._id != null
        ? String(q._id)
        : q != null
          ? String(q)
          : "__none__";

    form.reset({
      customer: customerId,
      customerName: existing.customerName || "",
      customerEmail: existing.customerEmail || "",
      customerPhone: existing.customerPhone || "",
      customerAddress: existing.customerAddress || "",
      salesOrder: salesOrderId,
      quotation: quotationId,
      deliveryDate: fmt(existing.deliveryDate) || today,
      deliveryAddress: existing.deliveryAddress || "",
      driverName: existing.driverName || "",
      vehicleNumber: existing.vehicleNumber || "",
      contactPersonName: existing.contactPersonName || "",
      contactPersonPhone: existing.contactPersonPhone || "",
      status: existing.status || "draft",
      noteType: existing.noteType === "return" ? "return" : "delivery",
      items:
        existing.items?.length > 0
          ? existing.items.map(mapDnItemToForm)
          : [{ ...defaultItem }],
      notes: existing.notes || "",
      deliveryInstructions: existing.deliveryInstructions || "",
    });
  }, [existing, form]);

  const { data: prefillFromSo, isSuccess: prefillLoaded } = useQuery({
    queryKey: ["sales-orders", "delivery-note-prefill", prefillSalesOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${prefillSalesOrderId}/delivery-note-prefill`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !isEdit && !!prefillSalesOrderId,
  });

  const prefillAppliedRef = useRef(false);
  useEffect(() => {
    if (isEdit || !prefillLoaded || !prefillFromSo || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : today);
    form.reset({
      customer: prefillFromSo.customer || "__none__",
      customerName: prefillFromSo.customerName || "",
      customerEmail: prefillFromSo.customerEmail || "",
      customerPhone: prefillFromSo.customerPhone || "",
      customerAddress: prefillFromSo.customerAddress || "",
      salesOrder: prefillFromSo.salesOrder || "__none__",
      quotation: prefillFromSo.quotation || "__none__",
      deliveryDate: fmt(prefillFromSo.deliveryDate),
      deliveryAddress: prefillFromSo.deliveryAddress || "",
      contactPersonName: prefillFromSo.contactPersonName || "",
      contactPersonPhone: prefillFromSo.contactPersonPhone || "",
      status: "draft",
      items:
        prefillFromSo.items?.length > 0
          ? prefillFromSo.items.map(mapDnItemToForm)
          : [{ ...defaultItem }],
      notes: prefillFromSo.notes || "",
      deliveryInstructions: "",
      driverName: "",
      vehicleNumber: "",
    });
    toast.success(`Prefilled from sales order ${prefillFromSo.salesOrderNumber || ""}`);
    if (prefillFromSo.deliveryFulfillment?.summary?.fullyDelivered) {
      toast.warning(
        "This sales order is fully delivered. Remaining qty is zero — adjust lines manually if needed."
      );
    } else if (!prefillFromSo.items?.length) {
      toast.info("No remaining quantity to deliver on this sales order.");
    }
  }, [isEdit, prefillLoaded, prefillFromSo, form]);

  const loadedCustomerId = useMemo(() => {
    if (!existing) return null;
    const c = existing.customer;
    if (c && typeof c === "object" && c._id != null) return String(c._id);
    if (c != null) return String(c);
    return null;
  }, [existing]);

  const { data: customerList } = useQuery({
    queryKey: ["customers", "delivery-note-form"],
    queryFn: async () => {
      const res = await fetch("/api/customers?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesOrderList } = useQuery({
    queryKey: ["sales-orders", "delivery-note-form"],
    queryFn: async () => {
      const res = await fetch("/api/sales-orders?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 30 * 1000,
  });

  const selectedCustomerId = form.watch("customer");
  useEffect(() => {
    if (!selectedCustomerId || selectedCustomerId === "__none__" || !customerList?.length) return;
    if (isEdit && loadedCustomerId && String(selectedCustomerId) === String(loadedCustomerId)) return;
    const c = customerList.find((x) => String(x._id) === String(selectedCustomerId));
    if (!c) return;
    const patch = customerSnapshotToQuotationFormPatch(c);
    form.setValue("customerName", patch.customerName || "", { shouldDirty: true });
    form.setValue("customerEmail", patch.customerEmail || "", { shouldDirty: true });
    form.setValue("customerPhone", patch.customerPhone || "", { shouldDirty: true });
    if (patch.customerAddress) {
      form.setValue("customerAddress", patch.customerAddress, { shouldDirty: true });
    }
  }, [selectedCustomerId, customerList, form, isEdit, loadedCustomerId]);

  const customerSelectOptions = useMemo(() => {
    const list = [...(customerList || [])];
    return [
      { value: "__none__", label: "— Manual / auto-create prospect —" },
      ...list.map((c) => ({ value: String(c._id), label: c.companyName })),
    ];
  }, [customerList]);

  const salesOrderSelectOptions = useMemo(() => {
    const list = [...(salesOrderList || [])];
    return [
      { value: "__none__", label: "— None (standalone) —" },
      ...list.map((o) => ({
        value: String(o._id),
        label: `${o.orderNumber} — ${o.customerName} (${o.status})`,
      })),
    ];
  }, [salesOrderList]);

  const lastSyncedSalesOrderRef = useRef("__none__");
  const selectedSalesOrderId = useWatch({ control: form.control, name: "salesOrder" });
  const noteType = useWatch({ control: form.control, name: "noteType" });

  const { data: soFulfillment } = useQuery({
    queryKey: ["sales-orders", "delivery-fulfillment", selectedSalesOrderId, isEdit ? id : null],
    queryFn: async () => {
      const qs = isEdit && id ? `?excludeDeliveryNote=${encodeURIComponent(id)}` : "";
      const res = await fetch(
        `/api/sales-orders/${selectedSalesOrderId}/delivery-fulfillment${qs}`
      );
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled:
      !!selectedSalesOrderId &&
      selectedSalesOrderId !== "__none__" &&
      noteType === "delivery",
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!selectedSalesOrderId || selectedSalesOrderId === "__none__") return;
    if (String(selectedSalesOrderId) === String(lastSyncedSalesOrderRef.current)) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/sales-orders/${selectedSalesOrderId}/delivery-note-prefill`);
        const d = await res.json();
        if (cancelled) return;
        if (!d.success) {
          lastSyncedSalesOrderRef.current = String(selectedSalesOrderId);
          return;
        }
        const p = d.data;
        lastSyncedSalesOrderRef.current = String(selectedSalesOrderId);
        const fmt = (date) => (date ? new Date(date).toISOString().split("T")[0] : "");
        if (p.customer) form.setValue("customer", p.customer, { shouldDirty: true });
        if (p.quotation) form.setValue("quotation", p.quotation, { shouldDirty: true });
        form.setValue("customerName", p.customerName || "", { shouldDirty: true });
        form.setValue("customerEmail", p.customerEmail || "", { shouldDirty: true });
        form.setValue("customerPhone", p.customerPhone || "", { shouldDirty: true });
        form.setValue("customerAddress", p.customerAddress || "", { shouldDirty: true });
        form.setValue("deliveryAddress", p.deliveryAddress || "", { shouldDirty: true });
        if (p.deliveryDate) form.setValue("deliveryDate", fmt(p.deliveryDate), { shouldDirty: true });
        form.setValue("contactPersonName", p.contactPersonName || "", { shouldDirty: true });
        form.setValue("contactPersonPhone", p.contactPersonPhone || "", { shouldDirty: true });
        if (p.items?.length) {
          form.setValue(
            "items",
            p.items.map(mapDnItemToForm),
            { shouldDirty: true }
          );
        } else {
          form.setValue("items", [{ ...defaultItem }], { shouldDirty: true });
          if (p.deliveryFulfillment?.summary?.fullyDelivered) {
            toast.warning("Sales order fully delivered — no remaining qty to prefill.");
          }
        }
        if (p.notes) form.setValue("notes", p.notes, { shouldDirty: true });
        toast.success("Filled from sales order");
      } catch {
        if (!cancelled) lastSyncedSalesOrderRef.current = String(selectedSalesOrderId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSalesOrderId, form]);

  useEffect(() => {
    if (!isEdit || !existing) return;
    const soid = existing.salesOrder?._id ?? existing.salesOrder;
    lastSyncedSalesOrderRef.current = soid != null ? String(soid) : "__none__";
  }, [isEdit, existing]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = useWatch({ control: form.control, name: "items" });

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const items = values.items.map((item) => ({
        description: item.description,
        product: item.productId || undefined,
        equipmentType: item.equipmentType || item.description,
        specifications: item.specifications || undefined,
        size: item.size || undefined,
        weight: Number(item.weight) || 0,
        cbm: Number(item.cbm) || 0,
        quantity: Number(item.quantity) || 0,
        unit: item.unit || "Nos",
      }));

      const payload = {
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        customerAddress: values.customerAddress || undefined,
        deliveryDate: values.deliveryDate || undefined,
        deliveryAddress: values.deliveryAddress || undefined,
        driverName: values.driverName || undefined,
        vehicleNumber: values.vehicleNumber || undefined,
        contactPersonName: values.contactPersonName || undefined,
        contactPersonPhone: values.contactPersonPhone || undefined,
        status: values.status,
        noteType: values.noteType || "delivery",
        items,
        notes: values.notes || undefined,
        deliveryInstructions: values.deliveryInstructions || undefined,
      };

      if (values.customer && values.customer !== "__none__") {
        payload.customer = String(values.customer);
      } else if (isEdit) {
        payload.customer = null;
      }
      if (values.salesOrder && values.salesOrder !== "__none__") {
        payload.salesOrder = String(values.salesOrder);
      } else if (isEdit) {
        payload.salesOrder = null;
      }
      if (values.quotation && values.quotation !== "__none__") {
        payload.quotation = String(values.quotation);
      } else if (isEdit) {
        payload.quotation = null;
      }

      const url = isEdit ? `/api/delivery-notes/${id}` : "/api/delivery-notes";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["delivery-notes"] });
      qc.invalidateQueries({ queryKey: ["delivery-notes-stats"] });
      toast.success(isEdit ? "Delivery note updated" : "Delivery note created");
      const nid = data._id ?? data.id;
      router.push(`/delivery-notes/${nid}`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isEdit && loadingExisting) {
    return <QuotationFormEditSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className="space-y-6 relative"
        aria-busy={saveMut.isPending}
      >
        {saveMut.isPending && (
          <BlockingSaveOverlay
            title={isEdit ? "Updating delivery note…" : "Creating delivery note…"}
            description="Saving delivery details and line items."
          />
        )}
        <div className="flex items-center gap-3 mb-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Delivery Note" : "New Delivery Note"}
            </h1>
            {isEdit && existing && (
              <p className="text-sm text-muted-foreground font-mono">{existing.deliveryNoteNumber}</p>
            )}
          </div>
        </div>

        <DocumentCustomerCard control={form.control} customerOptions={customerSelectOptions}>
          <FormSelectField
            control={form.control}
            name="salesOrder"
            label="Link sales order (optional)"
            description="Pick a sales order to pull customer and line items (no pricing)."
            options={salesOrderSelectOptions}
            className="md:col-span-2"
          />
        </DocumentCustomerCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextField
              control={form.control}
              name="deliveryDate"
              label="Delivery date"
              type="date"
            />
            <FormSelectField control={form.control} name="status" label="Status" options={statusOpts} />
            <FormSelectField control={form.control} name="noteType" label="Note type" options={noteTypeOpts} />
            <FormTextField
              control={form.control}
              name="deliveryAddress"
              label="Delivery address"
              className="md:col-span-2"
            />
            <FormTextField control={form.control} name="customerAddress" label="Customer address" />
            <FormTextField control={form.control} name="driverName" label="Driver name" />
            <FormTextField control={form.control} name="vehicleNumber" label="Vehicle number" />
            <FormTextField control={form.control} name="contactPersonName" label="Contact person" />
            <FormTextField control={form.control} name="contactPersonPhone" label="Contact phone" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Items to deliver</CardTitle>
              {soFulfillment?.summary && noteType === "delivery" && (
                <p className="text-sm text-muted-foreground mt-1">
                  {soFulfillment.summary.totalRemaining.toFixed(0)} qty remaining on sales order
                  {soFulfillment.summary.totalPending > 0
                    ? ` (${soFulfillment.summary.totalPending.toFixed(0)} in open notes)`
                    : ""}
                </p>
              )}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => append({ ...defaultItem })}>
              <Plus className="h-4 w-4 mr-1" /> Add line
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const lineItem = watchedItems?.[index];
              const fLine =
                noteType === "delivery" && soFulfillment
                  ? findFulfillmentLine(soFulfillment, lineItem, index)
                  : null;
              const qtyExceeds =
                fLine != null && Number(lineItem?.quantity) > fLine.remainingQty + 0.0001;
              return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b pb-4 last:border-0"
              >
                <div className="md:col-span-12">
                  <p className="text-xs text-muted-foreground mb-1">Product (for stock tracking)</p>
                  <ProductPicker
                    value={watchedItems?.[index]?.productId || ""}
                    quoteType="sales"
                    onSelect={(product) => {
                      if (!product) {
                        form.setValue(`items.${index}.productId`, "");
                        return;
                      }
                      form.setValue(`items.${index}.productId`, String(product._id));
                      form.setValue(`items.${index}.equipmentType`, product.name || "");
                      if (!watchedItems?.[index]?.description) {
                        form.setValue(`items.${index}.description`, product.name || "");
                      }
                      form.setValue(`items.${index}.unit`, product.unit || "Nos");
                    }}
                  />
                </div>
                <div className="md:col-span-4">
                  <FormTextField
                    control={form.control}
                    name={`items.${index}.description`}
                    label="Description"
                  />
                </div>
                <div className="md:col-span-2">
                  <FormNumberField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    label="Qty"
                  />
                  {fLine != null && (
                    <p
                      className={`text-xs mt-1 ${
                        qtyExceeds ? "text-destructive font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {qtyExceeds
                        ? `Exceeds remaining ${fLine.remainingQty} ${fLine.unit}`
                        : `${fLine.remainingQty} remaining`}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <FormSelectField
                    control={form.control}
                    name={`items.${index}.unit`}
                    label="Unit"
                    options={unitOpts}
                  />
                </div>
                <div className="md:col-span-1">
                  <FormNumberField
                    control={form.control}
                    name={`items.${index}.weight`}
                    label="Wt"
                  />
                </div>
                <div className="md:col-span-1">
                  <FormNumberField control={form.control} name={`items.${index}.cbm`} label="CBM" />
                </div>
                <div className="md:col-span-1 flex justify-end">
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
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Instructions & notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormTextAreaField
              control={form.control}
              name="deliveryInstructions"
              label="Delivery instructions"
              rows={2}
            />
            <FormTextAreaField control={form.control} name="notes" label="Notes" rows={2} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saveMut.isPending}>
            {isEdit ? "Save changes" : "Create delivery note"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
