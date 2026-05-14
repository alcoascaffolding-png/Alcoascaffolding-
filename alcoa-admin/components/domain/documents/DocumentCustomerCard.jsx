"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelectField, FormTextField } from "@/components/forms/form-fields";

/**
 * Shared customer block for quotation / sales order / invoice forms.
 * Pass `children` for document-specific fields (e.g. TRN, linked quotation).
 */
export function DocumentCustomerCard({
  control,
  title = "Customer",
  customerOptions,
  customerSelectDescription,
  customerSelectPlaceholder,
  customerNameLabel = "Customer / Company *",
  customerNamePlaceholder,
  children,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelectField
          control={control}
          name="customer"
          label="Existing customer (optional)"
          placeholder={customerSelectPlaceholder}
          options={customerOptions}
          description={customerSelectDescription}
          className="md:col-span-2"
        />
        <FormTextField
          control={control}
          name="customerName"
          label={customerNameLabel}
          placeholder={customerNamePlaceholder}
          className="md:col-span-2"
        />
        <FormTextField control={control} name="customerEmail" label="Email" type="email" />
        <FormTextField control={control} name="customerPhone" label="Phone" />
        {children}
      </CardContent>
    </Card>
  );
}
