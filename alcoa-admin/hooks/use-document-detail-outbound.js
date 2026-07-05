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
import {
  resolveDocumentCustomerEmail,
  resolveDocumentCustomerPhone,
} from "@/lib/resolve-document-customer";
import { useShowWhatsApp } from "@/hooks/use-show-whatsapp";
import { singleFlight } from "@/lib/single-flight";

const POPUP_HINT = "Pop-up blocked. Use Copy WhatsApp link button.";

/**
 * Detail page toolbar: PDF, email, WhatsApp (Twilio + wa.me), copy wa.me link.
 */
export function useDocumentDetailOutbound({
  id,
  apiBase,
  listQueryKey,
  detailQueryKey,
  document,
  numberField,
  statsQueryKey,
}) {
  const qc = useQueryClient();
  const showWhatsApp = useShowWhatsApp();
  const [sending, setSending] = useState(null);
  const [lastWaMeUrl, setLastWaMeUrl] = useState("");

  const bump = useCallback(() => {
    qc.invalidateQueries({ queryKey: listQueryKey });
    qc.invalidateQueries({ queryKey: detailQueryKey });
    if (statsQueryKey) qc.invalidateQueries({ queryKey: statsQueryKey });
  }, [qc, listQueryKey, detailQueryKey, statsQueryKey]);

  const docNo = document?.[numberField];

  const downloadPdf = useCallback(() => {
    if (!docNo) {
      toast.error("Document is still loading — try again in a moment.");
      return Promise.resolve();
    }

    const flightKey = `action:pdf:${apiBase}:${id}`;

    return singleFlight(flightKey, async () => {
      setSending(`pdf:${id}`);
      const toastId = toast.loading("Generating PDF…");
      try {
        const blob = await fetchDocumentPdfBlob(apiBase, id);
        saveBlobAsPdfDownload(blob, docNo);
        toast.success("PDF downloaded", { id: toastId });
      } catch (e) {
        toast.error(`PDF failed: ${e?.message || "Unknown error"}`, { id: toastId });
        throw e;
      } finally {
        setSending(null);
      }
    });
  }, [apiBase, id, docNo]);

  const sendEmail = useCallback(() => {
    const flightKey = `action:email:${apiBase}:${id}`;

    return singleFlight(flightKey, async () => {
      setSending(`email:${id}`);
      const toastId = toast.loading("Sending email…");
      try {
        await postDocumentSendEmail(apiBase, id);
        bump();
        const to = resolveDocumentCustomerEmail(document);
        toast.success(to ? `Emailed to ${to}` : "Email sent", { id: toastId });
      } catch (e) {
        toast.error(`Failed: ${e?.message || "Unknown error"}`, { id: toastId });
        throw e;
      } finally {
        setSending(null);
      }
    });
  }, [apiBase, id, document, bump]);

  const sendWhatsApp = useCallback(() => {
    const flightKey = `action:whatsapp:${apiBase}:${id}`;

    return singleFlight(flightKey, async () => {
      setSending(`whatsapp:${id}`);
      let waTab = null;
      try {
        waTab = window.open("about:blank", "_blank", "noopener,noreferrer");
        const d = await postDocumentSendWhatsApp(apiBase, id, {});
        if (d.data?.mode === "wa_me" && d.data?.waMeUrl) {
          setLastWaMeUrl(d.data.waMeUrl);
          const url = d.data.waMeUrl;
          if (waTab && !waTab.closed) {
            waTab.location.href = url;
            toast.success("WhatsApp opened in a new tab — review the message and tap Send");
          } else {
            const opened = window.open(url, "_blank", "noopener,noreferrer");
            if (opened) {
              toast.success("WhatsApp opened in a new tab — review the message and tap Send");
            } else {
              toast.info(POPUP_HINT, { duration: 8000 });
            }
          }
        } else {
          if (waTab && !waTab.closed) waTab.close();
          const phone = resolveDocumentCustomerPhone(document);
          toast.success(phone ? `WhatsApp sent to ${phone}` : "WhatsApp message sent");
        }
        bump();
      } catch (e) {
        if (waTab && !waTab.closed) waTab.close();
        toast.error("Failed: " + String(e?.message || ""));
        throw e;
      } finally {
        setSending(null);
      }
    });
  }, [apiBase, id, document, bump]);

  const copyWhatsAppLink = useCallback(() => {
    const flightKey = `action:whatsapp-copy:${apiBase}:${id}`;

    return singleFlight(flightKey, async () => {
      setSending(`whatsapp:${id}`);
      try {
        let link = lastWaMeUrl;
        if (!link) {
          const d = await postDocumentSendWhatsApp(apiBase, id, {});
          if (d.data?.mode !== "wa_me" || !d.data?.waMeUrl) {
            throw new Error("Copy link is available only in wa.me mode.");
          }
          link = d.data.waMeUrl;
          setLastWaMeUrl(link);
          bump();
        }
        await navigator.clipboard.writeText(link);
        toast.success("WhatsApp link copied");
      } catch (e) {
        const msg = String(e?.message || "");
        toast.error(msg || "Could not copy link");
        if (lastWaMeUrl) toast.info(lastWaMeUrl, { duration: 12000 });
        throw e;
      } finally {
        setSending(null);
      }
    });
  }, [apiBase, id, lastWaMeUrl, bump]);

  return {
    showWhatsApp,
    sending,
    lastWaMeUrl,
    downloadPdf,
    sendEmail,
    sendWhatsApp,
    copyWhatsAppLink,
  };
}
