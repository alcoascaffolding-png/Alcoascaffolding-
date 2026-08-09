"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Download,
  Mail,
  MessageSquare,
  Copy,
} from "lucide-react";

/**
 * @param {object} props
 * @param {() => void} props.onView
 * @param {() => void} props.onEdit
 * @param {() => void} props.onDownloadPdf
 * @param {() => void} [props.onSendEmail]
 * @param {() => void} [props.onSendWhatsApp]
 * @param {() => void} [props.onCopyWhatsAppLink]
 * @param {() => void} [props.onDelete]
 */
export function DocumentRowActionMenu({
  onView,
  onEdit,
  onDownloadPdf,
  onSendEmail,
  onSendWhatsApp,
  onCopyWhatsAppLink,
  onDelete,
  showWhatsApp,
  busy,
  hasEmail,
  hasPhone,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={busy}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }}
        >
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        {onEdit ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        ) : null}
        {(onDownloadPdf || onSendEmail) && <DropdownMenuSeparator />}
        {onDownloadPdf ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf();
            }}
            disabled={busy}
          >
            <Download className="mr-2 h-4 w-4" /> {busy ? "Generating PDF…" : "Download PDF"}
          </DropdownMenuItem>
        ) : null}
        {onSendEmail ? (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSendEmail();
            }}
            disabled={busy || !hasEmail}
          >
            <Mail className="mr-2 h-4 w-4" /> {busy ? "Sending…" : "Send Email"}
          </DropdownMenuItem>
        ) : null}
        {showWhatsApp && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSendWhatsApp?.();
            }}
            disabled={busy || !hasPhone}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> {busy ? "Sending…" : "Send WhatsApp"}
          </DropdownMenuItem>
        )}
        {showWhatsApp && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onCopyWhatsAppLink?.();
            }}
            disabled={busy || !hasPhone}
          >
            <Copy className="mr-2 h-4 w-4" /> {busy ? "Preparing…" : "Copy WhatsApp link"}
          </DropdownMenuItem>
        )}
        {onDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={busy}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
