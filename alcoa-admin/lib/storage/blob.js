import { put, del, list } from "@vercel/blob";

/**
 * Upload a buffer (e.g. PDF) to Vercel Blob
 * @param {Buffer} buffer - File content
 * @param {string} filename - e.g. "QT-2026-0001.pdf"
 * @param {string} contentType - MIME type
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadToBlob(buffer, filename, contentType = "application/pdf") {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
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
    await del(url);
  } catch (err) {
    console.warn("[Blob] Delete error:", err.message);
  }
}

/**
 * List quotation PDFs
 */
export async function listPDFs(prefix = "quotation-pdfs/") {
  const { blobs } = await list({ prefix });
  return blobs;
}
