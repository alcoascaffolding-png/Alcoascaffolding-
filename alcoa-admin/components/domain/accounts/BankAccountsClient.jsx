"use client";
import { z } from "zod";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { FormTextField } from "@/components/forms/form-fields";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  accountName: z.string().min(1, "Account name required"),
  bankName: z.string().min(1, "Bank name required"),
  accountNumber: z.string().min(1, "Account number required"),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  branch: z.string().optional(),
  currency: z.string().default("AED"),
});

const columns = [
  { accessorKey: "accountName", header: "Account Name", cell: ({ row }) => <span className="font-medium">{row.original.accountName}</span> },
  { accessorKey: "bankName", header: "Bank" },
  { accessorKey: "accountNumber", header: "Account No." },
  { accessorKey: "iban", header: "IBAN" },
  { accessorKey: "currency", header: "Currency", size: 80 },
  { accessorKey: "currentBalance", header: "Balance", cell: ({ row }) => formatCurrency(row.original.currentBalance || 0), size: 130 },
];

function BankAccountFormFields({ control }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormTextField control={control} name="accountName" label="Account Name" />
      <FormTextField control={control} name="bankName" label="Bank Name" />
      <FormTextField control={control} name="accountNumber" label="Account Number" />
      <FormTextField control={control} name="iban" label="IBAN" />
      <FormTextField control={control} name="swiftCode" label="Swift Code" />
      <FormTextField control={control} name="branch" label="Branch" />
      <FormTextField control={control} name="currency" label="Currency" placeholder="AED" />
    </div>
  );
}

export function BankAccountsClient() {
  return (
    <GenericCRUDPage
      resource="bank-accounts" title="Bank Accounts" columns={columns} schema={schema}
      defaultValues={{ accountName: "", bankName: "", accountNumber: "", iban: "", swiftCode: "", branch: "", currency: "AED" }}
      FormFields={BankAccountFormFields}
      statCards={(s) => [{ label: "Total Accounts", value: s.total }]}
    />
  );
}
