"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { mapDeliveryNoteItemsForDisplay } from "@/lib/map-delivery-note-for-pdf";
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { DetailRecordSkeleton } from "@/components/loading/skeleton-kit";
import { DocumentDetailToolbar } from "@/components/domain/documents/DocumentDetailToolbar";
import { useDocumentDetailOutbound } from "@/hooks/use-document-detail-outbound";
import { DeliveryNoteStatusChanger } from "@/components/domain/delivery/DeliveryNoteStatusChanger";

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

export function DeliveryNoteDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: note, isLoading, error } = useQuery({
    queryKey: ["delivery-notes", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/delivery-notes/${id}`);
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
    apiBase: "/api/delivery-notes",
    listQueryKey: ["delivery-notes"],
    detailQueryKey: ["delivery-notes", "detail", id],
    document: note,
    numberField: "deliveryNoteNumber",
    statsQueryKey: ["delivery-notes-stats"],
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/delivery-notes/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery-notes"] });
      qc.invalidateQueries({ queryKey: ["delivery-notes-stats"] });
      toast.success("Delivery note deleted");
      router.push("/delivery-notes");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <DetailRecordSkeleton />;
  if (error) return <div className="text-destructive py-12 text-center">{error.message}</div>;

  const n = note;
  const displayItems = mapDeliveryNoteItemsForDisplay(n);
  const salesOrder = n.salesOrder && typeof n.salesOrder === "object" ? n.salesOrder : null;
  const subject = `Delivery Note ${n.deliveryNoteNumber}`;
  const customerEmail = resolveDocumentCustomerEmail(n);
  const customerPhone = resolveDocumentCustomerPhone(n) || n.contactPersonPhone;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/delivery-notes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight font-mono">{n.deliveryNoteNumber}</h1>
            <p className="text-sm text-muted-foreground">{n.customerName}</p>
          </div>
          <DeliveryNoteStatusChanger
            id={id}
            value={n.status}
            detailQueryKey={["delivery-notes", "detail", id]}
          />
        </div>
        <DocumentDetailToolbar
          sending={sending}
          showWhatsApp={showWhatsApp}
          hasEmail={!!customerEmail}
          hasPhone={!!customerPhone}
          onDownloadPdf={downloadPdf}
          onSendEmail={sendEmail}
          onSendWhatsApp={sendWhatsApp}
          onCopyWhatsAppLink={copyWhatsAppLink}
          onEdit={() => router.push(`/delivery-notes/${id}/edit`)}
          onDelete={() => setShowDelete(true)}
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Customer & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="Customer Name" value={n.customerName} />
              <InfoRowAlways label="Delivery Address" value={n.deliveryAddress || n.customerAddress} />
              <InfoRowAlways label="Mobile No" value={n.customerPhone} />
              <InfoRow label="Email" value={n.customerEmail} />
              <InfoRow label="Contact Person" value={n.contactPersonName} />
              <InfoRow label="Contact Phone" value={n.contactPersonPhone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Delivery Note</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InfoRowAlways label="DN No" value={n.deliveryNoteNumber} />
              <InfoRowAlways label="Date" value={formatDate(n.createdAt)} />
              <InfoRowAlways label="Delivery Date" value={formatDate(n.deliveryDate)} />
              <InfoRowAlways
                label="Status"
                value={String(n.status || "").replace(/_/g, " ")}
              />
              <InfoRow label="Driver" value={n.driverName} />
              <InfoRow label="Vehicle" value={n.vehicleNumber} />
              {salesOrder && (
                <div className="pt-3 border-t border-border/60 mt-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
                    Linked sales order
                  </p>
                  <span className="font-mono text-sm font-medium">{salesOrder.orderNumber}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 block"
                    onClick={() => router.push(`/sales-orders/${String(salesOrder._id)}`)}
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
            <CardTitle className="text-base">Items to Deliver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-primary/30 bg-muted/40">
                    <th className="text-center py-2 px-2 font-medium w-10">SN</th>
                    <th className="text-left py-2 px-2 font-medium min-w-[200px]">Description</th>
                    <th className="text-right py-2 px-2 font-medium w-16">Wt (KG)</th>
                    <th className="text-right py-2 px-2 font-medium w-14">CBM</th>
                    <th className="text-right py-2 px-2 font-medium w-20">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map((item, i) => (
                    <tr key={item._id || i} className="border-b border-border/60 align-top">
                      <td className="py-2.5 px-2 text-center text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-2">
                        <p className="font-medium">{item.equipmentType || item.description}</p>
                        {item.specifications && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.specifications}</p>
                        )}
                        {item.size && (
                          <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.weight || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {Number(item.cbm || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right whitespace-nowrap">
                        {item.quantity} {item.unit || "Nos"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {n.deliveryInstructions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{n.deliveryInstructions}</p>
            </CardContent>
          </Card>
        )}

        {n.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{n.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {n.deliveryNoteNumber}?</AlertDialogTitle>
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
