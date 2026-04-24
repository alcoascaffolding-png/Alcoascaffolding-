"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Mail, Phone, Building2, Clock, Trash2, Eye, RefreshCw } from "lucide-react";

const STATUS_COLORS = {
  new: "info",
  read: "secondary",
  in_progress: "warning",
  responded: "success",
  closed: "secondary",
};

const PRIORITY_COLORS = {
  low: "secondary",
  medium: "outline",
  high: "warning",
  urgent: "destructive",
};

async function fetchMessages(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/contact-messages?${qs}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function fetchStats() {
  const res = await fetch("/api/contact-messages/stats");
  const data = await res.json();
  return data.data;
}

async function updateMessage(id, updates) {
  const res = await fetch(`/api/contact-messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function deleteMessage(id) {
  const res = await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

export function ContactMessagesClient() {
  const qc = useQueryClient();
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const params = {};
  if (filterStatus !== "all") params.status = filterStatus;
  if (filterType !== "all") params.type = filterType;

  const { data, isLoading } = useQuery({
    queryKey: ["contact-messages", params],
    queryFn: () => fetchMessages(params),
    refetchInterval: 30 * 1000,
  });

  const { data: stats } = useQuery({ queryKey: ["contact-messages-stats"], queryFn: fetchStats });

  const updateMut = useMutation({
    mutationFn: ({ id, ...updates }) => updateMessage(id, updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contact-messages"] }); toast.success("Message updated"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contact-messages"] }); setDeleteId(null); toast.success("Message deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const columns = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.type === "quote" ? "default" : "secondary"}>
          {row.original.type}
        </Badge>
      ),
      size: 80,
    },
    {
      accessorKey: "name",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.company || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge variant={PRIORITY_COLORS[row.original.priority] || "outline"}>
          {row.original.priority}
        </Badge>
      ),
      size: 90,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_COLORS[row.original.status] || "secondary"}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
      size: 110,
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground" title={formatDate(row.original.createdAt)}>
          {formatRelativeTime(row.original.createdAt)}
        </span>
      ),
      size: 120,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedMsg(row.original); }}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(row.original._id); }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      size: 80,
    },
  ];

  const toolbar = (
    <div className="flex items-center gap-2">
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="contact">Contact</SelectItem>
          <SelectItem value="quote">Quote</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="read">Read</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="responded">Responded</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => qc.invalidateQueries({ queryKey: ["contact-messages"] })}>
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <>
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">New</p><p className="text-2xl font-bold text-primary">{stats.newMessages}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Contact</p><p className="text-2xl font-bold">{stats.contactCount}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Quote Requests</p><p className="text-2xl font-bold">{stats.quoteCount}</p></CardContent></Card>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        toolbar={toolbar}
        searchPlaceholder="Search messages…"
        onRowClick={setSelectedMsg}
        emptyMessage="No messages found."
      />

      {/* Message detail dialog */}
      {selectedMsg && (
        <Dialog open={!!selectedMsg} onOpenChange={() => setSelectedMsg(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Message from {selectedMsg.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${selectedMsg.email}`} className="text-primary hover:underline">{selectedMsg.email}</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${selectedMsg.phone}`} className="text-foreground">{selectedMsg.phone}</a>
                </div>
                {selectedMsg.company && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedMsg.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(selectedMsg.createdAt)}</span>
                </div>
              </div>

              {selectedMsg.message && (
                <div className="rounded-md border bg-muted/30 p-3 text-sm">{selectedMsg.message}</div>
              )}

              {selectedMsg.type === "quote" && (
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {selectedMsg.projectType && <div><span className="font-medium">Type:</span> {selectedMsg.projectType}</div>}
                  {selectedMsg.projectHeight && <div><span className="font-medium">Height:</span> {selectedMsg.projectHeight}</div>}
                  {selectedMsg.coverageArea && <div><span className="font-medium">Area:</span> {selectedMsg.coverageArea}</div>}
                  {selectedMsg.duration && <div><span className="font-medium">Duration:</span> {selectedMsg.duration}</div>}
                  {selectedMsg.startDate && <div><span className="font-medium">Start Date:</span> {selectedMsg.startDate}</div>}
                </div>
              )}

              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select
                  value={selectedMsg.status}
                  onValueChange={(v) => updateMut.mutate({ id: selectedMsg._id, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMsg(null)}>Close</Button>
              <Button asChild>
                <a href={`mailto:${selectedMsg.email}?subject=Re: Your Inquiry`} target="_blank" rel="noreferrer">
                  <Mail className="h-4 w-4 mr-1" /> Reply
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMut.mutate(deleteId)} className="bg-destructive hover:bg-destructive/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
