/**
 * Shared quotation branding for PDF, email HTML, and outbound copy (WhatsApp / subjects).
 * Logo: prefer `alcoa-admin/public/brand/quotation-logo.png`, then monorepo `frontend/src/assets/logo.png`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Content-ID for inline logo in outbound emails (Gmail blocks data: URIs). */
export const QUOTATION_EMAIL_LOGO_CID = "alcoa-quotation-logo";

const _adminRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Navy palette aligned with ALCOA corporate logo */
export const QUOTATION_BRAND = {
  primary: "#1D3A6C",
  primaryDark: "#152d56",
  primaryLight: "#2a5082",
  headerGradient: "linear-gradient(135deg, #1D3A6C 0%, #152d56 100%)",
  accentWash: "#eef3f9",
  accentBorder: "#b8c9dc",
  totalBar: "#1D3A6C",
  footerBg: "#0f172a",
  text: "#0f172a",
  muted: "#64748b",
};

const _dataUriCache = new Map();

function mimeForExt(ext) {
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

function getDataUriFromCandidates(candidates) {
  for (const filePath of candidates) {
    try {
      if (!fs.existsSync(filePath)) continue;
      if (_dataUriCache.has(filePath)) return _dataUriCache.get(filePath);
      const buf = fs.readFileSync(filePath);
      const mime = mimeForExt(path.extname(filePath).toLowerCase());
      const dataUri = `data:${mime};base64,${buf.toString("base64")}`;
      _dataUriCache.set(filePath, dataUri);
      return dataUri;
    } catch {
      /* try next */
    }
  }
  return "";
}

function getQuotationLogoFileCandidates() {
  const cwd = process.cwd();
  return [
    path.join(_adminRoot, "public", "brand", "quotation-logo.png"),
    path.join(_adminRoot, "public", "brand", "logo.png"),
    path.join(cwd, "public", "brand", "quotation-logo.png"),
    path.join(cwd, "public", "brand", "logo.png"),
    path.join(cwd, "..", "frontend", "src", "assets", "logo.png"),
    path.join(cwd, "frontend", "src", "assets", "logo.png"),
  ];
}

/** First existing logo file path, or null. */
export function getQuotationLogoFilePath() {
  for (const filePath of getQuotationLogoFileCandidates()) {
    if (fs.existsSync(filePath)) return filePath;
  }
  return null;
}

/** Logo bytes for email inline (CID) attachments. */
export function getQuotationLogoBuffer() {
  const filePath = getQuotationLogoFilePath();
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

/** Public URL for logo (optional; set EMAIL_LOGO_URL for a fixed CDN/admin URL). */
export function getQuotationLogoPublicUrl() {
  const explicit = process.env.EMAIL_LOGO_URL?.trim();
  if (explicit) return explicit;

  const raw =
    process.env.PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!raw) return "";
  const origin = raw.startsWith("http") ? raw : `https://${raw}`;
  return `${origin.replace(/\/$/, "")}/brand/quotation-logo.png`;
}

/** True when the logo URL can be loaded by recipients (not localhost). */
export function isReachableEmailLogoUrl(url) {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
  } catch {
    return false;
  }
}

/**
 * Branding for quotation / sales order / sales invoice emails.
 * Prefers a public HTTPS logo URL in HTML (no extra attachment).
 * Falls back to Resend CID inline (base64) when only a local file exists.
 *
 * @returns {{ logoSrc: string; inlineAttachments: object[] }}
 */
export function buildDocumentEmailBranding() {
  const publicUrl = getQuotationLogoPublicUrl();
  if (isReachableEmailLogoUrl(publicUrl)) {
    return { logoSrc: publicUrl, inlineAttachments: [] };
  }

  const logoBuffer = getQuotationLogoBuffer();
  if (logoBuffer) {
    return {
      logoSrc: `cid:${QUOTATION_EMAIL_LOGO_CID}`,
      inlineAttachments: [
        {
          filename: "quotation-logo.png",
          content: Buffer.from(logoBuffer).toString("base64"),
          contentId: QUOTATION_EMAIL_LOGO_CID,
          contentType: "image/png",
        },
      ],
    };
  }

  const dataUri = getQuotationLogoDataUri();
  return {
    logoSrc: dataUri || "",
    inlineAttachments: [],
  };
}

/**
 * Returns a data URI for embedding in PDF/HTML, or empty string if no file found.
 */
export function getQuotationLogoDataUri() {
  return getDataUriFromCandidates(getQuotationLogoFileCandidates());
}

/** Header art (PNG) used by quotation PDF. */
export function getQuotationHeaderDataUri() {
  const cwd = process.cwd();
  return getDataUriFromCandidates([
    path.join(_adminRoot, "assets", "3.png"),
    path.join(_adminRoot, "assets", "nw_qnt_hdr_png.png"),
    path.join(_adminRoot, "assets", "quotation-header.png"),
    path.join(_adminRoot, "assets", "QuotationHeader.png"),
    path.join(cwd, "assets", "3.png"),
    path.join(cwd, "public", "assets", "3.png"),
    path.join(cwd, "assets", "nw_qnt_hdr_png.png"),
    path.join(cwd, "public", "assets", "nw_qnt_hdr_png.png"),
  ]);
}

