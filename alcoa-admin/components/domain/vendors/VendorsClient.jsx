"use client";
import { useMemo, useState } from "react";
import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { FormTextField, FormSelectField, FormNumberField, FormTextAreaField } from "@/components/forms/form-fields";
import { FormSection, FormGrid, FormGridFull } from "@/components/forms/form-layout";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategorySelectField } from "@/components/shared/CategorySelectField";
import { ExportButton } from "@/components/data-table/ExportButton";

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

const schema = z.object({
  vendorCode: z.string().optional(),
  companyName: z.string().min(1, "Company name required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  emirate: z.string().optional(),
  vatNumber: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  paymentTerms: z.string().default("Cash"),
  category: z.string().default("Supplier"),
  creditLimit: z.coerce.number().min(0).default(0),
  status: z.string().default("active"),
  notes: z.string().optional(),
});

const statusColors = { active: "success", inactive: "secondary", blocked: "destructive" };
const columns = [
  { accessorKey: "vendorCode", header: "Code", size: 130 },
  { accessorKey: "companyName", header: "Company", cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span> },
  { accessorKey: "contactPerson", header: "Contact" },
  { accessorKey: "vatNumber", header: "VAT/TRN", size: 110 },
  { accessorKey: "paymentTerms", header: "Terms", size: 90 },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={statusColors[row.original.status]}>{row.original.status}</Badge>, size: 90 },
];

function VendorFormFields({ control }) {
  return (
    <>
      <FormSection title="Company" description="Legal and trading details.">
        <FormGrid>
          <FormTextField
            control={control}
            name="vendorCode"
            label="Vendor code"
            placeholder="Auto-generated on save"
            description="Assigned automatically when you create the vendor."
            readOnly
          />
          <FormTextField
            control={control}
            name="companyName"
            label="Company name"
            placeholder="e.g. Dubai Scaffolding Supplies LLC"
          />
          <CategorySelectField control={control} name="category" type="vendor" />
          <FormTextField
            control={control}
            name="tradeLicenseNumber"
            label="Trade license"
            placeholder="e.g. 123456"
          />
          <FormTextField
            control={control}
            name="vatNumber"
            label="VAT / TRN"
            placeholder="e.g. 100123456700003"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Contact">
        <FormGrid>
          <FormTextField
            control={control}
            name="contactPerson"
            label="Contact person"
            placeholder="e.g. Ahmed Hassan"
          />
          <FormTextField
            control={control}
            name="email"
            label="Email"
            type="email"
            placeholder="vendor@company.ae"
          />
          <FormTextField
            control={control}
            name="phone"
            label="Phone"
            placeholder="e.g. +971 50 123 4567"
          />
          <FormSelectField
            control={control}
            name="emirate"
            label="Emirate"
            placeholder="Select emirate…"
            options={[
              { value: "Dubai", label: "Dubai" },
              { value: "Abu Dhabi", label: "Abu Dhabi" },
              { value: "Sharjah", label: "Sharjah" },
              { value: "Ajman", label: "Ajman" },
              { value: "Umm Al Quwain", label: "Umm Al Quwain" },
              { value: "Ras Al Khaimah", label: "Ras Al Khaimah" },
              { value: "Fujairah", label: "Fujairah" },
            ]}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Terms & status">
        <FormGrid>
          <FormSelectField
            control={control}
            name="paymentTerms"
            label="Payment terms"
            placeholder="Select terms…"
            options={[
              { value: "Cash", label: "Cash" },
              { value: "7 Days", label: "7 Days" },
              { value: "15 Days", label: "15 Days" },
              { value: "30 Days", label: "30 Days" },
              { value: "60 Days", label: "60 Days" },
              { value: "Custom", label: "Custom" },
            ]}
          />
          <FormNumberField
            control={control}
            name="creditLimit"
            label="Credit limit (AED)"
            placeholder="0.00"
            min={0}
            step={0.01}
          />
          <FormSelectField
            control={control}
            name="status"
            label="Status"
            placeholder="Select status…"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "blocked", label: "Blocked" },
            ]}
          />
          <FormGridFull>
            <FormTextAreaField
              control={control}
              name="notes"
              label="Notes"
              placeholder="Internal notes about this vendor…"
              rows={3}
            />
          </FormGridFull>
        </FormGrid>
      </FormSection>
    </>
  );
}

export function VendorsClient() {
  const [statusFilter, setStatusFilter] = useState("all");

  const extraListParams = useMemo(
    () => (statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
    [statusFilter]
  );

  return (
    <GenericCRUDPage
      resource="vendors" title="Vendors" columns={columns} schema={schema}
      emptyMessage="No vendors yet."
      emptyDescription="Add your suppliers and subcontractors to use them on purchase orders and invoices."
      extraListParams={extraListParams}
      defaultValues={{
        vendorCode: "", companyName: "", contactPerson: "", email: "", phone: "",
        emirate: "", vatNumber: "", tradeLicenseNumber: "", paymentTerms: "Cash",
        category: "Supplier", creditLimit: 0, status: "active", notes: "",
      }}
      FormFields={VendorFormFields}
      prepareSavePayload={(values) => {
        const payload = { ...values };
        if (!payload.vendorCode?.trim()) delete payload.vendorCode;
        return payload;
      }}
      statCards={(s) => [{ label: "Total Vendors", value: s.total }]}
      toolbarExtra={
        <>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ExportButton resource="vendors" filename="vendors" />
        </>
      }
    />
  );
}
