/**
 * Shared quotation branding for PDF, email HTML, and outbound copy (WhatsApp / subjects).
 * Logo: prefer `alcoa-admin/public/brand/quotation-logo.png`, then monorepo `frontend/src/assets/logo.png`.
 */

import fs from "node:fs";
import path from "node:path";

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

/**
 * Returns a data URI for embedding in PDF/HTML, or empty string if no file found.
 */
export function getQuotationLogoDataUri() {
  const cwd = process.cwd();
  return getDataUriFromCandidates([
    path.join(cwd, "public", "brand", "quotation-logo.png"),
    path.join(cwd, "public", "brand", "logo.png"),
    path.join(cwd, "..", "frontend", "src", "assets", "logo.png"),
    path.join(cwd, "frontend", "src", "assets", "logo.png"),
  ]);
}

/** Header art (PNG) used by quotation PDF. */
export function getQuotationHeaderDataUri() {
  const cwd = process.cwd();
  return getDataUriFromCandidates([
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
    path.join(cwd, "assets", "2.png"),
    path.join(cwd, "public", "assets", "2.png"),
    path.join(cwd, "assets", "nw_qtn_ftr_png.png"),
    path.join(cwd, "public", "assets", "nw_qtn_ftr_png.png"),
  ]);
}

export function getQuotationCompanyName() {
  return process.env.NEXT_PUBLIC_APP_NAME || "ALCOA Aluminium Scaffolding";
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
  if (publicUrl) {
    lines.push(
      "",
      `Review & confirm online:`,
      `${publicUrl}`,
      `Accept: ${publicUrl}?action=accept`,
      `Reject: ${publicUrl}?action=reject`
    );
  }
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
