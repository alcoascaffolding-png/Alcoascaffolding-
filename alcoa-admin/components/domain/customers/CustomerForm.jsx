"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormTextField, FormSelectField, FormTextAreaField, FormNumberField,
} from "@/components/forms/form-fields";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { BlockingSaveOverlay } from "@/components/loading/loading-kit";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";
import { FormEditSkeleton } from "@/components/loading/skeleton-kit";

// ─── Enum constants (must match Customer model exactly) ───────────────────────
const BUSINESS_TYPES = [
  "Construction Company", "Contractor", "Facility Management",
  "Government", "Individual", "Other",
];
const PAYMENT_TERMS  = ["Cash", "7 Days", "15 Days", "30 Days", "45 Days", "60 Days", "Custom"];
const STATUSES       = ["prospect", "active", "inactive", "blocked"];
const CUSTOMER_TYPES = ["rental", "sales", "both"];
const SOURCES        = ["Website", "Phone Call", "Walk-in", "Referral", "Social Media", "Email", "Other"];

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

const customerSchema = z.object({
  companyName:           z.string().min(1, "Company name is required"),
  businessType:          z.enum(BUSINESS_TYPES).default("Construction Company"),
  industry:              z.string().optional(),
  vatRegistrationNumber: z.string().optional(),
  tradeLicenseNumber:    z.string().optional(),
  website:               z.string().optional(),
  // Primary contact (maps to contactPersons[0] + primaryEmail/Phone via model pre-save)
  contactName:           z.string().min(1, "Contact person name is required"),
  contactDesignation:    z.string().optional(),
  contactEmail: z
    .string()
    .default("")
    .transform((s) => (s ?? "").trim())
    .refine(
      (s) => s === "" || z.string().email().safeParse(s).success,
      "Enter a valid email or leave blank"
    ),
  contactPhone:          z.string().min(1, "Phone number is required"),
  contactWhatsapp:       z.string().optional(),
  // Primary address (maps to addresses[0])
  addressLine1:        z.string().min(1, "Address line 1 is required"),
  addressLine2:          z.string().optional(),
  area:                  z.string().optional(),
  city:                  z.string().min(1, "City is required"),
  emirate:               z.enum(EMIRATES),
  poBox:                 z.string().optional(),
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

const emirateOpts = EMIRATES.map((v) => ({ value: v, label: v }));

const DEFAULTS = {
  companyName:           "",
  businessType:          "Construction Company",
  industry:              "",
  vatRegistrationNumber: "",
  tradeLicenseNumber:    "",
  website:               "",
  contactName:           "",
  contactDesignation:    "",
  contactEmail:          "",
  contactPhone:          "",
  contactWhatsapp:       "",
  addressLine1:          "",
  addressLine2:          "",
  area:                  "",
  city:                  "",
  emirate:               "Dubai",
  poBox:                 "",
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

const CONTACT_ADDRESS_KEYS = new Set([
  "contactName",
  "contactDesignation",
  "contactEmail",
  "contactPhone",
  "contactWhatsapp",
  "addressLine1",
  "addressLine2",
  "area",
  "city",
  "emirate",
  "poBox",
]);

function buildPrimaryContactPayload(values) {
  const email = values.contactEmail?.trim();
  const wa = values.contactWhatsapp?.trim() || values.contactPhone?.trim();
  return {
    name: values.contactName.trim(),
    designation: values.contactDesignation?.trim() || undefined,
    email: email || undefined,
    phone: values.contactPhone.trim(),
    whatsapp: wa || undefined,
    isPrimary: true,
    role: "primary",
  };
}

function buildPrimaryAddressPayload(values) {
  const line2 = values.addressLine2?.trim();
  const area = values.area?.trim();
  const po = values.poBox?.trim();
  return {
    type: "office",
    addressLine1: values.addressLine1.trim(),
    addressLine2: line2 || undefined,
    area: area || undefined,
    city: values.city.trim(),
    emirate: values.emirate,
    country: "UAE",
    poBox: po || undefined,
    isPrimary: true,
  };
}

/** Replace or insert the primary row; clears isPrimary on others. */
function mergePrimaryRow(existingList, primaryPayload, isPrimaryRow) {
  const rows = Array.isArray(existingList) ? existingList.map((r) => ({ ...r })) : [];
  let idx = rows.findIndex(isPrimaryRow);
  if (idx < 0) idx = rows.length ? 0 : -1;
  const merged = { ...primaryPayload, isPrimary: true };
  if (idx >= 0 && rows[idx]?._id != null) {
    merged._id = rows[idx]._id;
  }
  if (rows.length === 0 || idx < 0) {
    return [{ ...primaryPayload, isPrimary: true }];
  }
  rows[idx] = { ...rows[idx], ...merged, isPrimary: true };
  rows.forEach((r, i) => {
    if (i !== idx) r.isPrimary = false;
  });
  return rows;
}

function mapExisting(existing) {
  const contacts = existing.contactPersons || [];
  const primaryContact =
    contacts.find((c) => c.isPrimary) || contacts[0] || null;
  const addresses = existing.addresses || [];
  const primaryAddress =
    addresses.find((a) => a.isPrimary) || addresses[0] || null;
  const em = primaryAddress?.emirate;
  const emirate =
    em && EMIRATES.includes(em) ? em : DEFAULTS.emirate;

  return {
    companyName:           safe(existing.companyName,            DEFAULTS.companyName),
    businessType:          safe(existing.businessType,           DEFAULTS.businessType),
    industry:              safe(existing.industry,               DEFAULTS.industry),
    vatRegistrationNumber: safe(existing.vatRegistrationNumber,  DEFAULTS.vatRegistrationNumber),
    tradeLicenseNumber:    safe(existing.tradeLicenseNumber,     DEFAULTS.tradeLicenseNumber),
    website:               safe(existing.website,                DEFAULTS.website),
    contactName:           safe(primaryContact?.name,            DEFAULTS.contactName),
    contactDesignation:    safe(primaryContact?.designation,     DEFAULTS.contactDesignation),
    contactEmail:          safe(
      primaryContact?.email ?? existing.primaryEmail,
      DEFAULTS.contactEmail
    ),
    contactPhone:          safe(
      primaryContact?.phone ?? existing.primaryPhone,
      DEFAULTS.contactPhone
    ),
    contactWhatsapp:       safe(
      primaryContact?.whatsapp ?? existing.primaryWhatsApp,
      DEFAULTS.contactWhatsapp
    ),
    addressLine1:          safe(primaryAddress?.addressLine1,    DEFAULTS.addressLine1),
    addressLine2:          safe(primaryAddress?.addressLine2,    DEFAULTS.addressLine2),
    area:                  safe(primaryAddress?.area,            DEFAULTS.area),
    city:                  safe(primaryAddress?.city,            DEFAULTS.city),
    emirate,
    poBox:                 safe(primaryAddress?.poBox,          DEFAULTS.poBox),
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
    return <FormEditSkeleton />;
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
      const primaryContact = buildPrimaryContactPayload(values);
      const primaryAddress = buildPrimaryAddressPayload(values);

      const scalars = Object.fromEntries(
        Object.entries(values).filter(
          ([k, v]) =>
            !CONTACT_ADDRESS_KEYS.has(k) &&
            v !== "" &&
            v !== undefined
        )
      );

      const contactPersons = isEdit
        ? mergePrimaryRow(
            existing?.contactPersons,
            primaryContact,
            (c) => Boolean(c.isPrimary)
          )
        : [primaryContact];

      const addresses = isEdit
        ? mergePrimaryRow(
            existing?.addresses,
            primaryAddress,
            (a) => Boolean(a.isPrimary)
          )
        : [primaryAddress];

      const payload = {
        ...scalars,
        contactPersons,
        addresses,
      };

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
          <BlockingSaveOverlay
            title={isEdit ? "Updating customer…" : "Creating customer…"}
            description="Please wait — saving company, contact, and address."
          />
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

        {/* Primary contact — drives primaryEmail / primaryPhone on the customer (model pre-save) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary contact</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Used for quotations, email, and WhatsApp. Phone is required.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextField
              control={form.control}
              name="contactName"
              label="Contact name *"
              placeholder="e.g. Ahmed Al Mansoori"
              className="md:col-span-2"
            />
            <FormTextField
              control={form.control}
              name="contactDesignation"
              label="Designation"
              placeholder="e.g. Procurement Manager"
            />
            <FormTextField
              control={form.control}
              name="contactEmail"
              label="Email"
              type="email"
              placeholder="name@company.com"
            />
            <FormTextField
              control={form.control}
              name="contactPhone"
              label="Phone *"
              type="tel"
              placeholder="+971 4 123 4567"
            />
            <FormTextField
              control={form.control}
              name="contactWhatsapp"
              label="WhatsApp (optional)"
              type="tel"
              placeholder="Leave blank to use phone"
              className="md:col-span-2"
            />
          </CardContent>
        </Card>

        {/* Primary address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Primary address</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Main office or billing address (UAE).
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextField
              control={form.control}
              name="addressLine1"
              label="Address line 1 *"
              placeholder="Building / street"
              className="md:col-span-2"
            />
            <FormTextField
              control={form.control}
              name="addressLine2"
              label="Address line 2"
              placeholder="Floor, unit…"
              className="md:col-span-2"
            />
            <FormTextField
              control={form.control}
              name="area"
              label="Area / district"
              placeholder="Business Bay"
            />
            <FormTextField
              control={form.control}
              name="city"
              label="City *"
              placeholder="Dubai"
            />
            <FormSelectField
              control={form.control}
              name="emirate"
              label="Emirate *"
              options={emirateOpts}
            />
            <FormTextField
              control={form.control}
              name="poBox"
              label="P.O. Box"
              placeholder="Optional"
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
            {saveMut.isPending && <InlineSkeleton className="mr-2 inline" />}
            {isEdit ? "Update Customer" : "Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
