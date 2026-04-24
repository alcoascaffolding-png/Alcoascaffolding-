"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormTextField, FormSelectField, FormTextAreaField, FormNumberField,
} from "@/components/forms/form-fields";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

const lineItemSchema = z.object({
  equipmentType: z.string().min(1, "Required"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1),
  unit: z.string().default("Nos"),
  ratePerUnit: z.coerce.number().min(0),
  vatPercentage: z.coerce.number().min(0).max(100).default(5),
  subtotal: z.coerce.number().min(0).default(0),
  vatAmount: z.coerce.number().min(0).default(0),
});

const quotationSchema = z.object({
  /** Optional Mongo ObjectId — links quote to CRM customer; otherwise server matches/creates by company name */
  customer: z.string().optional(),
  customerName: z.string().min(1, "Customer name required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerTRN: z.string().optional(),
  contactPersonName: z.string().optional(),
  quoteDate: z.string(),
  validUntil: z.string(),
  quoteType: z.string().default("rental"),
  subject: z.string().optional(),
  salesExecutive: z.string().optional(),
  preparedBy: z.string().optional(),
  paymentTerms: z.string().default("Cash/CDC"),
  deliveryTerms: z.string().default("7-10 days from date of order"),
  projectDuration: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  deliveryCharges: z.coerce.number().min(0).default(0),
  installationCharges: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  vatPercentage: z.coerce.number().min(0).max(100).default(5),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    iban: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
});

const today = new Date().toISOString().split("T")[0];
const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const defaultItem = { equipmentType: "", description: "", quantity: 1, unit: "Nos", ratePerUnit: 0, vatPercentage: 5, subtotal: 0, vatAmount: 0 };

const quoteTypeOpts = [
  { value: "rental", label: "Rental" }, { value: "sales", label: "Sales" },
  { value: "service", label: "Service" }, { value: "both", label: "Both" },
];

const unitOpts = ["Nos", "Set", "M", "Sqm", "Day", "Week", "Month", "Job"].map((v) => ({ value: v, label: v }));

export function QuotationFormPage({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["quotations", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/quotations/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customer: "__none__",
      customerName: "", customerEmail: "", customerPhone: "", customerAddress: "",
      customerTRN: "", contactPersonName: "",
      quoteDate: today, validUntil: thirtyDaysLater,
      quoteType: "rental", subject: "", salesExecutive: "", preparedBy: "",
      paymentTerms: "Cash/CDC", deliveryTerms: "7-10 days from date of order",
      projectDuration: "", items: [{ ...defaultItem }],
      deliveryCharges: 0, installationCharges: 0, discount: 0, vatPercentage: 5,
      notes: "", termsAndConditions: "",
      bankDetails: { bankName: "", accountName: "", accountNumber: "", iban: "", swiftCode: "" },
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      const fmt = (d) => d ? new Date(d).toISOString().split("T")[0] : today;
      const cust = existing.customer;
      const customerId =
        cust && typeof cust === "object" && cust._id != null
          ? String(cust._id)
          : cust != null
            ? String(cust)
            : "__none__";
      form.reset({
        ...existing,
        customer: customerId,
        quoteDate: fmt(existing.quoteDate),
        validUntil: fmt(existing.validUntil),
        bankDetails: existing.bankDetails || { bankName: "", accountName: "", accountNumber: "", iban: "", swiftCode: "" },
      });
    }
  }, [existing]);

  const { data: customerList } = useQuery({
    queryKey: ["customers", "quotation-form"],
    queryFn: async () => {
      const res = await fetch("/api/customers?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const selectedCustomerId = form.watch("customer");
  useEffect(() => {
    if (!selectedCustomerId || selectedCustomerId === "__none__" || !customerList?.length) return;
    const c = customerList.find((x) => String(x._id) === String(selectedCustomerId));
    if (c) {
      form.setValue("customerName", c.companyName || "");
      form.setValue("customerEmail", c.primaryEmail || "");
      form.setValue("customerPhone", c.primaryPhone || "");
    }
  }, [selectedCustomerId, customerList, form.setValue]);

  const customerSelectOptions = useMemo(() => {
    const list = [...(customerList || [])];
    if (isEdit && existing?.customer) {
      const cid = String(existing.customer._id ?? existing.customer);
      if (!list.some((c) => String(c._id) === cid)) {
        list.unshift({
          _id: cid,
          companyName: existing.customerName || existing.customer?.companyName || "Linked customer",
        });
      }
    }
    return [
      { value: "__none__", label: "— Enter company manually (or auto-create prospect) —" },
      ...list.map((c) => ({ value: String(c._id), label: c.companyName })),
    ];
  }, [customerList, isEdit, existing]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const watchedItems = form.watch("items");
  const vatPct = form.watch("vatPercentage");
  const deliveryCharges = form.watch("deliveryCharges") || 0;
  const installationCharges = form.watch("installationCharges") || 0;
  const discount = form.watch("discount") || 0;

  const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.ratePerUnit || 0)), 0);
  const beforeVAT = subtotal + Number(deliveryCharges) + Number(installationCharges) - Number(discount);
  const vatAmount = (beforeVAT * Number(vatPct || 0)) / 100;
  const totalAmount = beforeVAT + vatAmount;

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const items = values.items.map((item) => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        ratePerUnit: Number(item.ratePerUnit) || 0,
        vatPercentage: Number(item.vatPercentage ?? 5),
        subtotal: Number(item.quantity) * Number(item.ratePerUnit),
        vatAmount:
          (Number(item.quantity) * Number(item.ratePerUnit) * Number(item.vatPercentage ?? 5)) / 100,
      }));
      const lineSubtotal = items.reduce((s, it) => s + it.subtotal, 0);
      const deliveryCharges = Number(values.deliveryCharges) || 0;
      const installationCharges = Number(values.installationCharges) || 0;
      const discount = Number(values.discount) || 0;
      const vatPct = Number(values.vatPercentage ?? 5);
      let beforeVAT = lineSubtotal + deliveryCharges + installationCharges - discount;
      if (beforeVAT < 0) beforeVAT = 0;
      const vatAmount = (beforeVAT * vatPct) / 100;
      const totalAmount = beforeVAT + vatAmount;

      const payload = {
        ...values,
        items,
        subtotal: lineSubtotal,
        vatAmount,
        totalAmount,
        deliveryCharges,
        installationCharges,
        discount,
        vatPercentage: vatPct,
      };
      if (!payload.customer || payload.customer === "__none__") delete payload.customer;
      else payload.customer = String(payload.customer);

      const url = isEdit ? `/api/quotations/${id}` : "/api/quotations";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) {
        const msg = typeof d.error === "string" ? d.error : d.error?.message || "Save failed";
        throw new Error(Array.isArray(d.details) ? `${msg}: ${d.details.join(", ")}` : msg);
      }
      return d.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success(isEdit ? "Quotation updated" : "Quotation created");
      const qid = data._id ?? data.id;
      router.push(`/quotations/${qid}`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isEdit && loadingExisting) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card><CardHeader><Skeleton className="h-5 w-40" /></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><Skeleton className="h-10 md:col-span-2" /><Skeleton className="h-10" /><Skeleton className="h-10" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-36" /></CardHeader><CardContent className="grid gap-4 md:grid-cols-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10" />)}</CardContent></Card>
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className="space-y-6 relative"
        aria-busy={saveMut.isPending}
      >
        {saveMut.isPending && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-10 py-8 shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">{isEdit ? "Updating quotation…" : "Creating quotation…"}</p>
              <p className="text-xs text-muted-foreground">Please wait</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 mb-2">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? "Edit Quotation" : "New Quotation"}</h1>
            {isEdit && existing && <p className="text-sm text-muted-foreground font-mono">{existing.quoteNumber}</p>}
          </div>
        </div>

        {/* Customer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelectField
              control={form.control}
              name="customer"
              label="Existing customer (optional)"
              placeholder="Select…"
              options={customerSelectOptions}
              description="Pick a saved customer to link this quote, or leave manual entry — a prospect is created automatically if needed."
              className="md:col-span-2"
            />
            <FormTextField control={form.control} name="customerName" label="Customer / Company Name *" placeholder="ABC Construction LLC" className="md:col-span-2" />
            <FormTextField control={form.control} name="customerEmail" label="Email" type="email" />
            <FormTextField control={form.control} name="customerPhone" label="Phone" />
            <FormTextField control={form.control} name="customerTRN" label="TRN / VAT Number" />
            <FormTextField control={form.control} name="contactPersonName" label="Contact Person" />
            <FormTextAreaField control={form.control} name="customerAddress" label="Address" rows={2} className="md:col-span-2" />
          </CardContent>
        </Card>

        {/* Quote info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormTextField control={form.control} name="quoteDate" label="Quote Date" type="date" />
            <FormTextField control={form.control} name="validUntil" label="Valid Until" type="date" />
            <FormSelectField control={form.control} name="quoteType" label="Quote Type" options={quoteTypeOpts} />
            <FormTextField control={form.control} name="subject" label="Subject" placeholder="Scaffolding for ABC Project" className="md:col-span-3" />
            <FormTextField control={form.control} name="salesExecutive" label="Sales Executive" />
            <FormTextField control={form.control} name="preparedBy" label="Prepared By" />
            <FormTextField control={form.control} name="projectDuration" label="Project Duration" placeholder="3 months" />
            <FormTextField control={form.control} name="paymentTerms" label="Payment Terms" />
            <FormTextField control={form.control} name="deliveryTerms" label="Delivery Terms" className="md:col-span-2" />
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ ...defaultItem })}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-muted/20">
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs text-muted-foreground mb-1 block">Equipment Type *</label>
                    <Input placeholder="Aluminium Tower 4m" {...form.register(`items.${index}.equipmentType`)} />
                    {form.formState.errors.items?.[index]?.equipmentType && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.items[index].equipmentType.message}</p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                    <Input placeholder="Optional details" {...form.register(`items.${index}.description`)} />
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Qty</label>
                    <Input type="number" min="1" {...form.register(`items.${index}.quantity`)} />
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
                    <Input placeholder="Nos" {...form.register(`items.${index}.unit`)} />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Rate (AED)</label>
                    <Input type="number" min="0" step="0.01" {...form.register(`items.${index}.ratePerUnit`)} />
                  </div>
                  <div className="col-span-11 md:col-span-1 flex items-end justify-between">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
                      <p className="text-sm font-medium py-2">
                        {formatCurrency(Number(form.watch(`items.${index}.quantity`) || 0) * Number(form.watch(`items.${index}.ratePerUnit`) || 0))}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <Button
                      type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => remove(index)} disabled={fields.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 max-w-sm ml-auto text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Delivery Charges (AED)</label>
                  <Input type="number" min="0" step="0.01" {...form.register("deliveryCharges")} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Installation Charges (AED)</label>
                  <Input type="number" min="0" step="0.01" {...form.register("installationCharges")} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Discount (AED)</label>
                  <Input type="number" min="0" step="0.01" {...form.register("discount")} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">VAT %</label>
                  <Input type="number" min="0" max="100" step="0.01" {...form.register("vatPercentage")} />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5 text-sm border-t pt-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {Number(deliveryCharges) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatCurrency(deliveryCharges)}</span></div>}
                {Number(installationCharges) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Installation</span><span>{formatCurrency(installationCharges)}</span></div>}
                {Number(discount) > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- {formatCurrency(discount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">VAT ({vatPct}%)</span><span>{formatCurrency(vatAmount)}</span></div>
                <Separator />
                <div className="flex justify-between font-bold text-base"><span>Total (AED)</span><span className="text-primary">{formatCurrency(totalAmount)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Bank Details (for PDF)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextField control={form.control} name="bankDetails.bankName" label="Bank Name" />
            <FormTextField control={form.control} name="bankDetails.accountName" label="Account Name" />
            <FormTextField control={form.control} name="bankDetails.accountNumber" label="Account Number" />
            <FormTextField control={form.control} name="bankDetails.iban" label="IBAN" />
            <FormTextField control={form.control} name="bankDetails.swiftCode" label="Swift Code" />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle className="text-base">Notes & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormTextAreaField control={form.control} name="notes" label="Notes" rows={3} placeholder="Any additional notes for the customer..." />
            <FormTextAreaField control={form.control} name="termsAndConditions" label="Terms & Conditions" rows={5} placeholder="Leave blank to use default terms..." />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saveMut.isPending}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button type="submit" disabled={saveMut.isPending}>
            {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2 inline" aria-hidden />}
            {isEdit ? "Update Quotation" : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
