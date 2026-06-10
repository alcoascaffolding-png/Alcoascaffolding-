import { getQuotationPdfEmbeddedFontCss, QUOTATION_PDF_FONT_STACK } from "./quotation-pdf-fonts.js";

let quotationPdfFullCssCache = null;
let quotationPdfProbeCssCache = null;

function buildQuotationPdfCss(embedFonts) {
  const embeddedFonts = embedFonts ? getQuotationPdfEmbeddedFontCss() : "";
  return `
    ${embeddedFonts}
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    :root {
      --layout-blue: #235aa0;
      --layout-blue-soft: #edf4fc;
      --layout-blue-wash: #dbe8f6;
      --table-border-outer: 2px solid var(--layout-blue);
      --table-border-cell: 1px solid var(--layout-blue);
      --pdf-page-height: 297mm;
      --pdf-page-width: 210mm;
      /* Horizontal inset from page edge to inner blue frame (6mm margin + 3px border). */
      --pdf-frame-inset-x: calc(6mm + 3px);
      /* Horizontal bleed that extends header/footer under the frame border on each side,
         covering the sub-pixel rounding gap that appears on the right side in Chromium PDF. */
      --pdf-edge-bleed: 2px;
      /* One bank table body row (matches .bank-table-full td padding + line-height) */
      --bank-table-row-height: 27px;
      --pdf-font-stack: ${QUOTATION_PDF_FONT_STACK};
    }
    html, body {
      width: var(--pdf-page-width);
      margin: 0;
      padding: 0;
    }
    body {
      font-family: var(--pdf-font-stack);
      font-size: 12px;
      font-weight: 400;
      font-style: normal;
      color: #111;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
    }

    /*
     * One sheet = .page / .pdf-page (exactly A4).
     * Side padding aligns content with the inner edge of the blue ::before frame.
     */
    .page,
    .pdf-page {
      width: var(--pdf-page-width);
      max-width: var(--pdf-page-width);
      height: var(--pdf-page-height);
      max-height: var(--pdf-page-height);
      min-height: var(--pdf-page-height);
      padding-top: 12mm;
      padding-right: var(--pdf-frame-inset-x);
      padding-bottom: var(--pdf-frame-inset-x);
      padding-left: var(--pdf-frame-inset-x);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      box-sizing: border-box;
    }
    .page:last-child,
    .pdf-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .header,
    .pdf-running-head {
      flex: 0 0 auto;
      flex-shrink: 0;
      /* Bleed 2px under the frame border on both sides to eliminate the sub-pixel rounding
         gap that Chromium produces between the header image edge and the ::before frame. */
      width: calc(100% + 2 * var(--pdf-edge-bleed));
      max-width: none;
      margin: 0 calc(-1 * var(--pdf-edge-bleed));
      break-inside: avoid;
      page-break-inside: avoid;
      page-break-after: avoid;
      break-after: avoid;
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      overflow: hidden;
    }

    .content,
    .pdf-page-fill,
    .pdf-page-fill-closing {
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 1;
      box-sizing: border-box;
    }

    .footer,
    .pdf-running-foot {
      flex: 0 0 auto;
      flex-shrink: 0;
      /* Same horizontal bleed as the header — covers the rounding gap on the right. */
      width: calc(100% + 2 * var(--pdf-edge-bleed));
      max-width: none;
      margin-top: auto;
      margin-left: calc(-1 * var(--pdf-edge-bleed));
      margin-right: calc(-1 * var(--pdf-edge-bleed));
      break-inside: avoid;
      page-break-inside: avoid;
      page-break-before: avoid;
      break-before: avoid;
      position: relative;
      z-index: 1;
      box-sizing: border-box;
      overflow: hidden;
    }

    .top-brand {
      width: 100%;
      max-width: 100%;
      margin: 0 0 6px;
      flex-shrink: 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    .header-art,
    .footer-art {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0;
      padding: 0;
      border: 0;
      image-rendering: auto;
    }
    .header-fallback {
      border-bottom: 2px solid #2a5f9e;
      min-height: 56px;
      position: relative;
      padding: 6px 0;
      text-align: center;
    }
    .header-fallback-title {
      font-family: var(--pdf-font-stack);
      font-size: 19px;
      font-weight: 700;
      font-style: normal;
    }
    .header-logo-fallback {
      position: absolute;
      left: 0;
      top: 4px;
      height: 48px;
      max-width: 165px;
      object-fit: contain;
    }
    .footer-fallback {
      border: 1px solid #9ca3af;
      padding: 5px 6px;
      text-align: center;
    }

    .pdf-page::before {
      content: "";
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      border: 3px solid var(--layout-blue);
      pointer-events: none;
      z-index: 2;
    }
    .pdf-page-watermark {
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .pdf-page-watermark img {
      width: 72%;
      max-width: 560px;
      height: auto;
      object-fit: contain;
      opacity: 0.11;
      filter: grayscale(60%) brightness(1.1);
    }

    .first-page { padding-top: 7mm; }
    .first-page .top-brand {
      margin-top: 0;
      margin-bottom: 2px;
    }
    .pdf-page:not(.first-page) {
      padding-top: 7mm;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    .doc-heading {
      text-align: center;
      margin: 6px 0 8px;
      flex-shrink: 0;
      font-family: var(--pdf-font-stack);
      font-style: normal;
      font-weight: normal;
    }
    .doc-title {
      margin: 0;
      font-size: 30px;
      font-weight: 700;
      font-style: normal;
      letter-spacing: 0.4px;
      color: #111;
      line-height: 1;
    }
    .doc-trn {
      margin-top: 4px;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      color: #111;
      line-height: 1.1;
    }
    .doc-trn strong { font-weight: 700; font-style: normal; }

    .head-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 8px;
      margin-bottom: 5px;
      align-items: start;
      flex-shrink: 0;
    }
    .box { border: 1px solid var(--layout-blue); }
    .head-grid .box {
      border: 0;
      min-height: 0;
    }
    .head-mini-table {
      width: 100%;
      border: 2px solid var(--layout-blue);
      border-collapse: collapse;
      table-layout: auto;
    }
    .head-mini-table td {
      border: 1px solid var(--layout-blue);
      padding: 8px 10px;
      font-size: 12px;
      line-height: 1.25;
      vertical-align: top;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .head-mini-table .mini-label {
      width: 128px;
      min-width: 128px;
      font-weight: 700;
      background: #fff;
      text-transform: uppercase;
      letter-spacing: normal;
      padding: 8px 10px;
      white-space: nowrap;
    }
    .head-grid > .box:first-child .head-mini-table { border-left: none; }
    .head-grid > .box:first-child .head-mini-table td:first-child { border-left: none; }
    .head-grid > .box:last-child .head-mini-table { border-right: none; }
    .head-grid > .box:last-child .head-mini-table td:last-child { border-right: none; }

    .mini-table { width: 100%; border-collapse: collapse; }
    .mini-table td {
      border: 1px solid var(--layout-blue);
      padding: 4px 5px;
      font-size: 11px;
      vertical-align: top;
    }
    .mini-table .mini-label {
      width: 110px;
      font-weight: 700;
      background: #fff;
      text-transform: uppercase;
      font-size: 10.5px;
    }

    .doc-lines-shell {
      border: none;
      margin-top: 2px;
      flex-shrink: 0;
    }
    .doc-lines-shell .subject-bar {
      border: none;
      border-bottom: 1px solid var(--layout-blue);
      padding: 4px 10px 6px;
      font-size: 12px;
      font-weight: 700;
      font-style: italic;
      color: #111;
      margin: 0;
    }
    .doc-lines-shell .items-table { border: none; }

    .subject-bar {
      border: 2px solid var(--layout-blue);
      border-bottom: none;
      padding: 4px 10px 6px;
      font-size: 12px;
      font-weight: 700;
      font-style: italic;
      color: #111;
      margin-top: 0;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 2px solid var(--layout-blue);
      border-left: none;
      border-right: none;
      border-bottom: none;
    }
    .items-table thead {
      display: table-header-group;
    }
    .items-table tbody tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .items-table th,
    .items-table td {
      border: 1px solid var(--layout-blue);
      padding: 3px 4px;
      font-family: var(--pdf-font-stack);
      vertical-align: middle;
    }
    .items-table th:not(.desc-col) {
      font-size: 8.7px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      text-align: center;
    }
    .items-table td:not(.desc-col) {
      font-size: 10.5px;
      font-weight: 400;
      font-style: normal;
      color: #111;
      text-align: center;
    }
    .items-table th.desc-col,
    .items-table td.desc-col {
      font-family: var(--pdf-font-stack);
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: 0.02em;
      padding: 6px 8px;
      font-weight: 700;
      font-style: italic;
      color: #111;
      text-align: left;
      vertical-align: top;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .items-table td.desc-col .item-title {
      font-weight: 700;
      font-style: italic;
      color: #111;
      margin-bottom: 3px;
    }
    .items-table td.desc-col .item-sub {
      font-weight: 700;
      font-style: italic;
      color: #111;
      line-height: 1.45;
      letter-spacing: 0.02em;
    }
    .items-table th {
      font-weight: 700;
      background: #fff;
      text-align: center;
      vertical-align: middle;
    }
    .items-table td.center,
    .items-table td.right,
    .items-table td.strong {
      text-align: center;
    }
    .items-table td.strong { font-weight: 700; }
    .items-table th:first-child,
    .items-table td:first-child { border-left: none; }
    .items-table th:last-child,
    .items-table td:last-child { border-right: none; }

    .items-totals-foot {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .items-totals-foot td.totals-spacer {
      border: none !important;
      padding: 0;
      background: transparent;
    }
    .items-totals-foot td.totals-label,
    .items-totals-foot td.totals-value {
      border: 1px solid var(--layout-blue);
      padding: 5px 8px;
      font-size: 8.7px;
      font-weight: 400;
      vertical-align: middle;
    }
    .items-totals-foot tr:first-child td.totals-label,
    .items-totals-foot tr:first-child td.totals-value {
      border-top: 2px solid var(--layout-blue);
      font-weight: 700;
    }
    .items-totals-foot tr.totals-grand td.totals-label,
    .items-totals-foot tr.totals-grand td.totals-value {
      border-bottom: 2px solid var(--layout-blue);
      font-weight: 700;
    }
    .items-totals-foot td.totals-label {
      text-transform: uppercase;
      font-size: 10.5px;
      text-align: right;
      border-left: 2px solid var(--layout-blue);
      padding: 5px 12px 5px 8px;
      line-height: 1.3;
    }
    .items-totals-foot td.totals-label-total {
      font-size: 8.5px;
      line-height: 1.2;
    }
    .items-totals-foot .totals-currency {
      font-size: 8px;
      font-style: normal;
      font-weight: 600;
    }
    .items-totals-foot td.totals-value {
      text-align: right;
      padding: 5px 10px 5px 6px;
    }
    .items-totals-foot td.totals-value:last-child { border-right: none; }
    .items-totals-foot tr.totals-grand td { background: transparent; }

    .item-title { font-weight: 700; font-style: italic; color: #111; }
    .item-sub { font-weight: 700; font-style: italic; color: #111; }

    .totals-align-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-top: 6px;
    }
    .totals-align-spacer { border: none; padding: 0; }
    .totals-align-cell { border: none; padding: 0; vertical-align: top; }
    .totals-wrap { border: none; page-break-inside: avoid; break-inside: avoid; }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid var(--layout-blue);
      border-right: none;
    }
    .totals-table td:last-child { border-right: none; }
    .totals-table td {
      border: 1px solid var(--layout-blue);
      padding: 3px 4px;
      font-size: 9.5px;
      white-space: nowrap;
    }
    .totals-table .label {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5px;
    }
    .totals-table .value { text-align: right; }
    .totals-table .grand td { font-weight: 700; background: transparent; }

    .closing-tail-flow {
      margin-top: 10px;
      flex-shrink: 0;
      padding-left: 5mm;
      padding-right: 3mm;
      padding-bottom: 4px;
    }
    .lower-grid { display: block; margin-top: 4px; }
    .terms-plain { padding-top: 2px; }
    .terms-plain-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--layout-blue);
      text-decoration: underline;
      margin-bottom: 6px;
    }
    .terms-plain-body {
      font-size: 13.5px;
      line-height: 1.7;
      white-space: pre-line;
    }
    .terms-plain + .terms-plain .terms-plain-body { margin-top: 0; }
    .notes-plain {
      margin-top: 6px;
      border-top: 1px solid #d1d5db;
      padding-top: 4px;
      font-size: 11px;
      line-height: 1.5;
    }
    .notes-plain strong {
      color: var(--layout-blue);
      text-decoration: underline;
    }

    /* Title row 1; table + signatures row 2 — sign labels align with IBAN (4th table row) */
    .bank-signatures-wrap {
      margin-top: 12px;
      margin-left: -5mm;
      margin-right: -3mm;
      width: calc(100% + 5mm + 3mm);
      padding: 0 2mm;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      align-items: start;
      column-gap: 10px;
      row-gap: 6px;
    }
    .bank-signatures-wrap .bank-title-main {
      grid-column: 2;
      grid-row: 1;
      justify-self: center;
      align-self: center;
      margin-bottom: 0;
    }
    .bank-signatures-wrap .bank-table-wrap {
      grid-column: 2;
      grid-row: 2;
      justify-self: center;
      display: flex;
      justify-content: center;
      width: auto;
    }
    .bank-title-main {
      text-align: center;
      font-size: 16px;
      color: #111;
      text-decoration: underline;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .bank-table-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .bank-table-full {
      width: max-content;
      max-width: 100%;
      margin-left: auto;
      margin-right: auto;
      border-collapse: collapse;
      border: 2px solid var(--layout-blue);
      table-layout: auto;
    }
    .bank-table-full td {
      font-size: 11px;
      padding: 5px 8px;
      border: 1px solid var(--layout-blue);
      vertical-align: middle;
      line-height: 1.3;
    }
    .bank-table-full td:not(.mini-label) { white-space: nowrap; }
    .bank-table-full .mini-label {
      width: auto;
      white-space: nowrap;
      font-weight: 700;
      background: #fff;
      text-transform: none;
      font-size: 10px;
    }

    .bank-signatures-wrap .sign-box {
      font-size: 10px;
      color: var(--layout-blue);
      font-weight: 700;
      grid-row: 2;
      align-self: start;
      max-width: 100%;
      /* Skip rows 1–3 (Bank details, Bank name, Account no); label sits on IBAN row */
      padding-top: calc(3 * var(--bank-table-row-height));
      padding-bottom: 0;
    }
    .bank-signatures-wrap .sign-box-company {
      grid-column: 1;
      justify-self: start;
      text-align: left;
      padding-right: 6px;
    }
    .bank-signatures-wrap .sign-box-customer {
      grid-column: 3;
      justify-self: end;
      text-align: right;
      padding-left: 6px;
    }
    .sign-line {
      width: 220px;
      max-width: 100%;
      margin-top: 4px;
      height: 28px;
      border-bottom: 1px solid var(--layout-blue);
    }
    .sign-box-company .sign-line {
      margin-left: 0;
      margin-right: auto;
    }
    .sign-box-customer .sign-line {
      margin-left: auto;
      margin-right: 0;
    }

    .footer-main {
      width: 100%;
      max-width: 100%;
      margin: 0;
      line-height: 0;
      font-size: 0;
      flex-shrink: 0;
      box-sizing: border-box;
      overflow: hidden;
    }

    @media print {
      @page { size: A4; margin: 0; }
      html, body {
        width: var(--pdf-page-width);
        max-width: var(--pdf-page-width);
        margin: 0;
        padding: 0;
      }
      .page,
      .pdf-page {
        width: var(--pdf-page-width);
        max-width: var(--pdf-page-width);
        height: var(--pdf-page-height);
        max-height: var(--pdf-page-height);
        min-height: var(--pdf-page-height);
        overflow: hidden;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .header,
      .pdf-running-head,
      .footer,
      .pdf-running-foot {
        /* Preserve the horizontal bleed defined in the base rules. */
        width: calc(100% + 2 * var(--pdf-edge-bleed));
        max-width: none;
        margin-left: calc(-1 * var(--pdf-edge-bleed));
        margin-right: calc(-1 * var(--pdf-edge-bleed));
        overflow: hidden;
        position: relative;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .footer,
      .pdf-running-foot {
        page-break-before: avoid;
        break-before: avoid;
      }
      .header-art,
      .footer-art {
        width: 100%;
        max-width: 100%;
        height: auto;
      }
      .content,
      .pdf-page-fill,
      .pdf-page-fill-closing {
        overflow: hidden;
      }
      .items-table tbody tr,
      .items-totals-foot,
      .closing-tail-flow,
      .bank-signatures-wrap {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .items-table td.desc-col,
      .items-table td.desc-col .item-title,
      .items-table td.desc-col .item-sub,
      .subject-bar {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}

/** Full CSS for final PDF render (includes embedded serif fonts). */
export function quotationPdfStyles() {
  if (quotationPdfFullCssCache === null) {
    quotationPdfFullCssCache = buildQuotationPdfCss(true);
  }
  return quotationPdfFullCssCache;
}

/** Lightweight CSS for layout probes — avoids shipping ~150KB fonts on every measure pass (Vercel timeout). */
export function quotationPdfProbeStyles() {
  if (quotationPdfProbeCssCache === null) {
    quotationPdfProbeCssCache = buildQuotationPdfCss(false);
  }
  return quotationPdfProbeCssCache;
}
