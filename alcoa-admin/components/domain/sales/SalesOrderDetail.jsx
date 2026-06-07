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
  mapSalesOrderItemsForDisplay,
  formatCustomerAddressFromRecord,
} from "@/lib/map-sales-order-for-quotation-pdf";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { DocumentDetailToolbar } from "@/components/domain/documents/DocumentDetailToolbar";
import { useDocumentDetailOutbound } from "@/hooks/use-document-detail-outbound";
import { SalesOrderStatusChanger } from "@/components/domain/sales/SalesOrderStatusChanger";

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

export function SalesOrderDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["sales-orders", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const { data: linkedDeliveryNotes } = useQuery({
    queryKey: ["sales-orders", "delivery-notes", id],
    queryFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}/delivery-notes`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
    enabled: !!id,
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
    apiBase: "/api/sales-orders",
    listQueryKey: ["sales-orders"],
    detailQueryKey: ["sales-orders", "detail", id],
    document: order,
    numberField: "orderNumber",
    statsQueryKey: ["sales-orders-stats"],
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sales-orders/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales-orders"] });
      qc.invalidateQueries({ queryKey: ["sales-orders-stats"] });
      toast.success("Sales order deleted");
      router.push("/sales-orders");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const o = order;
  const subtotal = Number(o.subtotal || 0);
  const vatAmount = Number(o.vatAmount || 0);
  const vatPct = subtotal > 0 ? Math.round((vatAmount / subtotal) * 10000) / 100 : 5;
  const displayItems = mapSalesOrderItemsForDisplay(o);
  const bank = QUOTATION_PDF_BANK_DETAILS;
  const subject = `Sales Order ${o.orderNumber}`;
  const customer = o.customer && typeof o.customer === "object" ? o.customer : null;
  const customerAddress = o.customerAddress || formatCustomerAddressFromRecord(customer);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/sales-orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{o.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">{o.customerName}</p>
          </div>
          <SalesOrderStatusChanger
            id={id}
            value={o.status}
            detailQueryKey={["sales-orders", "detail", id]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/delivery-notes/new?salesOrder=${id}`}>
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-1" />
              Create Delivery Note
            </Button>
          </Link>
          <DocumentDetailToolbar
            sending={sending}
            showWhatsApp={showWhatsApp}
            hasEmail={!!o.customerEmail}
            hasPhone={!!o.customerPhone}
            onDownloadPdf={downloadPdf}
            onSendEmail={sendEmail}
            onSendWhatsApp={sendWhatsApp}
            onCopyWhatsAppLink={copyWhatsAppLink}
            onEdit={() => router.push(`/sales-orders/${id}/edit`)}
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
              <InfoRowAlways label="Customer Name" value={o.customerName} />
              <InfoRowAlways label="Address" value={customerAddress} />
              <InfoRowAlways label="Mobile No" value={o.customerPhone} />
              <InfoRow label="Email" value={o.customerEmail} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales Order</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Order No" value={o.orderNumber} />
              <InfoRowAlways label="Order Date" value={formatDate(o.orderDate)} />
              <InfoRowAlways
                label="Status"
                value={String(o.status || "").replace(/_/g, " ")}
              />
              <InfoRowAlways label="Delivery Date" value={formatDate(o.deliveryDate)} />
              <InfoRowAlways label="Payment Terms" value="Cash/CDC" />
              {o.quotation && (
                <div className="pt-3 border-t border-border/60 mt-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
                    Linked quotation
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {typeof o.quotation === "object" ? o.quotation.quoteNumber : "—"}
                    </span>
                    {typeof o.quotation === "object" && o.quotation.status != null && (
                      <Badge variant="secondary" className="text-xs font-normal capitalize">
                        {String(o.quotation.status).replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const qid =
                        typeof o.quotation === "object" && o.quotation._id != null
                          ? String(o.quotation._id)
                          : String(o.quotation);
                      router.push(`/quotations/${qid}`);
                    }}
                  >
                    View quotation
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
                <span>Total ({o.currency || "AED"})</span>
                <span className="text-primary tabular-nums">
                  {Number(o.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {o.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{o.notes}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Linked Delivery Notes</CardTitle>
            <Link href={`/delivery-notes/new?salesOrder=${id}`}>
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {linkedDeliveryNotes?.items?.length ? (
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
            <AlertDialogTitle>Delete {o.orderNumber}?</AlertDialogTitle>
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
