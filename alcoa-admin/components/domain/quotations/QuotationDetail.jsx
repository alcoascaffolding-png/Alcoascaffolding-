"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/async-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Receipt, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency, isLocalCalendarDayBeforeToday } from "@/lib/utils";
import {
  QUOTATION_PDF_BANK_DETAILS,
  itemAmountWithVat,
  quotationDisplaySubtotal,
} from "@/lib/quotation-display";
import {
  formatCustomerAddressLines,
  getPrimaryAddress,
} from "@/lib/map-customer-to-quotation";
import { formatCustomerAddressFromRecord } from "@/lib/map-sales-order-for-quotation-pdf";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { DocumentDetailToolbar } from "@/components/domain/documents/DocumentDetailToolbar";
import { useDocumentDetailOutbound } from "@/hooks/use-document-detail-outbound";
import { QuotationStatusChanger } from "@/components/domain/quotations/QuotationStatusChanger";

function InfoRow({ label, value, valueClassName = "" }) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-3 gap-y-0.5 py-2 border-b border-border/60 last:border-0 text-sm">
      <span className="text-muted-foreground font-medium uppercase text-xs tracking-wide">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}

function InfoRowAlways({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-3 gap-y-0.5 py-2 border-b border-border/60 last:border-0 text-sm">
      <span className="text-muted-foreground font-medium uppercase text-xs tracking-wide">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}

export function QuotationDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ["quotations", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/quotations/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const {
    showWhatsApp,
    sending,
    downloadPdf,
    sendEmail,
    sendWhatsApp,
    copyWhatsAppLink,
  } = useDocumentDetailOutbound({
    id,
    apiBase: "/api/quotations",
    listQueryKey: ["quotations"],
    detailQueryKey: ["quotations", "detail", id],
    document: quotation,
    numberField: "quoteNumber",
    statsQueryKey: ["quotations-stats"],
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations-stats"] });
      toast.success("Quotation deleted");
      router.push("/quotations");
    },
    onError: (e) => toast.error(e.message),
  });

  const convertMut = useMutation({
    mutationFn: async (target) => {
      const endpoint =
        target === "invoice" ? "convert-to-invoice" : "convert-to-sales-order";
      const res = await fetch(`/api/quotations/${id}/${endpoint}`, { method: "POST" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return { target, data: d.data };
    },
    onSuccess: ({ target, data }) => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations-stats"] });
      qc.invalidateQueries({ queryKey: ["quotations", "detail", id] });
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-orders-stats"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices-stats"] });
      if (target === "invoice") {
        toast.success(
          data.created
            ? `Tax invoice ${data.invoiceNumber} created`
            : `Tax invoice ${data.invoiceNumber} already exists`
        );
      } else {
        toast.success(
          data.created
            ? `Sales order ${data.orderNumber} created`
            : `Sales order ${data.orderNumber} already exists`
        );
      }
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const q = quotation;
  const customer = q.customer && typeof q.customer === "object" ? q.customer : null;
  const customerAddress =
    q.customerAddress ||
    formatCustomerAddressLines(getPrimaryAddress(customer)) ||
    formatCustomerAddressFromRecord(customer);
  const customerTRN = q.customerTRN || customer?.vatRegistrationNumber;
  const customerEmail = resolveDocumentCustomerEmail(q);
  const customerPhone = resolveDocumentCustomerPhone(q);
  const vatPct = q.vatPercentage ?? 5;
  const displaySubtotal = quotationDisplaySubtotal(q);
  const bank = QUOTATION_PDF_BANK_DETAILS;
  const subject = q.subject || `Quotation ${q.quoteNumber}`;
  const hasSalesOrder = !!q.linked?.salesOrder;
  const hasSalesInvoice = !!q.linked?.salesInvoice;
  const conversionDisabled = ["rejected", "expired"].includes(q.status);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/quotations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{q.quoteNumber}</h1>
            <p className="text-sm text-muted-foreground">{q.customerName}</p>
          </div>
          <QuotationStatusChanger
            id={id}
            value={q.status}
            detailQueryKey={["quotations", "detail", id]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AsyncButton
            type="button"
            variant="outline"
            size="sm"
            loading={convertMut.isPending && convertMut.variables === "sales-order"}
            disabled={
              hasSalesOrder ||
              conversionDisabled ||
              (convertMut.isPending && convertMut.variables !== "sales-order")
            }
            pendingLabel="Converting…"
            onClick={() => convertMut.mutate("sales-order")}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {hasSalesOrder ? "Sales Order Created" : "Convert to Sales Order"}
          </AsyncButton>
          <AsyncButton
            type="button"
            variant="outline"
            size="sm"
            loading={convertMut.isPending && convertMut.variables === "invoice"}
            disabled={
              hasSalesInvoice ||
              conversionDisabled ||
              (convertMut.isPending && convertMut.variables !== "invoice")
            }
            pendingLabel="Converting…"
            onClick={() => convertMut.mutate("invoice")}
          >
            <Receipt className="h-4 w-4 mr-1" />
            {hasSalesInvoice ? "Invoice Created" : "Convert to Invoice"}
          </AsyncButton>
          <DocumentDetailToolbar
            sending={sending}
            showWhatsApp={showWhatsApp}
            hasEmail={!!customerEmail}
            hasPhone={!!customerPhone}
            onDownloadPdf={downloadPdf}
            onSendEmail={sendEmail}
            onSendWhatsApp={sendWhatsApp}
            onCopyWhatsAppLink={copyWhatsAppLink}
            onEdit={() => router.push(`/quotations/${id}/edit`)}
            onDelete={() => setShowDelete(true)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {(hasSalesOrder ||
          hasSalesInvoice ||
          ["converted", "converted_to_sales_order", "converted_to_invoice"].includes(q.status)) && (
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Linked sales documents</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-sm">
              {q.linked?.salesOrder ? (
                <p>
                  <span className="text-muted-foreground">Sales order: </span>
                  <Link
                    href={`/sales-orders/${q.linked.salesOrder._id}`}
                    className="font-mono font-medium text-primary hover:underline"
                  >
                    {q.linked.salesOrder.orderNumber}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    ({q.linked.salesOrder.status}) — {formatCurrency(q.linked.salesOrder.total)}
                  </span>
                </p>
              ) : (
                <p className="text-amber-700 dark:text-amber-400">
                  No sales order linked yet. Use <strong>Convert to Sales Order</strong> if this
                  quotation should become a sales order.
                </p>
              )}
              {q.linked?.salesInvoice ? (
                <p>
                  <span className="text-muted-foreground">Tax invoice: </span>
                  <Link
                    href={`/sales-invoices/${q.linked.salesInvoice._id}`}
                    className="font-mono font-medium text-primary hover:underline"
                  >
                    {q.linked.salesInvoice.invoiceNumber}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    ({q.linked.salesInvoice.status}) — {formatCurrency(q.linked.salesInvoice.total)}
                  </span>
                </p>
              ) : q.linked?.salesOrder ? (
                <p className="text-muted-foreground">
                  No tax invoice yet. Use <strong>Convert to Invoice</strong> or invoice the linked
                  sales order.
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* PDF-style header info — above line items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Customer Name" value={q.customerName} />
              <InfoRowAlways label="Address" value={customerAddress} />
              <InfoRowAlways label="Mobile No" value={customerPhone || q.customerPhone} />
              <InfoRowAlways label="TRN" value={customerTRN} />
              <InfoRowAlways label="Contact Person" value={q.contactPersonName} />
              <InfoRow label="Email" value={customerEmail} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quotation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Quotation No" value={q.quoteNumber} />
              <InfoRowAlways label="Date" value={formatDate(q.quoteDate)} />
              <InfoRowAlways label="Sales Executive" value={q.salesExecutive || q.preparedBy} />
              <InfoRowAlways label="Payment Terms" value={q.paymentTerms || "Cash/CDC"} />
              <InfoRowAlways label="Delivery Terms" value={q.deliveryTerms} />
              <InfoRow
                label="Valid Until"
                value={formatDate(q.validUntil)}
                valueClassName={
                  isLocalCalendarDayBeforeToday(q.validUntil) &&
                  ![
                    "accepted",
                    "approved",
                    "converted",
                    "converted_to_sales_order",
                    "converted_to_invoice",
                  ].includes(q.status)
                    ? "text-destructive font-medium"
                    : ""
                }
              />
              <InfoRow label="Quote Type" value={q.quoteType ? String(q.quoteType).replace(/_/g, " ") : null} />
              <InfoRow label="Prepared By" value={q.preparedBy} />
              <InfoRow label="Reference" value={q.referenceNumber} />
              <InfoRow label="Customer PO" value={q.customerPONumber} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-3 px-4">
            <p className="text-sm">
              <span className="font-semibold">Subject:</span> {subject}
            </p>
          </CardContent>
        </Card>

        {/* Line items — same columns as PDF */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b-2 border-primary/30 bg-muted/40">
                    <th className="text-center py-2 px-2 font-medium w-10">SN</th>
                    <th className="text-left py-2 px-2 font-medium min-w-[200px]">Description of Goods</th>
                    <th className="text-right py-2 px-2 font-medium w-16">Wt (KG)</th>
                    <th className="text-right py-2 px-2 font-medium w-14">CBM</th>
                    <th className="text-right py-2 px-2 font-medium w-20">Qty</th>
                    <th className="text-right py-2 px-2 font-medium w-24">Rate (AED)</th>
                    <th className="text-right py-2 px-2 font-medium w-28">Taxable Amount</th>
                    <th className="text-right py-2 px-2 font-medium w-28">VAT ({vatPct}%) Amount</th>
                    <th className="text-right py-2 px-2 font-medium w-28">Amount (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {q.items?.map((item, i) => (
                    <tr key={item._id || i} className="border-b border-border/60 align-top">
                      <td className="py-2.5 px-2 text-center text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-medium">{item.equipmentType}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        )}
                        {item.specifications && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.specifications}</p>
                        )}
                        {item.size && (
                          <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.weight || 0).toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.cbm || 0).toFixed(3)}
                      </td>
                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        {item.quantity} {item.unit || "Nos"}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.ratePerUnit || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.taxableAmount ?? item.subtotal ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.vatAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium tabular-nums">
                        {itemAmountWithVat(item, vatPct).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />
            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex gap-8 w-full max-w-sm justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{displaySubtotal.toFixed(2)}</span>
              </div>
              {q.deliveryCharges > 0 && (
                <div className="flex gap-8 w-full max-w-sm justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="tabular-nums">{Number(q.deliveryCharges).toFixed(2)}</span>
                </div>
              )}
              {q.installationCharges > 0 && (
                <div className="flex gap-8 w-full max-w-sm justify-between">
                  <span className="text-muted-foreground">Installation</span>
                  <span className="tabular-nums">{Number(q.installationCharges).toFixed(2)}</span>
                </div>
              )}
              {q.pickupCharges > 0 && (
                <div className="flex gap-8 w-full max-w-sm justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="tabular-nums">{Number(q.pickupCharges).toFixed(2)}</span>
                </div>
              )}
              {q.discount > 0 && (
                <div className="flex gap-8 w-full max-w-sm justify-between text-emerald-600">
                  <span>
                    Discount
                    {q.discountType === "percentage" ? ` (${q.discount}%)` : ""}
                  </span>
                  <span className="tabular-nums">
                    -{" "}
                    {q.discountType === "percentage"
                      ? ((q.subtotal * q.discount) / 100).toFixed(2)
                      : Number(q.discount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex gap-8 w-full max-w-sm justify-between">
                <span className="text-muted-foreground">VAT ({vatPct}%)</span>
                <span className="tabular-nums">{Number(q.vatAmount || 0).toFixed(2)}</span>
              </div>
              <Separator className="w-full max-w-sm" />
              <div className="flex gap-8 w-full max-w-sm justify-between font-bold text-base">
                <span>Total ({q.currency || "AED"})</span>
                <span className="text-primary tabular-nums">
                  {Number(q.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {q.termsAndConditions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Terms &amp; Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{q.termsAndConditions}</p>
            </CardContent>
          </Card>
        )}

        {q.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{q.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRowAlways label="Bank details" value={bank.accountName} />
            <InfoRowAlways label="Bank name" value={bank.bankName} />
            <InfoRowAlways label="Account no" value={bank.accountNumber} />
            <InfoRowAlways label="IBAN" value={bank.iban} />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={showDelete}
        onOpenChange={(open) => {
          if (!open && !deleteMut.isPending) setShowDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {q.quoteNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <AsyncButton
                type="button"
                loading={deleteMut.isPending}
                idleLabel="Delete"
                pendingLabel="Deleting…"
                className="bg-destructive hover:bg-destructive/90 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  deleteMut.mutate();
                }}
              />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
