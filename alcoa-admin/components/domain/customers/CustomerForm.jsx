"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormTextField, FormSelectField, FormTextAreaField, FormNumberField,
} from "@/components/forms/form-fields";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

// ─── Enum constants (must match Customer model exactly) ───────────────────────
const BUSINESS_TYPES = [
  "Construction Company", "Contractor", "Facility Management",
  "Government", "Individual", "Other",
];
const PAYMENT_TERMS  = ["Cash", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "Custom"];
const STATUSES       = ["prospect", "active", "inactive", "blocked"];
const CUSTOMER_TYPES = ["rental", "sales", "both"];
const SOURCES        = ["Website", "Phone Call", "Walk-in", "Referral", "Social Media", "Email", "Other"];

const customerSchema = z.object({
  companyName:           z.string().min(1, "Company name is required"),
  businessType:          z.enum(BUSINESS_TYPES).default("Construction Company"),
  industry:              z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  tradeLicenseNumber:    z.string().optional(),
  website:               z.string().optional(),
  paymentTerms:          z.enum(PAYMENT_TERMS).default("Cash"),
  creditLimit:           z.coerce.number().min(0).default(0),
  customerType:          z.enum(CUSTOMER_TYPES).default("both"),
  status:                z.enum(STATUSES).default("prospect"),
  source:                z.enum(SOURCES).default("Website"),
  notes:                 z.string().optional(),
});

const businessTypeOpts = BUSINESS_TYPES.map((v) => ({ value: v, label: v }));
const paymentTermsOpts = PAYMENT_TERMS.map((v) => ({ value: v, label: v }));
const sourceOpts       = SOURCES.map((v) => ({ value: v, label: v }));
const statusOpts = [
  { value: "prospect", label: "Prospect" },
  { value: "active",   label: "Active"   },
  { value: "inactive", label: "Inactive" },
  { value: "blocked",  label: "Blocked"  },
];
const customerTypeOpts = [
  { value: "rental", label: "Rental" },
  { value: "sales",  label: "Sales"  },
  { value: "both",   label: "Both"   },
];

const DEFAULTS = {
  companyName:           "",
  businessType:          "Construction Company",
  industry:              "",
  vatRegistrationNumber: "",
  tradeLicenseNumber:    "",
  website:               "",
  paymentTerms:          "Cash",
  creditLimit:           0,
  customerType:          "both",
  status:                "prospect",
  source:                "Website",
  notes:                 "",
};

/** Return val as string if non-empty, else fallback. */
function safe(val, fallback) {
  return val && String(val).trim() !== "" ? String(val) : fallback;
}

function mapExisting(existing) {
  return {
    companyName:           safe(existing.companyName,            DEFAULTS.companyName),
    businessType:          safe(existing.businessType,           DEFAULTS.businessType),
    industry:              safe(existing.industry,               DEFAULTS.industry),
    vatRegistrationNumber: safe(existing.vatRegistrationNumber,  DEFAULTS.vatRegistrationNumber),
    tradeLicenseNumber:    safe(existing.tradeLicenseNumber,     DEFAULTS.tradeLicenseNumber),
    website:               safe(existing.website,                DEFAULTS.website),
    paymentTerms:          safe(existing.paymentTerms,           DEFAULTS.paymentTerms),
    creditLimit:           existing.creditLimit ?? 0,
    customerType:          safe(existing.customerType,           DEFAULTS.customerType),
    status:                safe(existing.status,                 DEFAULTS.status),
    source:                safe(existing.source,                 DEFAULTS.source),
    notes:                 safe(existing.notes,                  DEFAULTS.notes),
  };
}

