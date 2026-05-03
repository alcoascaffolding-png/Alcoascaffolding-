import { put, del, list } from "@vercel/blob";

/** Vercel Blob server read-write tokens always use this prefix (not read-only client tokens). */
const BLOB_RW_PREFIX = "vercel_blob_rw_";

/**
 * Normalize token strings from Vercel UI, Slack, Excel, or .env paste (quotes, BOM, line breaks).
 */
function normalizeBlobTokenValue(raw) {
  if (raw == null || typeof raw !== "string") return "";
  let t = raw.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  if (t.charCodeAt(0) === 0xfeff) {
    t = t.slice(1).trim();
  }
  // Zero-width / line breaks break Authorization and store-id parsing
  t = t.replace(/\u200b|\u200c|\u200d|\ufeff/g, "").replace(/\r\n?|\n/g, "").trim();
  return t;
}

/**
 * Read-write token from env. Prefer BLOB_READ_WRITE_TOKEN; also VERCEL_BLOB_READ_WRITE_TOKEN
 * if the store was created with a custom env name in Advanced Options.
 */
function getBlobReadWriteToken() {
  const keys = ["BLOB_READ_WRITE_TOKEN", "VERCEL_BLOB_READ_WRITE_TOKEN"];
  for (const key of keys) {
    const t = normalizeBlobTokenValue(process.env[key] || "");
    if (t.startsWith(BLOB_RW_PREFIX)) return t;
  }
  return null;
}

/**
 * True when a server read-write token is present (starts with vercel_blob_rw_).
 */
export function isBlobReadWriteTokenConfigured() {
  return !!getBlobReadWriteToken();
}

/**
 * Upload a buffer (e.g. PDF) to Vercel Blob
 * @param {Buffer} buffer - File content
 * @param {string} filename - e.g. "QT-2026-0001.pdf"
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadToBlob(buffer, filename, contentType = "application/pdf") {
  const token = getBlobReadWriteToken();
  if (!token) {
    const hasAny = ["BLOB_READ_WRITE_TOKEN", "VERCEL_BLOB_READ_WRITE_TOKEN"].some(
      (k) => normalizeBlobTokenValue(process.env[k] || "")
    );
    if (hasAny) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN must be a read-write server token (starts with vercel_blob_rw_). Read-only or client tokens will not work for uploads. Copy the value from Vercel → Storage → your Blob store → .env.local tab."
      );
    }
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  try {
    const blob = await put(`quotation-pdfs/${filename}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });

    return { url: blob.url, pathname: blob.pathname };
  } catch (err) {
    const msg = err?.message || String(err);
    console.error("[Blob] put failed:", msg);
    throw err;
  }
}

/**
 * Delete a file from Vercel Blob by URL
 */
export async function deleteFromBlob(url) {
  try {
    const token = getBlobReadWriteToken();
    if (token) {
      await del(url, { token });
    } else {
      await del(url);
    }
  } catch (err) {
    console.warn("[Blob] Delete error:", err.message);
  }
}

/**
 * List quotation PDFs
 */
export async function listPDFs(prefix = "quotation-pdfs/") {
  const token = getBlobReadWriteToken();
  if (!token) return [];
  const { blobs } = await list({ prefix, token });
  return blobs;
}
