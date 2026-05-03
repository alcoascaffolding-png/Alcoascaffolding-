import { put, del, list } from "@vercel/blob";

/**
 * Read-write token from env, normalized (common copy/paste issues from Vercel UI / .env).
 */
function getBlobReadWriteToken() {
  let raw = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
  if (!raw) return null;
  // Strip wrapping quotes if someone pasted `BLOB_READ_WRITE_TOKEN="vercel_blob_..."`
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }
  // Strip UTF-8 BOM if editor added it
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1).trim();
  }
  return raw || null;
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
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  try {
    const blob = await put(`quotation-pdfs/${filename}`, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
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