// ─── Outer shell — fetches data, shows skeleton, then mounts inner form ──────
export function CustomerForm({ customerId }) {
  const isEdit = !!customerId;

  const { data: existing, isLoading } = useQuery({
    queryKey: ["customers", "detail", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: isEdit,
    staleTime: 5 * 60 * 1000,
  });

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-44" /></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 md:col-span-2" />
            <Skeleton className="h-10" /><Skeleton className="h-10" />
            <Skeleton className="h-10" /><Skeleton className="h-10" />
            <Skeleton className="h-10 md:col-span-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10" />)}
          </CardContent>
        </Card>
        <Skeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  // Once data is ready (or it's a new customer), mount the real form.
  // We pass defaultValues directly so Radix selects are initialised correctly —
  // no useEffect + form.reset() needed (that pattern causes Radix UI dropdowns
  // to show "Select..." because the Select is mounted before reset fires).
  const defaultValues = isEdit && existing ? mapExisting(existing) : { ...DEFAULTS };

  return (
    <CustomerFormInner
      key={customerId ?? "new"}          // remount on customer change
      customerId={customerId}
      isEdit={isEdit}
      existing={existing}
      defaultValues={defaultValues}
    />
  );
}

// ─── Inner form — receives stable defaultValues at mount time ────────────────
function CustomerFormInner({ customerId, isEdit, existing, defaultValues }) {
  const router = useRouter();
  const qc     = useQueryClient();

  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  const saveMut = useMutation({
    mutationFn: async (values) => {
      // Strip empty strings so Mongoose enum fields never receive "".
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== "" && v !== undefined)
      );
      const url    = isEdit ? `/api/customers/${customerId}` : "/api/customers";
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
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", "detail", customerId] });
      toast.success(isEdit ? "Customer updated" : "Customer created");
      const id = data._id ?? data.id ?? customerId;
      router.push(`/customers/${id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => saveMut.mutate(v))}
        className="space-y-6"
        aria-busy={saveMut.isPending}
      >
        {/* Full-screen save overlay */}
        {saveMut.isPending && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-10 py-8 shadow-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">
                {isEdit ? "Updating customer…" : "Creating customer…"}
              </p>
            </div>
          </div>
        )}

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? `Edit: ${existing?.companyName || "Customer"}` : "New Customer"}
          </h1>
          {isEdit && existing && (
            <p className="text-sm text-muted-foreground">
              {existing.businessType} • {existing.status}
            </p>
          )}
        </div>

        {/* Company Information */}
        <Card>
          <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextField
              control={form.control} name="companyName"
              label="Company Name *" placeholder="ABC Construction LLC"
              className="md:col-span-2"
            />
            <FormSelectField
              control={form.control} name="businessType"
              label="Business Type" options={businessTypeOpts}
            />
            <FormTextField
              control={form.control} name="industry"
              label="Industry" placeholder="Construction"
            />
            <FormTextField
              control={form.control} name="vatRegistrationNumber"
              label="VAT / TRN Number" placeholder="100XXXXXXXXX00003"
            />
            <FormTextField
              control={form.control} name="tradeLicenseNumber"
              label="Trade License Number"
            />
            <FormTextField
              control={form.control} name="website"
              label="Website" placeholder="https://example.com"
              className="md:col-span-2"
            />
          </CardContent>
        </Card>

        {/* Sales & Financial */}
        <Card>
          <CardHeader><CardTitle className="text-base">Sales & Financial</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelectField
              control={form.control} name="customerType"
              label="Customer Type" options={customerTypeOpts}
            />
            <FormSelectField
              control={form.control} name="status"
              label="Status" options={statusOpts}
            />
            <FormSelectField
              control={form.control} name="paymentTerms"
              label="Payment Terms" options={paymentTermsOpts}
            />
            <FormNumberField
              control={form.control} name="creditLimit"
              label="Credit Limit (AED)" min={0} step={100}
            />
            <FormSelectField
              control={form.control} name="source"
              label="Lead Source" options={sourceOpts}
            />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <FormTextAreaField
              control={form.control} name="notes"
              label="Notes"
              placeholder="Any relevant notes about this customer..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          <Button
            type="button" variant="outline"
            onClick={() => router.back()}
            disabled={saveMut.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button type="submit" disabled={saveMut.isPending}>
            {saveMut.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2 inline" aria-hidden />
            )}
            {isEdit ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
