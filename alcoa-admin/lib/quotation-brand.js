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

let _cachedLogoDataUri = null;
let _cachedLogoPath = null;

function mimeForExt(ext) {
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

/**
 * Returns a data URI for embedding in PDF/HTML, or empty string if no file found.
 * Result is memoized for the process lifetime (logo path assumed stable).
 */
export function getQuotationLogoDataUri() {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "public", "brand", "quotation-logo.png"),
    path.join(cwd, "public", "brand", "logo.png"),
    path.join(cwd, "..", "frontend", "src", "assets", "logo.png"),
    path.join(cwd, "frontend", "src", "assets", "logo.png"),
  ];

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        if (_cachedLogoDataUri && _cachedLogoPath === filePath) return _cachedLogoDataUri;
        const buf = fs.readFileSync(filePath);
        const mime = mimeForExt(path.extname(filePath).toLowerCase());
        _cachedLogoDataUri = `data:${mime};base64,${buf.toString("base64")}`;
        _cachedLogoPath = filePath;
        return _cachedLogoDataUri;
      }
    } catch {
      /* try next */
    }
  }
  return "";
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
  { attachmentLine = true, devNoPdfNote = "" } = {}
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
    `Valid until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`,
    "",
    `Questions? Reply here or email ${getQuotationCompanyEmail()}.`
  );
  return lines.join("\n");
}
