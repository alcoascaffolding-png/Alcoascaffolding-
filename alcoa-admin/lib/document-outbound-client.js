/**
 * Browser-side helpers for PDF download and outbound email/WhatsApp API calls.
 * Concurrent identical requests are deduplicated (double-click safe).
 */

import { singleFlight } from "@/lib/single-flight";

export function fetchDocumentPdfBlob(apiBase, id) {
  const key = `pdf:${apiBase}:${id}`;
  return singleFlight(key, async () => {
    const res = await fetch(`${apiBase}/${id}/pdf`, {
      credentials: "same-origin",
      headers: { Accept: "application/pdf" },
    });
    const contentType = res.headers.get("content-type") || "";

    // Auth middleware answers with the login HTML instead of a 401.
    if (res.redirected && /\/login/.test(res.url)) {
      throw new Error("Your session expired. Sign in again and retry the download.");
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      if (contentType.includes("application/json")) {
        const d = await res.json().catch(() => ({}));
        message =
          typeof d.error === "string"
            ? d.error
            : d.error?.message || message;
        if (Array.isArray(d.details) && d.details.length) {
          message += `: ${d.details.join("; ")}`;
        }
      } else {
        const text = await res.text().catch(() => "");
        if (text) message = text.slice(0, 240);
      }
      throw new Error(message);
    }

    if (!contentType.includes("application/pdf")) {
      throw new Error("Server did not return a PDF. Try again or contact support.");
    }

    return res.blob();
  });
}

/** @param {Blob} blob */
export function saveBlobAsPdfDownload(blob, fileBaseName) {
  const name = String(fileBaseName || "document").replace(/\.pdf$/i, "");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.pdf`;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Revoking in the same tick cancels the download in Chrome/Firefox.
  window.setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 10000);
}

export function postDocumentSendEmail(apiBase, id) {
  const key = `email:${apiBase}:${id}`;
  return singleFlight(key, async () => {
    const res = await fetch(`${apiBase}/${id}/send-email`, { method: "POST" });
    const d = await res.json();
    if (!d.success) throw new Error(d.error || "Email send failed");
    return d;
  });
}

export function postDocumentSendWhatsApp(apiBase, id, body = {}) {
  const key = `whatsapp:${apiBase}:${id}`;
  return singleFlight(key, async () => {
    const res = await fetch(`${apiBase}/${id}/send-whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!d.success) throw new Error(d.error || "WhatsApp send failed");
    return d;
  });
}
