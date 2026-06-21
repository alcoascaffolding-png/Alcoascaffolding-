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
import {
  FormTextField, FormSelectField, FormTextAreaField, FormNumberField,
} from "@/components/forms/form-fields";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { BlockingSaveOverlay } from "@/components/loading/loading-kit";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { QuotationFormEditSkeleton } from "@/components/loading/skeleton-kit";
import { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { itemAmountWithVat, quotationDisplaySubtotal } from "@/lib/quotation-display";
import {
  bankAccountToQuotationBankDetails,
  customerSnapshotToQuotationFormPatch,
  formatCustomerAddressLines,
  getLinkedCustomerId,
  getPrimaryAddress,
  isQuotationBankDetailsEmpty,
  pickDefaultBankAccount,
} from "@/lib/map-customer-to-quotation";
import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";
import { DocumentCustomerCard } from "@/components/domain/documents/DocumentCustomerCard";
import { ProductPicker, StockWarningBadge } from "@/components/shared/ProductPicker";
import { mapProductToQuotationLine } from "@/lib/map-product-to-quotation-line";

const lineItemSchema = z.object({
  productId: z.string().optional(),
  equipmentType: z.string().min(1, "Required"),
  description: z.string().optional(),
  specifications: z.string().optional(),
  size: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
  cbm: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().min(1),
  unit: z.string().default("Nos"),
  ratePerUnit: z.coerce.number().min(0),
  vatPercentage: z.coerce.number().min(0).max(100).default(5),
  taxableAmount: z.coerce.number().min(0).optional(),
  subtotal: z.coerce.number().min(0).default(0),
  vatAmount: z.coerce.number().min(0).default(0),
  currentStock: z.coerce.number().min(0).optional(),
  rentalDurationValue: z.coerce.number().min(0).optional(),
  rentalDurationUnit: z.enum(["day", "week", "month"]).default("day"),
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
  pickupCharges: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  discountType: z.enum(["fixed", "percentage"]).default("fixed"),
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

const defaultItem = {
  productId: "",
  equipmentType: "",
  description: "",
  specifications: "",
  size: "",
  weight: 0,
  cbm: 0,
  quantity: 1,
  unit: "Nos",
  ratePerUnit: 0,
  vatPercentage: 5,
  taxableAmount: 0,
  subtotal: 0,
  vatAmount: 0,
  rentalDurationValue: 0,
  rentalDurationUnit: "day",
};

const quoteTypeOpts = [
  { value: "rental", label: "Rental" }, { value: "sales", label: "Sales" },
  { value: "service", label: "Service" }, { value: "both", label: "Both" },
];

const unitOpts = ["Nos", "Set", "M", "Sqm", "Day", "Week", "Month", "Job"].map((v) => ({ value: v, label: v }));

function mapItemToForm(item) {
  return {
    ...defaultItem,
    ...item,
    equipmentType: item?.equipmentType ?? "",
    description: item?.description ?? "",
    specifications: item?.specifications ?? "",
    size: item?.size ?? "",
    weight: Number(item?.weight) || 0,
    cbm: Number(item?.cbm) || 0,
    quantity: Number(item?.quantity) || 1,
    unit: item?.unit || "Nos",
    ratePerUnit: Number(item?.ratePerUnit) || 0,
    vatPercentage: Number(item?.vatPercentage) || 5,
    taxableAmount: Number(item?.taxableAmount) || 0,
    subtotal: Number(item?.subtotal) || 0,
    vatAmount: Number(item?.vatAmount) || 0,
    productId: item?.product ? String(item.product) : item?.productId ? String(item.productId) : "",
    currentStock: Number(item?.currentStock) || 0,
    rentalDurationValue: Number(item?.rentalDuration?.value) || 0,
    rentalDurationUnit: item?.rentalDuration?.unit || "day",
  };
}

function mapQuotationToFormValues(existing) {
  const fmt = (d) => (d ? new Date(d).toISOString().split("T")[0] : today);
  const custObj = existing.customer && typeof existing.customer === "object" ? existing.customer : null;
  return {
    customer: getLinkedCustomerId(existing.customer),
    customerName: existing.customerName ?? "",
    customerEmail: existing.customerEmail ?? "",
    customerPhone: existing.customerPhone ?? "",
    customerAddress:
      existing.customerAddress ||
      formatCustomerAddressLines(getPrimaryAddress(custObj)) ||
      formatCustomerAddressFromRecord(custObj) ||
      "",
    customerTRN: existing.customerTRN || custObj?.vatRegistrationNumber || "",
    contactPersonName: existing.contactPersonName ?? "",
    quoteDate: fmt(existing.quoteDate),
    validUntil: fmt(existing.validUntil),
    quoteType: existing.quoteType ?? "rental",
    subject: existing.subject ?? "",
    salesExecutive: existing.salesExecutive ?? "",
    preparedBy: existing.preparedBy ?? "",
    paymentTerms: existing.paymentTerms ?? "Cash/CDC",
    deliveryTerms: existing.deliveryTerms ?? "7-10 days from date of order",
    projectDuration: existing.projectDuration ?? "",
    items: existing.items?.length ? existing.items.map(mapItemToForm) : [{ ...defaultItem }],
    deliveryCharges: Number(existing.deliveryCharges) || 0,
    installationCharges: Number(existing.installationCharges) || 0,
    pickupCharges: Number(existing.pickupCharges) || 0,
    discount: Number(existing.discount) || 0,
    discountType: existing.discountType === "percentage" ? "percentage" : "fixed",
    vatPercentage: Number(existing.vatPercentage) || 5,
    notes: existing.notes ?? "",
    termsAndConditions: existing.termsAndConditions ?? "",
    bankDetails: existing.bankDetails || {
      bankName: "",
      accountName: "",
      accountNumber: "",
      iban: "",
      swiftCode: "",
    },
  };
}

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
      deliveryCharges: 0, installationCharges: 0, pickupCharges: 0, discount: 0, discountType: "fixed", vatPercentage: 5,
      notes: "", termsAndConditions: "",
      bankDetails: { bankName: "", accountName: "", accountNumber: "", iban: "", swiftCode: "" },
    },
  });

  // Populate form when editing (explicit mapping — avoids object `customer` breaking the select)
  useEffect(() => {
    if (existing) {
      form.reset(mapQuotationToFormValues(existing));
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

  const { data: bankAccountsList } = useQuery({
    queryKey: ["bank-accounts", "quotation-form"],
    queryFn: async () => {
      const res = await fetch("/api/bank-accounts?limit=50");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const selectedCustomerId = form.watch("customer");

  const loadedQuoteCustomerId = useMemo(() => {
    if (!existing) return null;
    const id = getLinkedCustomerId(existing.customer);
    return id === "__none__" ? null : id;
  }, [existing]);

  useEffect(() => {
    if (!selectedCustomerId || selectedCustomerId === "__none__" || !customerList?.length) return;
    const c = customerList.find((x) => String(x._id) === String(selectedCustomerId));
    if (!c) return;

    const sameCustomerAsLoadedQuote =
      isEdit &&
      loadedQuoteCustomerId != null &&
      String(selectedCustomerId) === String(loadedQuoteCustomerId);

    if (sameCustomerAsLoadedQuote) {
      const banks = bankAccountsList || [];
      if (banks.length && isQuotationBankDetailsEmpty(form.getValues("bankDetails"))) {
        const def = pickDefaultBankAccount(banks);
        const bd = bankAccountToQuotationBankDetails(def);
        if (bd && (bd.bankName || bd.accountNumber)) {
          form.setValue("bankDetails", bd, { shouldDirty: true, shouldValidate: false });
        }
      }
      return;
    }

    const patch = customerSnapshotToQuotationFormPatch(c);
    Object.entries(patch).forEach(([key, val]) => {
      form.setValue(key, val ?? "", { shouldDirty: true, shouldValidate: false });
    });

    const notesEmpty = !String(form.getValues("notes") || "").trim();
    if (notesEmpty && c.notes && String(c.notes).trim()) {
      form.setValue("notes", String(c.notes).trim(), { shouldDirty: true });
    }

    const banks = bankAccountsList || [];
    if (banks.length && isQuotationBankDetailsEmpty(form.getValues("bankDetails"))) {
      const def = pickDefaultBankAccount(banks);
      const bd = bankAccountToQuotationBankDetails(def);
      if (bd && (bd.bankName || bd.accountNumber)) {
        form.setValue("bankDetails", bd, { shouldDirty: true, shouldValidate: false });
      }
    }
  }, [selectedCustomerId, customerList, bankAccountsList, isEdit, form, loadedQuoteCustomerId]);

  const customerSelectOptions = useMemo(() => {
    const list = [...(customerList || [])];
    if (isEdit && existing?.customer) {
      const cid = getLinkedCustomerId(existing.customer);
      if (cid !== "__none__" && !list.some((c) => String(c._id) === cid)) {
        const populatedName =
          typeof existing.customer === "object" ? existing.customer.companyName : null;
        list.unshift({
          _id: cid,
          companyName: existing.customerName || populatedName || "Linked customer",
        });
      }
    }
    return [
      { value: "__none__", label: "— Enter company manually (or auto-create prospect) —" },
      ...list.map((c) => ({ value: String(c._id), label: c.companyName })),
    ];
  }, [customerList, isEdit, existing]);

  // Re-bind customer select once options include the linked customer (Radix needs matching option)
  useEffect(() => {
    if (!isEdit || !existing) return;
    const linkedId = getLinkedCustomerId(existing.customer);
    if (linkedId === "__none__") return;
    const hasOption = customerSelectOptions.some((o) => o.value === linkedId);
    if (!hasOption) return;
    if (form.getValues("customer") !== linkedId) {
      form.setValue("customer", linkedId, { shouldValidate: false, shouldDirty: false });
    }
  }, [isEdit, existing, customerSelectOptions, form]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const watchedItems = form.watch("items");
  const quoteType = form.watch("quoteType") || "rental";
  const vatPct = form.watch("vatPercentage");
  const deliveryCharges = form.watch("deliveryCharges") || 0;
  const installationCharges = form.watch("installationCharges") || 0;
  const pickupCharges = form.watch("pickupCharges") || 0;
  const discount = form.watch("discount") || 0;
  const discountType = form.watch("discountType") || "fixed";

  const lineSubtotal = watchedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.ratePerUnit || 0),
    0
  );
  const previewTotals = {
    subtotal: lineSubtotal,
    deliveryCharges: Number(deliveryCharges) || 0,
    installationCharges: Number(installationCharges) || 0,
    pickupCharges: Number(pickupCharges) || 0,
    discount: Number(discount) || 0,
    discountType,
  };
  const displaySubtotal = quotationDisplaySubtotal(previewTotals);
  const beforeVAT = displaySubtotal;
  const vatAmount = (beforeVAT * Number(vatPct || 0)) / 100;
  const totalAmount = beforeVAT + vatAmount;

  const saveMut = useMutation({
    mutationFn: async (values) => {
      const docVatPct = Number(values.vatPercentage ?? 5);
      const items = values.items.map((item) => {
        const taxable = Number(item.quantity || 0) * Number(item.ratePerUnit || 0);
        const lineVat = (taxable * docVatPct) / 100;
        return {
          equipmentType: item.equipmentType,
          equipmentCode: item.equipmentCode,
          description: item.description,
          specifications: item.specifications,
          size: item.size,
          product: item.productId || undefined,
          quantity: Number(item.quantity) || 1,
          ratePerUnit: Number(item.ratePerUnit) || 0,
          weight: Number(item.weight) || 0,
          cbm: Number(item.cbm) || 0,
          unit: item.unit || "Nos",
          vatPercentage: docVatPct,
          taxableAmount: taxable,
          subtotal: taxable,
          vatAmount: lineVat,
          ...(Number(item.rentalDurationValue) > 0
            ? {
                rentalDuration: {
                  value: Number(item.rentalDurationValue),
                  unit: item.rentalDurationUnit || "day",
                },
              }
            : {}),
        };
      });
      const lineSubtotal = items.reduce((s, it) => s + it.subtotal, 0);
      const deliveryCharges = Number(values.deliveryCharges) || 0;
      const installationCharges = Number(values.installationCharges) || 0;
      const pickupCharges = Number(values.pickupCharges) || 0;
      const discount = Number(values.discount) || 0;
      const discountType = values.discountType === "percentage" ? "percentage" : "fixed";
      const vatPct = Number(values.vatPercentage ?? 5);
      const beforeVAT = quotationDisplaySubtotal({
        subtotal: lineSubtotal,
        deliveryCharges,
        installationCharges,
        pickupCharges,
        discount,
        discountType,
      });
      const vatAmount = (beforeVAT * vatPct) / 100;
      const totalAmount = beforeVAT + vatAmount;

      const linkedCustomer = getLinkedCustomerId(values.customer);
      const payload = {
        ...values,
        items,
        subtotal: lineSubtotal,
        vatAmount,
        totalAmount,
        deliveryCharges,
        installationCharges,
        pickupCharges,
        discount,
        discountType,
        vatPercentage: vatPct,
      };
      if (linkedCustomer !== "__none__") {
        payload.customer = linkedCustomer;
      } else {
        delete payload.customer;
      }

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
      const qid = data._id ?? data.id ?? id;
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations-stats"] });
      qc.invalidateQueries({ queryKey: ["quotations", "sales-order-form"] });
      if (qid) {
        qc.invalidateQueries({ queryKey: ["quotations", "detail", qid] });
      }
      toast.success(isEdit ? "Quotation updated" : "Quotation created");
      router.push(`/quotations/${qid}`);
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
            title={isEdit ? "Updating quotation…" : "Creating quotation…"}
            description="Please wait — saving line items and totals."
          />
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

        <DocumentCustomerCard
          control={form.control}
          title="Customer Information"
          customerOptions={customerSelectOptions}
          customerSelectDescription="Pick a saved customer to link this quote, or leave manual entry — a prospect is created automatically if needed."
          customerNameLabel="Customer / Company Name *"
          customerNamePlaceholder="ABC Construction LLC"
        >
          <FormTextField control={form.control} name="customerTRN" label="TRN / VAT Number" />
          <FormTextField control={form.control} name="contactPersonName" label="Contact Person" />
          <FormTextAreaField control={form.control} name="customerAddress" label="Address" rows={2} className="md:col-span-2" />
        </DocumentCustomerCard>

        {/* Quote info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Quote Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormTextField control={form.control} name="quoteDate" label="Quote Date" type="date" />
            <FormTextField control={form.control} name="validUntil" label="Valid Until" type="date" />
            <FormSelectField control={form.control} name="quoteType" label="Quote Type" options={quoteTypeOpts} />
            <FormTextField
              control={form.control}
              name="subject"
              label="Subject"
              placeholder="Scaffolding for ABC Project"
              className="md:col-span-3 [&_input]:text-base"
            />
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
            <p className="text-xs text-muted-foreground mb-3">
              Line totals match the PDF: taxable amount, VAT ({vatPct}%) amount, and amount including VAT.
            </p>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-muted/20">
                  <div className="col-span-12">
                    <label className="text-xs text-muted-foreground mb-1 block">Product (catalogue)</label>
                    <ProductPicker
                      value={watchedItems[index]?.productId || ""}
                      quoteType={quoteType}
                      onSelect={(product) => {
                        if (!product) {
                          form.setValue(`items.${index}.productId`, "");
                          return;
                        }
                        const mapped = mapProductToQuotationLine(product, quoteType);
                        if (!mapped) return;
                        form.setValue(`items.${index}.productId`, mapped.productId);
                        form.setValue(`items.${index}.equipmentType`, mapped.equipmentType);
                        form.setValue(`items.${index}.equipmentCode`, mapped.equipmentCode || "");
                        form.setValue(`items.${index}.description`, mapped.description || "");
                        form.setValue(`items.${index}.specifications`, mapped.specifications || "");
                        form.setValue(`items.${index}.unit`, mapped.unit || "Nos");
                        form.setValue(`items.${index}.ratePerUnit`, mapped.ratePerUnit);
                        form.setValue(`items.${index}.currentStock`, mapped.currentStock ?? 0);
                      }}
                    />
                    <div className="mt-1">
                      <StockWarningBadge
                        currentStock={watchedItems[index]?.currentStock}
                        quantity={watchedItems[index]?.quantity}
                      />
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs text-muted-foreground mb-1 block">Equipment Type *</label>
                    <Input placeholder="Aluminium Tower 4m" {...form.register(`items.${index}.equipmentType`)} />
                    {form.formState.errors.items?.[index]?.equipmentType && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.items[index].equipmentType.message}</p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                    <Input placeholder="Optional details" {...form.register(`items.${index}.description`)} />
                  </div>
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-xs text-muted-foreground mb-1 block">Specifications</label>
                    <Input placeholder="Optional" {...form.register(`items.${index}.specifications`)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Size</label>
                    <Input placeholder="e.g. 8m" {...form.register(`items.${index}.size`)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Wt (KG)</label>
                    <Input type="number" min="0" step="0.001" {...form.register(`items.${index}.weight`)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">CBM</label>
                    <Input type="number" min="0" step="0.001" {...form.register(`items.${index}.cbm`)} />
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
                  {(quoteType === "rental" || quoteType === "both") && (
                    <>
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Rental duration</label>
                        <Input type="number" min="0" {...form.register(`items.${index}.rentalDurationValue`)} />
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        <label className="text-xs text-muted-foreground mb-1 block">Period</label>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          {...form.register(`items.${index}.rentalDurationUnit`)}
                        >
                          <option value="day">Day</option>
                          <option value="week">Week</option>
                          <option value="month">Month</option>
                        </select>
                      </div>
                    </>
                  )}
                  <div className="col-span-12 md:col-span-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">Taxable Amount</span>
                      <span className="font-medium tabular-nums">
                        {(Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.ratePerUnit || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">VAT ({vatPct}%) Amount</span>
                      <span className="font-medium tabular-nums">
                        {((Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.ratePerUnit || 0)) * Number(vatPct || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Amount (AED)</span>
                      <span className="font-semibold tabular-nums">
                        {itemAmountWithVat(
                          {
                            ...watchedItems[index],
                            taxableAmount: Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.ratePerUnit || 0),
                            vatAmount: (Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.ratePerUnit || 0) * Number(vatPct || 0)) / 100,
                            subtotal: Number(watchedItems[index]?.quantity || 0) * Number(watchedItems[index]?.ratePerUnit || 0),
                          },
                          vatPct
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-1 flex md:justify-end">
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
                  <label className="text-xs text-muted-foreground mb-1 block">Pickup Charges (AED)</label>
                  <Input type="number" min="0" step="0.01" {...form.register("pickupCharges")} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Discount type</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    {...form.register("discountType")}
                  >
                    <option value="fixed">Fixed (AED)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Discount {discountType === "percentage" ? "(%)" : "(AED)"}
                  </label>
                  <Input type="number" min="0" step="0.01" max={discountType === "percentage" ? "100" : undefined} {...form.register("discount")} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">VAT % (quotation)</label>
                  <Input type="number" min="0" max="100" step="0.01" {...form.register("vatPercentage")} />
                </div>
              </div>
              <div className="col-span-2 space-y-1.5 text-sm border-t pt-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal (before VAT)</span><span className="tabular-nums">{displaySubtotal.toFixed(2)}</span></div>
                {Number(deliveryCharges) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatCurrency(deliveryCharges)}</span></div>}
                {Number(installationCharges) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Installation</span><span>{formatCurrency(installationCharges)}</span></div>}
                {Number(pickupCharges) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Pickup</span><span>{formatCurrency(pickupCharges)}</span></div>}
                {Number(discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount{discountType === "percentage" ? ` (${discount}%)` : ""}</span>
                    <span>
                      - {formatCurrency(
                        discountType === "percentage"
                          ? (lineSubtotal * Number(discount)) / 100
                          : Number(discount)
                      )}
                    </span>
                  </div>
                )}
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
            {saveMut.isPending && <InlineSkeleton className="mr-2 inline" />}
            {isEdit ? "Update Quotation" : "Create Quotation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
