"use client";

import { AsyncButton } from "@/components/ui/async-button";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageSquare, Copy, Pencil, Trash2 } from "lucide-react";

/**
 * Detail page actions: PDF, email, WhatsApp, copy link, edit, delete.
 */
export function DocumentDetailToolbar({
  sending,
  showWhatsApp,
  hasEmail,
  hasPhone,
  onDownloadPdf,
  onSendEmail,
  onSendWhatsApp,
  onCopyWhatsAppLink,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AsyncButton
        type="button"
        variant="outline"
        size="sm"
        loading={sending === "pdf"}
        idleLabel="PDF"
        pendingLabel="Generating…"
        onClick={onDownloadPdf}
      >
        <Download className="h-4 w-4 mr-1" />
        PDF
      </AsyncButton>
      <AsyncButton
        type="button"
        variant="outline"
        size="sm"
        loading={sending === "email"}
        idleLabel="Email"
        pendingLabel="Sending…"
        disabled={!hasEmail}
        onClick={onSendEmail}
      >
        <Mail className="h-4 w-4 mr-1" />
        Email
      </AsyncButton>
      {showWhatsApp && (
        <AsyncButton
          type="button"
          variant="outline"
          size="sm"
          loading={sending === "whatsapp"}
          idleLabel="WhatsApp"
          pendingLabel="Opening…"
          disabled={!hasPhone}
          onClick={onSendWhatsApp}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          WhatsApp
        </AsyncButton>
      )}
      {showWhatsApp && (
        <AsyncButton
          type="button"
          variant="outline"
          size="sm"
          loading={sending === "whatsapp"}
          idleLabel="Copy WhatsApp link"
          pendingLabel="Copying…"
          disabled={!hasPhone}
          onClick={onCopyWhatsAppLink}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy WhatsApp link
        </AsyncButton>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive border-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
