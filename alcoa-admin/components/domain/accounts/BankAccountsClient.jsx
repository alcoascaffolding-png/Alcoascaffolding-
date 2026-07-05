"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Star, FileText } from "lucide-react";
import { toast } from "sonner";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import { FormTextField, FormSwitchField } from "@/components/forms/form-fields";
import { AsyncButton } from "@/components/ui/async-button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { companyBankAccountFormDefaults } from "@/lib/company-bank-details";

const schema = z.object({
  accountName: z.string().min(1, "Account name required"),
  bankName: z.string().min(1, "Bank name required"),
  accountNumber: z.string().min(1, "Account number required"),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  branch: z.string().optional(),
  currency: z.string().default("AED"),
  isPrimary: z.boolean().optional().default(false),
});

const defaultValues = {
  ...companyBankAccountFormDefaults(),
  isPrimary: false,
};

function mapItemToForm(item) {
  return {
    accountName: item.accountName || "",
    bankName: item.bankName || "",
    accountNumber: item.accountNumber || "",
    iban: item.iban || "",
    swiftCode: item.swiftCode || "",
    branch: item.branch || "",
    currency: item.currency || "AED",
    isPrimary: !!item.isPrimary,
  };
}

function BankAccountFormFields({ control }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormTextField control={control} name="accountName" label="Account Name" />
        <FormTextField control={control} name="bankName" label="Bank Name" />
        <FormTextField control={control} name="accountNumber" label="Account Number" />
        <FormTextField control={control} name="iban" label="IBAN" />
        <FormTextField control={control} name="swiftCode" label="Swift Code" />
        <FormTextField control={control} name="branch" label="Branch" />
        <FormTextField control={control} name="currency" label="Currency" placeholder="AED" />
      </div>
      <FormSwitchField
        control={control}
        name="isPrimary"
        label="Default for quotations & PDF"
        description="Auto-selected on new quotations. Used on quotation PDFs when no specific bank is chosen on the quote."
      />
    </div>
  );
}

export function BankAccountsClient() {
  const qc = useQueryClient();
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);

  const setPrimaryMut = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/bank-accounts/${id}/set-primary`, { method: "POST" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts", "stats"] });
      qc.invalidateQueries({ queryKey: ["bank-accounts", "quotation-form"] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices"] });
      toast.success("Primary account updated — bank details now apply to all modules and PDFs");
    },
    onError: (e) => toast.error(e.message),
    onSettled: () => setSettingPrimaryId(null),
  });

  const columns = [
    {
      accessorKey: "accountName",
      header: "Account Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.accountName}
          {row.original.isPrimary ? (
            <Badge variant="default" className="ml-2 text-[10px] uppercase">
              Primary
            </Badge>
          ) : null}
        </span>
      ),
    },
    { accessorKey: "bankName", header: "Bank" },
    { accessorKey: "accountNumber", header: "Account No." },
    { accessorKey: "iban", header: "IBAN" },
    { accessorKey: "currency", header: "Currency", size: 80 },
    {
      id: "pdfDefault",
      header: "PDF Default",
      cell: ({ row }) =>
        row.original.isPrimary ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <FileText className="h-3.5 w-3.5" />
            Yes
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
      size: 110,
    },
    {
      accessorKey: "currentBalance",
      header: "Balance",
      cell: ({ row }) => formatCurrency(row.original.currentBalance || 0),
      size: 130,
    },
  ];

  return (
    <GenericCRUDPage
      resource="bank-accounts"
      title="Bank Accounts"
      resourceSingular="Bank Account"
      columns={columns}
      schema={schema}
      defaultValues={defaultValues}
      mapItemToForm={mapItemToForm}
      FormFields={BankAccountFormFields}
      invalidateQueryKeys={[
        ["bank-accounts", "quotation-form"],
        ["quotations"],
        ["sales-orders"],
        ["sales-invoices"],
      ]}
      statCards={(s) => [
        { label: "Total Accounts", value: s.total },
        {
          label: "PDF Default Account",
          value: s.primaryLabel || "Not set",
          valueClassName: s.primaryLabel ? "text-sm font-semibold mt-1" : "text-sm text-muted-foreground mt-1",
        },
      ]}
      extraRowActions={(item) => (
        <AsyncButton
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title={
            item.isPrimary
              ? "This is the primary / PDF default account"
              : "Set as primary & PDF default"
          }
          loading={settingPrimaryId === item._id && setPrimaryMut.isPending}
          disabled={!!item.isPrimary || setPrimaryMut.isPending}
          onClick={(e) => {
            e.stopPropagation();
            setSettingPrimaryId(item._id);
            setPrimaryMut.mutate(item._id);
          }}
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              item.isPrimary ? "fill-amber-400 text-amber-500" : "text-muted-foreground"
            )}
          />
        </AsyncButton>
      )}
    />
  );
}
