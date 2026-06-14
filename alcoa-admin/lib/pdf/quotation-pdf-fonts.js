/**
 * Embedded serif fonts for PDF generation on Linux/Vercel (no system Times New Roman).
 * Uses Tinos (OFL, Times-like) from assets/fonts/pdf — same look on dev and production.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** CSS font-family name used across quotation PDF styles */
export const QUOTATION_PDF_FONT_FAMILY = "Alcoa PDF Times";

export const QUOTATION_PDF_FONT_STACK = `"${QUOTATION_PDF_FONT_FAMILY}", "Times New Roman", Times, serif`;

/** Serif stack for line-item tables — matches competitor Cambria-style table typography. */
export const QUOTATION_PDF_TABLE_FONT_STACK = QUOTATION_PDF_FONT_STACK;

const _adminRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const FONT_DEFS = [
  { file: "tinos-latin-400-normal.woff2", weight: 400, style: "normal" },
  { file: "tinos-latin-400-italic.woff2", weight: 400, style: "italic" },
  { file: "tinos-latin-700-normal.woff2", weight: 700, style: "normal" },
  { file: "tinos-latin-700-italic.woff2", weight: 700, style: "italic" },
];

const FONT_DIRS = [
  path.join(_adminRoot, "assets", "fonts", "pdf"),
  path.join(process.cwd(), "assets", "fonts", "pdf"),
  path.join(process.cwd(), "alcoa-admin", "assets", "fonts", "pdf"),
];

let embeddedFontCssCache = null;

function readFontDataUri(filename) {
  for (const dir of FONT_DIRS) {
    const filePath = path.join(dir, filename);
    try {
      if (!fs.existsSync(filePath)) continue;
      const buf = fs.readFileSync(filePath);
      return `data:font/woff2;base64,${buf.toString("base64")}`;
    } catch {
      /* try next path */
    }
  }
  return "";
}

/** @returns {string} @font-face rules inlined into PDF HTML */
export function getQuotationPdfEmbeddedFontCss() {
  if (embeddedFontCssCache !== null) return embeddedFontCssCache;

  const faces = FONT_DEFS.map(({ file, weight, style }) => {
    const src = readFontDataUri(file);
    if (!src) return "";
    return `@font-face {
  font-family: "${QUOTATION_PDF_FONT_FAMILY}";
  font-style: ${style};
  font-weight: ${weight};
  font-display: block;
  src: url(${src}) format("woff2");
}`;
  }).filter(Boolean);

  embeddedFontCssCache = faces.join("\n");
  return embeddedFontCssCache;
}
