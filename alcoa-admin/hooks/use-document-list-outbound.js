"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchDocumentPdfBlob,
  saveBlobAsPdfDownload,
  postDocumentSendEmail,
  postDocumentSendWhatsApp,
} from "@/lib/document-outbound-client";
import { useShowWhatsApp } from "@/hooks/use-show-whatsapp";

const POPUP_HINT = "Pop-up blocked. Use Copy WhatsApp link.";

/**
 * Row-level PDF / email / WhatsApp for list pages (quotations, sales orders, invoices).
 *
 * @param {object} opts
 * @param {string} opts.apiBase - e.g. `/api/quotations`
 * @param {import("@tanstack/react-query").QueryKey} opts.listQueryKey - e.g. `["sales-orders"]`
 * @param {import("@tanstack/react-query").QueryKey} [opts.statsQueryKey] - e.g. `["sales-orders-stats"]`
 */
export function useDocumentListOutbound({ apiBase, listQueryKey, statsQueryKey }) {
  const qc = useQueryClient();
  const showWhatsApp = useShowWhatsApp();
  const [sendingId, setSendingId] = useState(null);

  const bump = useCallback(() => {
    qc.invalidateQueries({ queryKey: listQueryKey });
    if (statsQueryKey) qc.invalidateQueries({ queryKey: statsQueryKey });
  }, [qc, listQueryKey, statsQueryKey]);

  const downloadPdf = useCallback(
    async (id, fileBaseName) => {
      const sid = String(id);
      toast.info("Generating PDF…");
      try {
        const blob = await fetchDocumentPdfBlob(apiBase, sid);
        saveBlobAsPdfDownload(blob, fileBaseName);
        toast.success("PDF downloaded");
      } catch (e) {
        toast.error("Failed to generate PDF: " + e.message);
      }
    },
    [apiBase]
  );

  const sendEmail = useCallback(
    async (id) => {
      const sid = String(id);
      setSendingId(sid);
      try {
        await postDocumentSendEmail(apiBase, sid);
        toast.success("Email sent");
        bump();
      } catch (e) {
        toast.error("Failed to send email: " + e.message);
      } finally {
        setSendingId(null);
      }
    },
    [apiBase, bump]
  );

  const sendWhatsApp = useCallback(
    async (id) => {
      const sid = String(id);
      setSendingId(sid);
      let waTab = null;
      try {
        waTab = window.open("about:blank", "_blank", "noopener,noreferrer");
        const d = await postDocumentSendWhatsApp(apiBase, sid, {});
        if (d.data?.mode === "wa_me" && d.data?.waMeUrl) {
          const url = d.data.waMeUrl;
          if (waTab && !waTab.closed) {
            waTab.location.href = url;
            toast.success("WhatsApp opened in a new tab — review message and tap Send");
          } else {
            const opened = window.open(url, "_blank", "noopener,noreferrer");
            if (opened) {
              toast.success("WhatsApp opened in a new tab — review message and tap Send");
            } else {
              toast.info(POPUP_HINT, { duration: 8000 });
            }
          }
        } else {
          if (waTab && !waTab.closed) waTab.close();
          toast.success("WhatsApp message sent");
        }
        bump();
      } catch (e) {
        if (waTab && !waTab.closed) waTab.close();
        toast.error("Failed to send WhatsApp: " + String(e?.message || ""));
      } finally {
        setSendingId(null);
      }
    },
    [apiBase, bump]
  );

  const copyWhatsAppLink = useCallback(
    async (id) => {
      const sid = String(id);
      setSendingId(sid);
      try {
        const d = await postDocumentSendWhatsApp(apiBase, sid, {});
        if (d.data?.mode !== "wa_me" || !d.data?.waMeUrl) {
          throw new Error("Copy link is available only in wa.me mode.");
        }
        await navigator.clipboard.writeText(d.data.waMeUrl);
        toast.success("WhatsApp link copied");
        bump();
      } catch (e) {
        toast.error("Failed to copy WhatsApp link: " + (e?.message || "Unknown error"));
      } finally {
        setSendingId(null);
      }
    },
    [apiBase, bump]
  );

  return {
    showWhatsApp,
    sendingId,
    downloadPdf,
    sendEmail,
    sendWhatsApp,
    copyWhatsAppLink,
  };
}
