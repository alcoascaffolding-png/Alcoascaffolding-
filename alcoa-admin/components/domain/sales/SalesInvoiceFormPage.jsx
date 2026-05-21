"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
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

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0.01),
  unit: z.string().default("Nos"),
  unitPrice: z.coerce.number().min(0),
});

const invoiceSchema = z.object({
  customer: z.string().optional(),
  customerName: z.string().min(1, "Customer name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  salesOrder: z.string().optional(),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  paymentStatus: z.enum(["unpaid", "partially_paid", "paid", "overdue", "cancelled"]),
  paidAmount: z.coerce.number().min(0).default(0),
  items: z.array(lineItemSchema).min(1, "At least one line item"),
  vatPercentage: z.coerce.number().min(0).max(100).default(5),
  notes: z.string().optional(),
});

const today = new Date().toISOString().split("T")[0];
const defaultDue = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
const defaultItem = { description: "", quantity: 1, unit: "Nos", unitPrice: 0 };

const paymentOpts = [
  "unpaid",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const unitOpts = ["Nos", "Set", "M", "Sqm", "Day", "Week", "Month", "Job"].map((v) => ({
  value: v,
  label: v,
}));

export function SalesInvoiceFormPage({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["sales-invoices", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-invoices/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer: "__none__",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      salesOrder: "__none__",
      invoiceDate: today,
      dueDate: defaultDue,
      paymentStatus: "unpaid",
      paidAmount: 0,
      items: [{ ...defaultItem }],
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
    const so = existing.salesOrder;
    const salesOrderId =
      so && typeof so === "object" && so._id != null
        ? String(so._id)
        : so != null
          ? String(so)
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
      salesOrder: salesOrderId,
      invoiceDate: fmt(existing.invoiceDate) || today,
      dueDate: fmt(existing.dueDate),
      paymentStatus: existing.paymentStatus || "unpaid",
      paidAmount: existing.paidAmount ?? 0,
      items:
        existing.items?.length > 0
          ? existing.items.map((it) => ({
              description: it.description || "",
              quantity: it.quantity,
              unit: it.unit || "Nos",
              unitPrice: it.unitPrice,
            }))
          : [{ ...defaultItem }],
      vatPercentage: vatPctVal,
      notes: existing.notes || "",
    });
  }, [existing, form]);

  const loadedInvoiceCustomerId = useMemo(() => {
    if (!existing) return null;
    const c = existing.customer;
    if (c && typeof c === "object" && c._id != null) return String(c._id);
    if (c != null) return String(c);
    return null;
  }, [existing]);

  const { data: customerList } = useQuery({
    queryKey: ["customers", "sales-invoice-form"],
    queryFn: async () => {
      const res = await fetch("/api/customers?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: orderList } = useQuery({
    queryKey: ["sales-orders", "sales-invoice-form"],
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
    if (
      isEdit &&
      loadedInvoiceCustomerId &&
      String(selectedCustomerId) === String(loadedInvoiceCustomerId)
    ) {
      return;
    }
    const c = customerList.find((x) => String(x._id) === String(selectedCustomerId));
    if (!c) return;
    const patch = customerSnapshotToQuotationFormPatch(c);
    form.setValue("customerName", patch.customerName || "", { shouldDirty: true });
    form.setValue("customerEmail", patch.customerEmail || "", { shouldDirty: true });
    form.setValue("customerPhone", patch.customerPhone || "", { shouldDirty: true });
  }, [selectedCustomerId, customerList, form, isEdit, loadedInvoiceCustomerId]);

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

  const loadedInvoiceSalesOrderId = useMemo(() => {
    if (!existing?.salesOrder) return null;
    const so = existing.salesOrder;
    return String(so._id ?? so);
  }, [existing]);

  const salesOrderSelectOptions = useMemo(() => {
    const list = [...(orderList || [])];
    const eligible = list.filter((o) => {
      if (loadedInvoiceSalesOrderId && String(o._id) === loadedInvoiceSalesOrderId) return true;
      return o.status !== "cancelled";
    });
    return [
      { value: "__none__", label: "— None —" },
      ...eligible.map((o) => ({
        value: String(o._id),
        label: `${o.orderNumber} — ${o.customerName} (${String(o.status || "").replace(/_/g, " ")})`,
      })),
    ];
  }, [orderList, loadedInvoiceSalesOrderId]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const vatPct = form.watch("vatPercentage") ?? 5;
  const paidAmount = form.watch("paidAmount") ?? 0;

  const subtotal = (watchedItems || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0
  );
  const vatAmount = (subtotal * Number(vatPct || 0)) / 100;
  const grandTotal = subtotal + vatAmount;
  const balance = Math.max(0, grandTotal - Number(paidAmount || 0));

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const items = values.items.map((item) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.unitPrice) || 0;
        return {
          description: item.description,
          quantity: qty,
          unit: item.unit || "Nos",
          unitPrice: rate,
          total: qty * rate,
        };
      });
      const lineSubtotal = items.reduce((s, it) => s + it.total, 0);
      const vat = (lineSubtotal * Number(values.vatPercentage ?? 5)) / 100;
      const paid = Number(values.paidAmount) || 0;

      const payload = {
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate || undefined,
        paymentStatus: values.paymentStatus,
        paidAmount: paid,
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
      if (values.salesOrder && values.salesOrder !== "__none__") {
        payload.salesOrder = String(values.salesOrder);
      } else if (isEdit) {
        payload.salesOrder = null;
      }

      const url = isEdit ? `/api/sales-invoices/${id}` : "/api/sales-invoices";
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
      qc.invalidateQueries({ queryKey: ["sales-invoices"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices-stats"] });
      toast.success(isEdit ? "Invoice updated" : "Invoice created");
      const iid = data._id ?? data.id;
      router.push(`/sales-invoices/${iid}`);
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
            title={isEdit ? "Updating invoice…" : "Creating invoice…"}
            description="Saving line items and totals."
          />
        )}
        <div className="flex items-center gap-3 mb-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? "Edit Sales Invoice" : "New Sales Invoice"}
            </h1>
            {isEdit && existing && (
              <p className="text-sm text-muted-foreground font-mono">{existing.invoiceNumber}</p>
            )}
          </div>
        </div>

        <DocumentCustomerCard control={form.control} customerOptions={customerSelectOptions}>
          <FormSelectField
            control={form.control}
            name="salesOrder"
            label="Link sales order (optional)"
            description="Each option shows order status. Cancelled orders are hidden unless this invoice is already linked to one."
            options={salesOrderSelectOptions}
            className="md:col-span-2"
          />
        </DocumentCustomerCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormTextField control={form.control} name="invoiceDate" label="Invoice date" type="date" />
            <FormTextField control={form.control} name="dueDate" label="Due date" type="date" />
            <FormSelectField
              control={form.control}
              name="paymentStatus"
              label="Payment status"
              options={paymentOpts}
            />
            <FormNumberField control={form.control} name="paidAmount" label="Paid amount (AED)" />
            <FormNumberField
              control={form.control}
              name="vatPercentage"
              label="VAT %"
              className="md:col-span-2"
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
              <div className="text-destructive font-medium">
                Balance <span>{formatCurrency(balance)}</span>
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
            {isEdit ? "Save changes" : "Create invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
