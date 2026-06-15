"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  QUOTATION_PDF_BANK_DETAILS,
  itemAmountWithVat,
} from "@/lib/quotation-display";
import {
  mapSalesInvoiceItemsForDisplay,
  formatCustomerAddressFromRecord,
} from "@/lib/map-sales-order-for-quotation-pdf";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { DocumentDetailToolbar } from "@/components/domain/documents/DocumentDetailToolbar";
import { useDocumentDetailOutbound } from "@/hooks/use-document-detail-outbound";
import { InvoicePaymentStatusChanger } from "@/components/domain/sales/InvoicePaymentStatusChanger";

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

export function SalesInvoiceDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ["sales-invoices", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-invoices/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const salesOrderId =
    invoice?.salesOrder && typeof invoice.salesOrder === "object" && invoice.salesOrder._id != null
      ? String(invoice.salesOrder._id)
      : invoice?.salesOrder != null
        ? String(invoice.salesOrder)
        : null;

  const { data: linkedDeliveryNotes } = useQuery({
    queryKey: ["sales-orders", "delivery-notes", salesOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${salesOrderId}/delivery-notes`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!salesOrderId,
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
    apiBase: "/api/sales-invoices",
    listQueryKey: ["sales-invoices"],
    detailQueryKey: ["sales-invoices", "detail", id],
    document: invoice,
    numberField: "invoiceNumber",
    statsQueryKey: ["sales-invoices-stats"],
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sales-invoices/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-invoices"] });
      qc.invalidateQueries({ queryKey: ["sales-invoices-stats"] });
      toast.success("Tax invoice deleted");
      router.push("/sales-invoices");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const inv = invoice;
  const subtotal = Number(inv.subtotal || 0);
  const vatAmount = Number(inv.vatAmount || 0);
  const vatPct = subtotal > 0 ? Math.round((vatAmount / subtotal) * 10000) / 100 : 5;
  const displayItems = mapSalesInvoiceItemsForDisplay(inv);
  const bank = QUOTATION_PDF_BANK_DETAILS;
  const subject = `Tax Invoice ${inv.invoiceNumber}`;
  const customer = inv.customer && typeof inv.customer === "object" ? inv.customer : null;
  const customerAddress = inv.customerAddress || formatCustomerAddressFromRecord(customer);
  const customerTRN = inv.customerTRN || customer?.vatRegistrationNumber;
  const paid = Number(inv.paidAmount || 0);
  const balance =
    inv.balance != null ? Number(inv.balance) : Math.max(0, Number(inv.total || 0) - paid);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales-invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{inv.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">{inv.customerName}</p>
          </div>
          <InvoicePaymentStatusChanger
            id={id}
            value={inv.paymentStatus}
            detailQueryKey={["sales-invoices", "detail", id]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {salesOrderId ? (
            <Link href={`/delivery-notes/new?salesOrder=${salesOrderId}`}>
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-1" />
                Create Delivery Note
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Link a sales order to create a delivery note"
            >
              <Truck className="h-4 w-4 mr-1" />
              Create Delivery Note
            </Button>
          )}
          <DocumentDetailToolbar
            sending={sending}
            showWhatsApp={showWhatsApp}
            hasEmail={!!inv.customerEmail}
            hasPhone={!!inv.customerPhone}
            onDownloadPdf={downloadPdf}
            onSendEmail={sendEmail}
            onSendWhatsApp={sendWhatsApp}
            onCopyWhatsAppLink={copyWhatsAppLink}
            onEdit={() => router.push(`/sales-invoices/${id}/edit`)}
            onDelete={() => setShowDelete(true)}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Customer Name" value={inv.customerName} />
              <InfoRowAlways label="Address" value={customerAddress} />
              <InfoRowAlways label="TRN" value={customerTRN} />
              <InfoRowAlways label="Mobile No" value={inv.customerPhone} />
              <InfoRow label="Email" value={inv.customerEmail} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tax Invoice</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Invoice No" value={inv.invoiceNumber} />
              <InfoRowAlways label="Invoice Date" value={formatDate(inv.invoiceDate)} />
              <InfoRowAlways label="Due Date" value={formatDate(inv.dueDate)} />
              <InfoRowAlways
                label="Payment Status"
                value={String(inv.paymentStatus || "").replace(/_/g, " ")}
              />
              <InfoRowAlways label="Paid" value={paid.toFixed(2)} />
              <InfoRowAlways label="Balance" value={balance.toFixed(2)} valueClassName="font-medium" />
              {inv.salesOrder && (
                <div className="pt-3 border-t border-border/60 mt-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
                    Linked sales order
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {typeof inv.salesOrder === "object" ? inv.salesOrder.orderNumber : "—"}
                    </span>
                    {typeof inv.salesOrder === "object" && inv.salesOrder.status != null && (
                      <Badge variant="secondary" className="text-xs font-normal capitalize">
                        {String(inv.salesOrder.status).replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const sid =
                        typeof inv.salesOrder === "object" && inv.salesOrder._id != null
                          ? String(inv.salesOrder._id)
                          : String(inv.salesOrder);
                      router.push(`/sales-orders/${sid}`);
                    }}
                  >
                    View sales order
                  </Button>
                </div>
              )}
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
                  {displayItems.map((item, i) => (
                    <tr key={item._id || i} className="border-b border-border/60 align-top">
                      <td className="py-2.5 px-2 text-center text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-medium">{item.equipmentType}</p>
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-muted-foreground">—</td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-muted-foreground">—</td>
                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        {item.quantity} {item.unit || "Nos"}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.ratePerUnit || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.taxableAmount || 0).toFixed(2)}
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
                <span className="tabular-nums">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-8 w-full max-w-sm justify-between">
                <span className="text-muted-foreground">VAT ({vatPct}%)</span>
                <span className="tabular-nums">{vatAmount.toFixed(2)}</span>
              </div>
              <Separator className="w-full max-w-sm" />
              <div className="flex gap-8 w-full max-w-sm justify-between font-bold text-base">
                <span>Total ({inv.currency || "AED"})</span>
                <span className="text-primary tabular-nums">
                  {Number(inv.total || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-8 w-full max-w-sm justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="tabular-nums">{paid.toFixed(2)}</span>
              </div>
              <div className="flex gap-8 w-full max-w-sm justify-between font-medium text-destructive">
                <span>Balance</span>
                <span className="tabular-nums">{balance.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {inv.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{inv.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Linked Delivery Notes</CardTitle>
            {salesOrderId ? (
              <Link href={`/delivery-notes/new?salesOrder=${salesOrderId}`}>
                <Button variant="outline" size="sm">
                  <Truck className="h-4 w-4 mr-1" />
                  New
                </Button>
              </Link>
            ) : null}
          </CardHeader>
          <CardContent>
            {!salesOrderId ? (
              <p className="text-sm text-muted-foreground">
                Link a sales order to this invoice to create and view delivery notes.
              </p>
            ) : linkedDeliveryNotes?.items?.length ? (
              <ul className="space-y-2">
                {linkedDeliveryNotes.items.map((dn) => (
                  <li
                    key={dn._id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border/60 last:border-0"
                  >
                    <button
                      type="button"
                      className="font-mono text-sm font-medium hover:underline text-left"
                      onClick={() => router.push(`/delivery-notes/${String(dn._id)}`)}
                    >
                      {dn.deliveryNoteNumber}
                    </button>
                    <span className="text-sm text-muted-foreground capitalize">
                      {String(dn.status || "").replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {dn.deliveryDate ? formatDate(dn.deliveryDate) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No delivery notes linked yet. Create one when goods are ready to dispatch.
              </p>
            )}
          </CardContent>
        </Card>

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

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {inv.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMut.mutate()}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
