"use client";

import { AsyncButton } from "@/components/ui/async-button";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageSquare, Copy, Pencil, Trash2 } from "lucide-react";

/**
 * Detail page actions: PDF, email, WhatsApp, copy link, edit, delete.
 * Only the active outbound action shows a loading spinner.
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
  const busy = !!sending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AsyncButton
        type="button"
        variant="outline"
        size="sm"
        loading={typeof sending === "string" && sending.startsWith("pdf:")}
        disabled={busy}
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
        loading={typeof sending === "string" && sending.startsWith("email:")}
        idleLabel="Email"
        pendingLabel="Sending…"
        disabled={!hasEmail || busy}
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
          loading={
            typeof sending === "string" &&
            sending.startsWith("whatsapp:") &&
            !sending.startsWith("whatsapp-copy:")
          }
          idleLabel="WhatsApp"
          pendingLabel="Opening…"
          disabled={!hasPhone || busy}
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
          loading={typeof sending === "string" && sending.startsWith("whatsapp-copy:")}
          idleLabel="Copy WhatsApp link"
          pendingLabel="Copying…"
          disabled={!hasPhone || busy}
          onClick={onCopyWhatsAppLink}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy WhatsApp link
        </AsyncButton>
      )}
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>
      {onDelete ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive border-destructive"
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
