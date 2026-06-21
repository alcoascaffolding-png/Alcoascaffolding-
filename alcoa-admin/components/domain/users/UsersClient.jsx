"use client";

import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import {
  FormTextField,
  FormSelectField,
  FormCheckboxField,
} from "@/components/forms/form-fields";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().optional(),
  role: z.enum(["super_admin", "admin", "manager", "accountant", "sales", "inventory", "viewer"]),
  department: z.enum(["management", "sales", "accounts", "inventory", "operations"]).default("operations"),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

const defaultValues = {
  name: "",
  email: "",
  password: "",
  role: "viewer",
  department: "operations",
  phone: "",
  isActive: true,
};

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

const departmentOptions = [
  "management",
  "sales",
  "accounts",
  "inventory",
  "operations",
].map((v) => ({ value: v, label: v }));

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline">{ROLE_LABELS[row.original.role] || row.original.role}</Badge>
    ),
    size: 120,
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "success" : "destructive"}>
        {row.original.isActive ? "Yes" : "No"}
      </Badge>
    ),
    size: 80,
  },
  {
    accessorKey: "lastLogin",
    header: "Last login",
    cell: ({ row }) => (row.original.lastLogin ? formatDate(row.original.lastLogin) : "—"),
    size: 120,
  },
];

function UserFormFields({ control }) {
  return (
    <>
      <FormTextField control={control} name="name" label="Full name" />
      <FormTextField control={control} name="email" label="Email" type="email" />
      <FormTextField
        control={control}
        name="password"
        label="Password (required for new users; leave blank to keep on edit)"
        type="password"
      />
      <FormSelectField control={control} name="role" label="Role" options={roleOptions} />
      <FormSelectField control={control} name="department" label="Department" options={departmentOptions} />
      <FormTextField control={control} name="phone" label="Phone" />
      <FormCheckboxField control={control} name="isActive" label="Active account" />
    </>
  );
}

function mapUserToForm(item) {
  return {
    name: item.name || "",
    email: item.email || "",
    password: "",
    role: item.role || "viewer",
    department: item.department || "operations",
    phone: item.phone || "",
    isActive: item.isActive !== false,
  };
}

export function UsersClient() {
  return (
    <GenericCRUDPage
      resource="users"
      title="Users"
      description="Manage admin panel accounts and roles."
      columns={columns}
      schema={userSchema}
      defaultValues={defaultValues}
      FormFields={UserFormFields}
      mapItemToForm={mapUserToForm}
      prepareSavePayload={(values, isEdit) => {
        const payload = { ...values };
        if (isEdit && !payload.password) delete payload.password;
        return payload;
      }}
      statCards={(s) => [{ label: "Total users", value: s.total }]}
    />
  );
}
