/**
 * Browser-side helpers for PDF download and outbound email/WhatsApp API calls.
 * Keeps fetch/response handling out of UI components.
 */

export async function fetchDocumentPdfBlob(apiBase, id) {
  const res = await fetch(`${apiBase}/${id}/pdf`);
  const contentType = res.headers.get("content-type") || "";

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
}

/** @param {Blob} blob */
export function saveBlobAsPdfDownload(blob, fileBaseName) {
  const name = String(fileBaseName || "document").replace(/\.pdf$/i, "");
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.pdf`;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function postDocumentSendEmail(apiBase, id) {
  const res = await fetch(`${apiBase}/${id}/send-email`, { method: "POST" });
  const d = await res.json();
  if (!d.success) throw new Error(d.error || "Email send failed");
  return d;
}

export async function postDocumentSendWhatsApp(apiBase, id, body = {}) {
  const res = await fetch(`${apiBase}/${id}/send-whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await res.json();
  if (!d.success) throw new Error(d.error || "WhatsApp send failed");
  return d;
}

/**
 * Prefer navigating a blank tab opened on user gesture (popup-friendly).
 * @returns {{ usedBlankTab: boolean }}
 */