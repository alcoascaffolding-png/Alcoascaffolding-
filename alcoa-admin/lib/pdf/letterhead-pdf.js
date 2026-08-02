/**
 * Company letterhead: branded header and footer with an otherwise blank page,
 * for offer letters, undertakings, and other typed correspondence.
 */

import { launchBrowser } from "./chromium";
import {
  getQuotationCompanyName,
  getQuotationCompanyEmail,
  getQuotationLogoDataUri,
  getQuotationHeaderDataUri,
  getQuotationFooterDataUri,
} from "@/lib/quotation-brand";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function letterheadStyles() {
  return `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      width: 210mm;
      font-family: "Segoe UI", Arial, Helvetica, sans-serif;
      color: #0f172a;
    }
    .sheet {
      position: relative;
      width: 210mm;
      height: 297mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .sheet-head,
    .sheet-foot { flex: 0 0 auto; }
    .sheet-head img,
    .sheet-foot img {
      display: block;
      width: 100%;
      height: auto;
    }
    .head-fallback {
      padding: 16mm 15mm 8mm;
      border-bottom: 3px solid #1d3a6c;
      text-align: center;
    }
    .head-fallback img { width: 34mm; margin: 0 auto 4mm; }
    .head-fallback-name {
      font-size: 17pt;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #1d3a6c;
      text-transform: uppercase;
    }
    .foot-fallback {
      padding: 6mm 15mm 10mm;
      border-top: 3px solid #1d3a6c;
      text-align: center;
      font-size: 8.5pt;
      color: #475569;
    }
    /* The point of the letterhead: an empty, printable body. */
    .sheet-body {
      flex: 1 1 auto;
      min-height: 0;
      padding: 14mm 18mm;
      font-size: 11pt;
      line-height: 1.7;
      white-space: pre-wrap;
      overflow: hidden;
    }
    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.04;
      pointer-events: none;
      overflow: hidden;
    }
    .watermark img { width: 62%; height: auto; }
    @media print {
      @page { size: A4; margin: 0; }
      .sheet { overflow: hidden; page-break-inside: avoid; break-inside: avoid; }
    }
  `;
}

/**
 * @param {{ body?: string; pages?: number; watermark?: boolean }} [options]
 */
export function buildLetterheadHtml(options = {}) {
  const { body = "", pages = 1, watermark = false } = options;

  const companyName = getQuotationCompanyName();
  const companyEmail = getQuotationCompanyEmail();
  const logoDataUri = getQuotationLogoDataUri();
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();

  const headHtml = headerDataUri
    ? `<img src="${headerDataUri}" alt="" crossorigin="anonymous" />`
    : `<div class="head-fallback">${
        logoDataUri ? `<img src="${logoDataUri}" alt="" />` : ""
      }<div class="head-fallback-name">${escapeHtml(companyName)}</div></div>`;

  const footHtml = footerDataUri
    ? `<img src="${footerDataUri}" alt="" crossorigin="anonymous" />`
    : `<div class="foot-fallback">${escapeHtml(companyName)} &nbsp;|&nbsp; ${escapeHtml(companyEmail)}</div>`;

  const watermarkHtml =
    watermark && logoDataUri
      ? `<div class="watermark" aria-hidden="true"><img src="${logoDataUri}" alt="" crossorigin="anonymous" /></div>`
      : "";

  const sheetCount = Math.min(Math.max(Number(pages) || 1, 1), 10);
  const sheets = Array.from({ length: sheetCount }, (_, i) => {
    const content = i === 0 ? escapeHtml(body) : "";
    return `
    <div class="sheet">
      ${watermarkHtml}
      <div class="sheet-head">${headHtml}</div>
      <div class="sheet-body">${content}</div>
      <div class="sheet-foot">${footHtml}</div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(companyName)} — Letterhead</title>
  <style>${letterheadStyles()}</style>
</head>
<body>${sheets}</body>
</html>`;
}

async function waitForImages(page) {
  await page
    .evaluate(() =>
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              })
          )
      )
    )
    .catch(() => {});
}

/**
 * @param {{ body?: string; pages?: number; watermark?: boolean }} [options]
 * @returns {Promise<Buffer>}
 */
export async function generateLetterheadPDF(options = {}) {
  const html = buildLetterheadHtml(options);
  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 794, height: 1123 } });
  let page;
  try {
    page = await context.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
    await waitForImages(page);
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.emulateMedia({ media: "print" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(buffer);
  } finally {
    if (page) await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
