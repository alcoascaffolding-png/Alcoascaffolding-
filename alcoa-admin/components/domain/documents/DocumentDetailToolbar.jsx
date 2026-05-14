"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail, MessageSquare, Copy, Pencil, Trash2 } from "lucide-react";
import { InlineSkeleton } from "@/components/loading/skeleton-kit";

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
      <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={sending === "pdf"}>
        {sending === "pdf" ? <InlineSkeleton className="mr-1" /> : <Download className="h-4 w-4 mr-1" />}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSendEmail}
        disabled={sending === "email" || !hasEmail}
      >
        {sending === "email" ? <InlineSkeleton className="mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
        Email
      </Button>
      {showWhatsApp && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSendWhatsApp}
          disabled={sending === "whatsapp" || !hasPhone}
        >
          {sending === "whatsapp" ? (
            <InlineSkeleton className="mr-1" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-1" />
          )}
          WhatsApp
        </Button>
      )}
      {showWhatsApp && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCopyWhatsAppLink}
          disabled={sending === "whatsapp" || !hasPhone}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy WhatsApp link
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>
      <Button
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
