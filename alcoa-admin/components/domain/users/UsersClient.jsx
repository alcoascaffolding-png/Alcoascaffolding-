"use client";

import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/forms/form-layout";
import {
  FormTextField,
  FormSelectField,
  FormCheckboxField,
} from "@/components/forms/form-fields";
import { UserPermissionsFields } from "@/components/domain/users/UserPermissionsFields";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";

const userSchema = z
  .object({
    // Hidden flag so validation can distinguish create (password required)
    // from edit (password optional — blank keeps the current password).
    __isEditing: z.boolean().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email required"),
    password: z.string().optional(),
    role: z.enum(["super_admin", "admin", "manager", "accountant", "sales", "inventory", "viewer"]),
    department: z.enum(["management", "sales", "accounts", "inventory", "operations"]).default("operations"),
    phone: z.string().optional(),
    isActive: z.boolean().default(true),
    useCustomPermissions: z.boolean().default(false),
    permissions: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    const password = data.password?.trim() ?? "";
    // Required only when creating a new user.
    if (!data.__isEditing && password.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required for new users",
        path: ["password"],
      });
      return;
    }
    // When provided (create or edit), enforce minimum length.
    if (password.length > 0 && password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
  });

const defaultValues = {
  __isEditing: false,
  name: "",
  email: "",
  password: "",
  role: "viewer",
  department: "operations",
  phone: "",
  isActive: true,
  useCustomPermissions: false,
  permissions: [],
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
    accessorKey: "useCustomPermissions",
    header: "Permissions",
    cell: ({ row }) => (
      <Badge variant={row.original.useCustomPermissions ? "secondary" : "outline"}>
        {row.original.useCustomPermissions ? "Custom" : "Role default"}
      </Badge>
    ),
    size: 110,
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

function UserFormFields({ control, isEditing }) {
  return (
    <>
      <FormSection title="Account" description="Login identity and role.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormTextField control={control} name="name" label="Full name" autoComplete="off" />
          <FormTextField
            control={control}
            name="email"
            label="Email"
            type="email"
            autoComplete="off"
          />
          <FormTextField
            control={control}
            name="password"
            label={isEditing ? "New password" : "Password"}
            type="password"
            autoComplete="new-password"
            placeholder={isEditing ? "Leave blank to keep current password" : "At least 8 characters"}
            description={
              isEditing
                ? "Leave blank to keep the current password. Enter a new value to change it (min. 8 characters)."
                : "Minimum 8 characters. The user can change it after signing in."
            }
            className="md:col-span-2"
          />
          <FormSelectField control={control} name="role" label="Role" options={roleOptions} />
          <FormSelectField control={control} name="department" label="Department" options={departmentOptions} />
          <FormTextField control={control} name="phone" label="Phone" autoComplete="off" />
        </div>
        <FormCheckboxField
          control={control}
          name="isActive"
          label="Active account"
          description="Inactive users cannot sign in."
          className="mt-1"
        />
      </FormSection>

      <FormSection
        title="Access control"
        description="Choose how this user's module permissions are determined."
      >
        <UserPermissionsFields control={control} />
      </FormSection>
    </>
  );
}

function mapUserToForm(item) {
  return {
    __isEditing: true,
    name: item.name || "",
    email: item.email || "",
    password: "",
    role: item.role || "viewer",
    department: item.department || "operations",
    phone: item.phone || "",
    isActive: item.isActive !== false,
    useCustomPermissions: !!item.useCustomPermissions,
    permissions: Array.isArray(item.permissions) ? item.permissions : [],
  };
}

export function UsersClient() {
  return (
    <GenericCRUDPage
      resource="users"
      title="Users"
      resourceSingular="User"
      description="Manage admin panel accounts, roles, and per-user module permissions."
      emptyMessage="No users yet. Add your first admin account to get started."
      columns={columns}
      schema={userSchema}
      defaultValues={defaultValues}
      FormFields={UserFormFields}
      mapItemToForm={mapUserToForm}
      prepareSavePayload={(values, isEdit) => {
        const payload = { ...values };
        // Internal form-only flag — never send to the API.
        delete payload.__isEditing;
        // On edit, a blank password means "keep the existing one".
        if (isEdit && !payload.password?.trim()) {
          delete payload.password;
        }
        // Safety net (validation already enforces this on create).
        if (!isEdit && !payload.password?.trim()) {
          throw new Error("Password is required for new users (min. 8 characters)");
        }
        return payload;
      }}
      statCards={(s) => [
        { label: "Total users", value: s.total ?? 0 },
        {
          label: "Active",
          value: s.active ?? 0,
          valueClassName: "text-emerald-500",
        },
        {
          label: "Inactive",
          value: Math.max(0, (s.total ?? 0) - (s.active ?? 0)),
          valueClassName: "text-muted-foreground",
        },
      ]}
    />
  );
}