/** Footer art (PNG) used by quotation PDF. */
export function getQuotationFooterDataUri() {
  const cwd = process.cwd();
  return getDataUriFromCandidates([
    path.join(_adminRoot, "assets", "2.png"),
    path.join(_adminRoot, "assets", "nw_qtn_ftr_png.png"),
    path.join(_adminRoot, "assets", "quotation-footer.png"),
    path.join(_adminRoot, "assets", "QuotationFooter.png"),
    path.join(cwd, "assets", "2.png"),
    path.join(cwd, "public", "assets", "2.png"),
    path.join(cwd, "assets", "nw_qtn_ftr_png.png"),
    path.join(cwd, "public", "assets", "nw_qtn_ftr_png.png"),
  ]);
}

/** Legal / customer-facing company name (emails, PDFs, WhatsApp). */
export function getQuotationCompanyName() {
  return (
    process.env.COMPANY_NAME ||
    process.env.NEXT_PUBLIC_COMPANY_NAME ||
    "Alcoa Aluminium scaffolding L.L.C"
  );
}

export function getQuotationTagline() {
  return (
    process.env.NEXT_PUBLIC_QUOTATION_TAGLINE ||
    "Professional Aluminium Scaffolding Solutions | UAE"
  );
}

export function getQuotationCompanyEmail() {
  return process.env.COMPANY_EMAIL || "sales@alcoascaffolding.com";
}

/** Company TRN printed on quotation, sales order, and sales invoice PDFs. */
export function getQuotationCompanyTRN() {
  return process.env.COMPANY_TRN || "105075887700001";
}

/**
 * Plain text for WhatsApp (the attached PDF uses the full branded layout + logo).
 */
export function buildWhatsAppQuotationBody(
  quotation,
  { attachmentLine = true, devNoPdfNote = "", publicUrl = "" } = {}
) {
  const brand = getQuotationCompanyName();
  const lines = [
    `*${quotation.quoteNumber}* — ${brand}`,
    `Dear ${quotation.customerName},`,
  ];
  if (devNoPdfNote) lines.push(devNoPdfNote);
  else if (attachmentLine) lines.push("Please find your formal quotation attached (PDF).");
  lines.push(
    `Total: AED ${Number(quotation.totalAmount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`
  );
  // Customer accept/reject links disabled — admin updates status in panel
  // if (publicUrl) {
  //   lines.push(
  //     "",
  //     `Review & confirm online:`,
  //     `${publicUrl}`,
  //     `Accept: ${publicUrl}?action=accept`,
  //     `Reject: ${publicUrl}?action=reject`
  //   );
  // }
  lines.push("", `Questions? Reply here or email ${getQuotationCompanyEmail()}.`);
  return lines.join("\n");
}

function formatAed(amount) {
  return `AED ${Number(amount || 0).toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Plain text for WhatsApp — sales order PDF is attached or linked separately. */
export function buildWhatsAppSalesOrderBody(
  order,
  { attachmentLine = true, devNoPdfNote = "" } = {}
) {
  const brand = getQuotationCompanyName();
  const lines = [
    `*${order.orderNumber}* — ${brand}`,
    `Dear ${order.customerName},`,
  ];
  if (devNoPdfNote) lines.push(devNoPdfNote);
  else if (attachmentLine) lines.push("Please find your sales order attached (PDF).");
  lines.push(
    `Total: ${formatAed(order.total)}`,
    `Order date: ${new Date(order.orderDate).toLocaleDateString("en-GB")}`,
    "",
    `Questions? Reply here or email ${getQuotationCompanyEmail()}.`
  );
  return lines.join("\n");
}

/** Plain text for WhatsApp — sales invoice PDF is attached or linked separately. */
export function buildWhatsAppSalesInvoiceBody(
  invoice,
  { attachmentLine = true, devNoPdfNote = "" } = {}
) {
  const brand = getQuotationCompanyName();
  const lines = [
    `*${invoice.invoiceNumber}* — ${brand}`,
    `Dear ${invoice.customerName},`,
  ];
  if (devNoPdfNote) lines.push(devNoPdfNote);
  else if (attachmentLine) lines.push("Please find your invoice attached (PDF).");
  lines.push(
    `Total: ${formatAed(invoice.total)}`,
    `Balance due: ${formatAed(invoice.balance ?? Math.max(0, Number(invoice.total || 0) - Number(invoice.paidAmount || 0)))}`
  );
  if (invoice.dueDate) {
    lines.push(`Due: ${new Date(invoice.dueDate).toLocaleDateString("en-GB")}`);
  }
  lines.push("", `Questions? Reply here or email ${getQuotationCompanyEmail()}.`);
  return lines.join("\n");
}
