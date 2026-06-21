"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { formatCurrency } from "@/lib/utils";
import { customerSnapshotToQuotationFormPatch } from "@/lib/map-customer-to-quotation";
import { DocumentCustomerCard } from "@/components/domain/documents/DocumentCustomerCard";
import {
  buildLineItemSavePayload,
  mapExistingLineItemToForm,
  pickStructuredLineItemFields,
} from "@/lib/sales-line-item-structured";
import { ProductPicker, StockWarningBadge } from "@/components/shared/ProductPicker";
import { mapProductToSalesLine } from "@/lib/map-product-to-quotation-line";

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  productId: z.string().optional(),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().default("Nos"),
  unitPrice: z.coerce.number().min(0),
  equipmentType: z.string().optional(),
  specifications: z.string().optional(),
  size: z.string().optional(),
  weight: z.coerce.number().optional(),
  cbm: z.coerce.number().optional(),
  currentStock: z.coerce.number().optional(),
});

const orderSchema = z.object({
  customer: z.string().optional(),
  customerName: z.string().min(1, "Customer name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  quotation: z.string().optional(),
  orderDate: z.string(),
  deliveryDate: z.string().optional(),
  status: z.enum([
    "draft",
    "confirmed",
    "in_progress",
    "delivered",
    "completed",
    "invoiced",
    "cancelled",
  ]),
  items: z.array(lineItemSchema).min(1, "At least one line item"),
  pricingMode: z.enum(["rental", "sales"]).default("rental"),
  vatPercentage: z.coerce.number().min(0).max(100).default(5),
  notes: z.string().optional(),
});

const today = new Date().toISOString().split("T")[0];
const defaultItem = { description: "", productId: "", quantity: 1, unit: "Nos", unitPrice: 0 };

const statusOpts = [
  "draft",
  "confirmed",
  "in_progress",
  "delivered",
  "completed",
  "invoiced",
  "cancelled",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const unitOpts = ["Nos", "Set", "M", "Sqm", "Day", "Week", "Month", "Job"].map((v) => ({
  value: v,
  label: v,
}));

export function SalesOrderFormPage({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["sales-orders", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: "__none__",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      quotation: "__none__",
      orderDate: today,
      deliveryDate: "",
      status: "draft",
      items: [{ ...defaultItem }],
      pricingMode: "rental",
      vatPercentage: 5,
      notes: "",
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
    const q = existing.quotation;
    const quotationId =
      q && typeof q === "object" && q._id != null
        ? String(q._id)
        : q != null
          ? String(q)
          : "__none__";
    const lineSub = (existing.items || []).reduce((s, it) => s + Number(it.total || 0), 0);
    const vatPctVal =
      lineSub > 0 && existing.vatAmount != null
        ? Math.round((Number(existing.vatAmount) / lineSub) * 10000) / 100
        : 5;
    form.reset({
      customer: customerId,
      customerName: existing.customerName || "",
      customerEmail: existing.customerEmail || "",
      customerPhone: existing.customerPhone || "",
      quotation: quotationId,
      orderDate: fmt(existing.orderDate) || today,
      deliveryDate: fmt(existing.deliveryDate),
      status: existing.status || "draft",
      items:
        existing.items?.length > 0
          ? existing.items.map(mapExistingLineItemToForm)
          : [{ ...defaultItem }],
      pricingMode: "rental",
      vatPercentage: vatPctVal,
      notes: existing.notes || "",
    });
  }, [existing, form]);

  const loadedOrderCustomerId = useMemo(() => {
    if (!existing) return null;
    const c = existing.customer;
    if (c && typeof c === "object" && c._id != null) return String(c._id);
    if (c != null) return String(c);
    return null;
  }, [existing]);

  const { data: customerList } = useQuery({
    queryKey: ["customers", "sales-order-form"],
    queryFn: async () => {
      const res = await fetch("/api/customers?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: quotationList } = useQuery({
    queryKey: ["quotations", "sales-order-form"],
    queryFn: async () => {
      const res = await fetch("/api/quotations?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 30 * 1000,
  });

  const selectedCustomerId = form.watch("customer");

  useEffect(() => {
    if (!selectedCustomerId || selectedCustomerId === "__none__" || !customerList?.length) return;
    if (isEdit && loadedOrderCustomerId && String(selectedCustomerId) === String(loadedOrderCustomerId)) {
      return;
    }
    const c = customerList.find((x) => String(x._id) === String(selectedCustomerId));
    if (!c) return;
    const patch = customerSnapshotToQuotationFormPatch(c);
    form.setValue("customerName", patch.customerName || "", { shouldDirty: true });
    form.setValue("customerEmail", patch.customerEmail || "", { shouldDirty: true });
    form.setValue("customerPhone", patch.customerPhone || "", { shouldDirty: true });
  }, [selectedCustomerId, customerList, form, isEdit, loadedOrderCustomerId]);

  const customerSelectOptions = useMemo(() => {
    const list = [...(customerList || [])];
    if (isEdit && existing?.customer) {
      const cid = String(existing.customer._id ?? existing.customer);
      if (!list.some((c) => String(c._id) === cid)) {
        list.unshift({
          _id: cid,
          companyName: existing.customerName || "Linked customer",
        });
      }
    }
    return [
      { value: "__none__", label: "— Manual / auto-create prospect —" },
      ...list.map((c) => ({ value: String(c._id), label: c.companyName })),
    ];
  }, [customerList, isEdit, existing]);

  const lastSyncedQuotationRef = useRef("__none__");

  useEffect(() => {
    if (!isEdit) {
      lastSyncedQuotationRef.current = "__none__";
      return;
    }
    if (!existing) return;
    const qid = existing.quotation?._id ?? existing.quotation;
    lastSyncedQuotationRef.current = qid != null ? String(qid) : "__none__";
  }, [isEdit, existing]);

  const selectedQuotationId = useWatch({ control: form.control, name: "quotation" });

  useEffect(() => {
    if (!selectedQuotationId || selectedQuotationId === "__none__") return;
    if (String(selectedQuotationId) === String(lastSyncedQuotationRef.current)) return;

    const applyFromQuotation = (q) => {
      if (!q?.items?.length) {
        lastSyncedQuotationRef.current = String(selectedQuotationId);
        toast.info("No line items on this quotation to copy.");
        return;
      }
      lastSyncedQuotationRef.current = String(selectedQuotationId);
      const cust = q.customer;
      const customerId =
        cust && typeof cust === "object" && cust._id != null
          ? String(cust._id)
          : cust != null
            ? String(cust)
            : null;
      if (customerId) {
        form.setValue("customer", customerId, { shouldDirty: true });
      }
      form.setValue("customerName", q.customerName || "", { shouldDirty: true });
      form.setValue("customerEmail", q.customerEmail || "", { shouldDirty: true });
      form.setValue("customerPhone", q.customerPhone || "", { shouldDirty: true });
      form.setValue("vatPercentage", Number(q.vatPercentage ?? 5), { shouldDirty: true });
      if (q.notes) form.setValue("notes", q.notes, { shouldDirty: true });
      const lines = q.items.map((it) => {
        const desc =
          [it.equipmentType, it.description].filter(Boolean).join(" — ") ||
          it.description ||
          "Line";
        return {
          description: desc,
          productId: it.product ? String(it.product) : "",
          quantity: Number(it.quantity) || 1,
          unit: it.unit || "Nos",
          unitPrice: Number(it.ratePerUnit) || 0,
          ...pickStructuredLineItemFields({
            equipmentType: it.equipmentType,
            specifications: it.specifications,
            size: it.size,
            weight: it.weight,
            cbm: it.cbm,
          }),
        };
      });
      form.setValue("items", lines, { shouldDirty: true });
      toast.success("Filled from quotation");
    };

    const fromList = quotationList?.find((x) => String(x._id) === String(selectedQuotationId));
    if (fromList) {
      applyFromQuotation(fromList);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/quotations/${selectedQuotationId}`);
        const d = await res.json();
        if (cancelled) return;
        if (!d.success) {
          lastSyncedQuotationRef.current = String(selectedQuotationId);
          return;
        }
        applyFromQuotation(d.data);
      } catch {
        if (!cancelled) lastSyncedQuotationRef.current = String(selectedQuotationId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedQuotationId, quotationList, form]);

  const loadedOrderQuotationId = useMemo(() => {
    if (!existing?.quotation) return null;
    const q = existing.quotation;
    return String(q._id ?? q);
  }, [existing]);

  const quotationSelectOptions = useMemo(() => {
    const list = [...(quotationList || [])];
    const eligible = list.filter((q) => {
      if (loadedOrderQuotationId && String(q._id) === loadedOrderQuotationId) return true;
      return !["converted", "rejected", "expired"].includes(q.status);
    });
    return [
      { value: "__none__", label: "— None —" },
      ...eligible.map((q) => ({
        value: String(q._id),
        label: `${q.quoteNumber} — ${q.customerName} (${q.status})`,
      })),
    ];
  }, [quotationList, loadedOrderQuotationId]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const pricingMode = form.watch("pricingMode") || "rental";
  const vatPct = form.watch("vatPercentage") ?? 5;

  const subtotal = (watchedItems || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const vatAmount = (subtotal * Number(vatPct || 0)) / 100;
  const grandTotal = subtotal + vatAmount;

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const items = values.items.map(buildLineItemSavePayload);
      const lineSubtotal = items.reduce((s, it) => s + it.total, 0);
      const vat = (lineSubtotal * Number(values.vatPercentage ?? 5)) / 100;

      const payload = {
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        orderDate: values.orderDate,
        deliveryDate: values.deliveryDate || undefined,
        status: values.status,
        items,
        vatAmount: vat,
        notes: values.notes || undefined,
        currency: "AED",
      };

      if (values.customer && values.customer !== "__none__") {
        payload.customer = String(values.customer);
      } else if (isEdit) {
        payload.customer = null;
      }
      if (values.quotation && values.quotation !== "__none__") {
        payload.quotation = String(values.quotation);
      } else if (isEdit) {
        payload.quotation = null;
      }

      const url = isEdit ? `/api/sales-orders/${id}` : "/api/sales-orders";
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
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-orders-stats"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations-stats"] });
      qc.invalidateQueries({ queryKey: ["quotations", "sales-order-form"] });
      toast.success(isEdit ? "Order updated" : "Order created");
      const oid = data._id ?? data.id;
      router.push(`/sales-orders/${oid}`);
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
            title={isEdit ? "Updating order…" : "Creating order…"}
            description="Saving line items and totals."
          />
        )}
        <div className="flex items-center gap-3 mb-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Sales Order" : "New Sales Order"}
            </h1>
            {isEdit && existing && (
              <p className="text-sm text-muted-foreground font-mono">{existing.orderNumber}</p>
            )}
          </div>
        </div>

        <DocumentCustomerCard control={form.control} customerOptions={customerSelectOptions}>
          <FormSelectField
            control={form.control}
            name="quotation"
            label="Link quotation (optional)"
            description="Shows current status. Pick a quote to pull customer, VAT, notes, and line items. Converted / rejected / expired quotes are hidden unless already linked."
            options={quotationSelectOptions}
            className="md:col-span-2"
          />
        </DocumentCustomerCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormTextField control={form.control} name="orderDate" label="Order date" type="date" />
            <FormTextField
              control={form.control}
              name="deliveryDate"
              label="Delivery date (optional)"
              type="date"
            />
            <FormSelectField
              control={form.control}
              name="status"
              label="Status"
              options={statusOpts}
            />
            <FormNumberField
              control={form.control}
              name="vatPercentage"
              label="VAT %"
              className="md:col-span-2"
            />
            <FormSelectField
              control={form.control}
              name="pricingMode"
              label="Line pricing"
              description="Rental vs sale rate when picking from catalogue"
              options={[
                { value: "rental", label: "Rental rates" },
                { value: "sales", label: "Sale rates" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line items</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => append({ ...defaultItem })}>
              <Plus className="h-4 w-4 mr-1" /> Add line
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b pb-4 last:border-0"
              >
                <div className="md:col-span-12">
                  <p className="text-xs text-muted-foreground mb-1">Product (optional)</p>
                  <ProductPicker
                    value={watchedItems?.[index]?.productId || ""}
                    quoteType={pricingMode}
                    onSelect={(product) => {
                      if (!product) {
                        form.setValue(`items.${index}.productId`, "");
                        return;
                      }
                      const mapped = mapProductToSalesLine(product, pricingMode);
                      if (!mapped) return;
                      form.setValue(`items.${index}.productId`, mapped.productId);
                      form.setValue(`items.${index}.equipmentType`, mapped.equipmentType);
                      form.setValue(`items.${index}.description`, mapped.description);
                      form.setValue(`items.${index}.unit`, mapped.unit);
                      form.setValue(`items.${index}.unitPrice`, mapped.unitPrice);
                      form.setValue(`items.${index}.currentStock`, mapped.currentStock);
                    }}
                  />
                  <StockWarningBadge
                    currentStock={watchedItems?.[index]?.currentStock}
                    quantity={watchedItems?.[index]?.quantity}
                  />
                </div>
                <div className="md:col-span-5">
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
                </div>
                <div className="md:col-span-2">
                  <FormSelectField
                    control={form.control}
                    name={`items.${index}.unit`}
                    label="Unit"
                    options={unitOpts}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormNumberField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    label="Rate"
                  />
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
            ))}
            <div className="flex flex-col items-end gap-1 text-sm pt-2">
              <div>
                Subtotal <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div>
                VAT ({vatPct}%) <strong>{formatCurrency(vatAmount)}</strong>
              </div>
              <div className="text-base font-bold">
                Total <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormTextAreaField control={form.control} name="notes" rows={3} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={saveMut.isPending}>
            {isEdit ? "Save changes" : "Create order"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
