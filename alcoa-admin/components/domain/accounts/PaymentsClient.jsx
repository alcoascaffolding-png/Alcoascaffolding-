"use client";

import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useWatch } from "react-hook-form";
import { GenericCRUDPage } from "@/components/domain/GenericCRUDPage";
import {
  FormTextField,
  FormSelectField,
  FormNumberField,
  FormTextAreaField,
} from "@/components/forms/form-fields";
import { formatCurrency, formatDate } from "@/lib/utils";

const paymentMethodOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Cheque", label: "Cheque" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Online", label: "Online" },
  { value: "Other", label: "Other" },
];

const paymentSchema = z.object({
  invoice: z.string().min(1, "Purchase invoice is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
  paymentMethod: z.string().default("Bank Transfer"),
  bankAccount: z.string().optional(),
  paymentDate: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const defaultValues = {
  invoice: "",
  amount: 0,
  paymentMethod: "Bank Transfer",
  bankAccount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  reference: "",
  notes: "",
};

const columns = [
  { accessorKey: "paymentNumber", header: "Payment #", size: 120 },
  { accessorKey: "vendorName", header: "Vendor" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount || 0),
    size: 120,
  },
  { accessorKey: "paymentMethod", header: "Method", size: 110 },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.paymentDate),
    size: 100,
  },
];

function openInvoiceBalance(inv) {
  const total = Number(inv.total) || 0;
  const paid = Number(inv.paidAmount) || 0;
  return Math.max(0, total - paid);
}

function PaymentFormFields({ control }) {
  const selectedInvoiceId = useWatch({ control, name: "invoice" });

  const { data: invoicesData } = useQuery({
    queryKey: ["purchase-invoices", "payments"],
    queryFn: async () => {
      const res = await fetch("/api/purchase-invoices?limit=200");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: bankData } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await fetch("/api/bank-accounts?limit=100");
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const openInvoices = (invoicesData?.items || []).filter(
    (inv) => inv.paymentStatus !== "paid" && openInvoiceBalance(inv) > 0.01
  );

  const invoiceOptions = openInvoices.map((inv) => ({
    value: inv._id,
    label: `${inv.invoiceNumber} — ${inv.vendorName} (due ${formatCurrency(openInvoiceBalance(inv))})`,
  }));

  const bankOptions = [
    { value: "__none__", label: "None" },
    ...(bankData?.items || []).map((b) => ({
      value: b._id,
      label: `${b.accountName} (${b.bankName})`,
    })),
  ];

  const selectedInvoice = openInvoices.find((inv) => inv._id === selectedInvoiceId);
  const maxAmount = selectedInvoice ? openInvoiceBalance(selectedInvoice) : undefined;

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormSelectField
        control={control}
        name="invoice"
        label="Purchase invoice"
        placeholder="Select invoice with balance…"
        options={invoiceOptions}
      />
      <FormNumberField
        control={control}
        name="amount"
        label="Amount paid (AED)"
        min={0.01}
        max={maxAmount}
        description={
          maxAmount != null ? `Outstanding balance: ${formatCurrency(maxAmount)}` : undefined
        }
      />
      <div className="grid grid-cols-2 gap-4">
        <FormSelectField
          control={control}
          name="paymentMethod"
          label="Payment method"
          options={paymentMethodOptions}
        />
        <FormSelectField
          control={control}
          name="bankAccount"
          label="Bank account"
          options={bankOptions}
        />
      </div>
      <FormTextField control={control} name="paymentDate" label="Payment date" type="date" />
      <FormTextField control={control} name="reference" label="Reference / cheque no." />
      <FormTextAreaField control={control} name="notes" label="Notes" rows={2} />
    </div>
  );
}

export function PaymentsClient() {
  const searchParams = useSearchParams();
  const presetInvoiceId = searchParams.get("invoice");

  return (
    <GenericCRUDPage
      resource="payments"
      title="Payments"
      columns={columns}
      schema={paymentSchema}
      defaultValues={defaultValues}
      FormFields={PaymentFormFields}
      allowEdit={false}
      initialOpenCreate={!!presetInvoiceId}
      presetValues={presetInvoiceId ? { invoice: presetInvoiceId } : null}
      statCards={(s) => [
        { label: "Total Payments", value: s.total },
        { label: "Total Paid", value: formatCurrency(s.totalAmount || 0) },
      ]}
    />
  );
}
