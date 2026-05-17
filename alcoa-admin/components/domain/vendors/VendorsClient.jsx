"use client";
import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { FormTextField, FormSelectField } from "@/components/forms/form-fields";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  vendorCode: z.string().min(1, "Vendor code required"),
  companyName: z.string().min(1, "Company name required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  emirate: z.string().optional(),
  status: z.string().default("active"),
});

const statusColors = { active: "success", inactive: "secondary", blocked: "destructive" };
const columns = [
  { accessorKey: "vendorCode", header: "Code", size: 90 },
  { accessorKey: "companyName", header: "Company", cell: ({ row }) => <span className="font-medium">{row.original.companyName}</span> },
  { accessorKey: "contactPerson", header: "Contact" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
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
      <FormSelectField control={control} name="status" label="Status" options={[
        { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }, { value: "blocked", label: "Blocked" },
      ]} />
    </div>
  );
}

export function VendorsClient() {
  return (
    <GenericCRUDPage
      resource="vendors" title="Vendors" columns={columns} schema={schema}
      defaultValues={{ vendorCode: "", companyName: "", contactPerson: "", email: "", phone: "", emirate: "", status: "active" }}
      FormFields={VendorFormFields}
      statCards={(s) => [{ label: "Total Vendors", value: s.total }]}
    />
  );
}
