/**
 * Browser-side helpers for PDF download and outbound email/WhatsApp API calls.
 * Keeps fetch/response handling out of UI components.
 */

export async function fetchDocumentPdfBlob(apiBase, id) {
  const res = await fetch(`${apiBase}/${id}/pdf`);
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || `HTTP ${res.status}`);
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