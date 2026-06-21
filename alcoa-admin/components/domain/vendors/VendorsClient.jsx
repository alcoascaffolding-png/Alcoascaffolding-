"use client";
import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { FormTextField, FormSelectField, FormNumberField, FormTextAreaField } from "@/components/forms/form-fields";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  vendorCode: z.string().min(1, "Vendor code required"),
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
  { accessorKey: "vendorCode", header: "Code", size: 90 },
  { accessorKey: "companyName", header: "Company", cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span> },
  { accessorKey: "contactPerson", header: "Contact" },
  { accessorKey: "vatNumber", header: "VAT/TRN", size: 110 },
  { accessorKey: "paymentTerms", header: "Terms", size: 90 },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={statusColors[row.original.status]}>{row.original.status}</Badge>, size: 90 },
];

function VendorFormFields({ control }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormTextField control={control} name="vendorCode" label="Vendor Code" placeholder="VEN-001" />
      <FormTextField control={control} name="companyName" label="Company Name" placeholder="Vendor Company" />
      <FormTextField control={control} name="contactPerson" label="Contact Person" />
      <FormTextField control={control} name="email" label="Email" type="email" />
      <FormTextField control={control} name="phone" label="Phone" />
      <FormSelectField control={control} name="emirate" label="Emirate" options={[
        { value: "Dubai", label: "Dubai" }, { value: "Abu Dhabi", label: "Abu Dhabi" },
        { value: "Sharjah", label: "Sharjah" }, { value: "Ajman", label: "Ajman" },
      ]} />
      <FormTextField control={control} name="vatNumber" label="VAT / TRN" />
      <FormTextField control={control} name="tradeLicenseNumber" label="Trade License" />
      <FormSelectField control={control} name="category" label="Category" options={[
        { value: "Supplier", label: "Supplier" },
        { value: "Manufacturer", label: "Manufacturer" },
        { value: "Distributor", label: "Distributor" },
        { value: "Service Provider", label: "Service Provider" },
        { value: "Other", label: "Other" },
      ]} />
      <FormSelectField control={control} name="paymentTerms" label="Payment Terms" options={[
        { value: "Cash", label: "Cash" },
        { value: "7 Days", label: "7 Days" },
        { value: "15 Days", label: "15 Days" },
        { value: "30 Days", label: "30 Days" },
        { value: "60 Days", label: "60 Days" },
        { value: "Custom", label: "Custom" },
      ]} />
      <FormNumberField control={control} name="creditLimit" label="Credit Limit (AED)" min={0} />
      <FormSelectField control={control} name="status" label="Status" options={[
        { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "blocked", label: "Blocked" },
      ]} />
      <FormTextAreaField control={control} name="notes" label="Notes" className="col-span-2" rows={2} />
    </div>
  );
}

export function VendorsClient() {
  return (
    <GenericCRUDPage
      resource="vendors" title="Vendors" columns={columns} schema={schema}
      defaultValues={{
        vendorCode: "", companyName: "", contactPerson: "", email: "", phone: "",
        emirate: "", vatNumber: "", tradeLicenseNumber: "", paymentTerms: "Cash",
        category: "Supplier", creditLimit: 0, status: "active", notes: "",
      }}
      FormFields={VendorFormFields}
      statCards={(s) => [{ label: "Total Vendors", value: s.total }]}
    />
  );
}
