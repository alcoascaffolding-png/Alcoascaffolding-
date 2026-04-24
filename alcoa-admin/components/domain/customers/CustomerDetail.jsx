"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import {
  ArrowLeft, Pencil, Trash2, Building2, Mail, Phone, MapPin,
  Users, CreditCard, Calendar, MessageSquare,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

/** Digits only for wa.me (E.164 without +) */
function phoneToWhatsAppDigits(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "").replace(/^0+/, "");
}

function isSafePublicWebsite(url) {
  if (!url || typeof url !== "string") return false;
  const t = url.trim().toLowerCase();
  if (t.includes("localhost") || t.includes("127.0.0.1") || t.startsWith("file:")) return false;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    return u.hostname !== "localhost" && u.hostname !== "127.0.0.1";
  } catch {
    return false;
  }
}

function customerMailtoHref(c) {
  const to = c.primaryEmail || "";
  if (!to) return "#";
  const subject = encodeURIComponent(`Alcoa Scaffolding — ${c.companyName || "Customer"}`);
  const body = encodeURIComponent(
    `Dear ${c.companyName || "Customer"},\n\n\n\n—\nAlcoa Aluminium Scaffolding`
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}

function customerWhatsAppHref(c) {
  const raw = c.primaryWhatsApp || c.primaryPhone || "";
  const digits = phoneToWhatsAppDigits(raw);
  if (!digits) return "#";
  const name = c.companyName || "there";
  const text = encodeURIComponent(
    `Hello ${name}, this is Alcoa Aluminium Scaffolding. `
  );
  return `https://wa.me/${digits}?text=${text}`;
}

const STATUS_MAP = {
  active: "success", inactive: "secondary", blocked: "destructive", prospect: "warning",
};

export function CustomerDetail({ id }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ["customers", "detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${id}`);
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      return d.data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
      router.push("/customers");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const c = customer;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.companyName}</h1>
            <p className="text-sm text-muted-foreground">{c.businessType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_MAP[c.status] || "outline"} className="text-sm">
            {c.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push(`/customers/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({c.contactPersons?.length || 0})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses ({c.addresses?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">{formatCurrency(c.totalRevenue || 0)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold">{c.totalOrders || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer Since</p>
                  <p className="text-sm font-medium">{formatDate(c.customerSince)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {c.vatRegistrationNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT/TRN Number</span>
                    <span className="font-medium">{c.vatRegistrationNumber}</span>
                  </div>
                )}
                {c.tradeLicenseNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trade License</span>
                    <span className="font-medium">{c.tradeLicenseNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Type</span>
                  <span className="font-medium capitalize">{c.customerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Terms</span>
                  <span className="font-medium">{c.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Limit</span>
                  <span className="font-medium">{formatCurrency(c.creditLimit || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium">{c.source}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Contact Information</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {c.primaryEmail && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={customerMailtoHref(c)}>
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Email
                      </a>
                    </Button>
                  )}
                  {(c.primaryWhatsApp || c.primaryPhone) && phoneToWhatsAppDigits(c.primaryWhatsApp || c.primaryPhone) && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={customerWhatsAppHref(c)} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {c.primaryEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${c.primaryEmail}`} className="text-primary hover:underline">{c.primaryEmail}</a>
                  </div>
                )}
                {c.primaryPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${c.primaryPhone}`}>{c.primaryPhone}</a>
                  </div>
                )}
                {c.website && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {isSafePublicWebsite(c.website) ? (
                      <a
                        href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {c.website}
                      </a>
                    ) : (
                      <span className="text-muted-foreground break-all" title="Not shown as a link (internal or invalid URL)">
                        {c.website}
                      </span>
                    )}
                  </div>
                )}
                {c.notes && (
                  <>
                    <Separator />
                    <p className="text-muted-foreground text-xs">{c.notes}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="space-y-3">
            {c.contactPersons?.length ? c.contactPersons.map((cp) => (
              <Card key={cp._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{cp.name} {cp.isPrimary && <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>}</p>
                      <p className="text-sm text-muted-foreground">{cp.designation}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground items-center">
                    {cp.email && <a href={`mailto:${cp.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3.5 w-3.5" />{cp.email}</a>}
                    {cp.phone && <a href={`tel:${cp.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3.5 w-3.5" />{cp.phone}</a>}
                    {cp.phone && phoneToWhatsAppDigits(cp.phone) && (
                      <a
                        href={`https://wa.me/${phoneToWhatsAppDigits(cp.phone)}?text=${encodeURIComponent(`Hello ${cp.name}, `)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground text-sm py-4">No contact persons added yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="space-y-3">
            {c.addresses?.length ? c.addresses.map((addr) => (
              <Card key={addr._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium capitalize">{addr.type} address {addr.isPrimary && <Badge variant="outline" className="ml-1 text-xs">Primary</Badge>}</p>
                      <p className="text-sm text-muted-foreground">
                        {[addr.addressLine1, addr.addressLine2, addr.area, addr.city, addr.emirate, addr.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : <p className="text-muted-foreground text-sm py-4">No addresses added yet.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {c.companyName}?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the customer and all related data. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate()} className="bg-destructive hover:bg-destructive/90 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
