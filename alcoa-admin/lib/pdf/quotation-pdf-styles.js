import {
  getQuotationPdfEmbeddedFontCss,
  QUOTATION_PDF_FONT_STACK,
  QUOTATION_PDF_TABLE_FONT_STACK,
} from "./quotation-pdf-fonts.js";

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
      --pdf-font-stack: ${QUOTATION_PDF_FONT_STACK};
      --pdf-table-font-stack: ${QUOTATION_PDF_TABLE_FONT_STACK};
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
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      line-height: 1.3;
    }
    .doc-trn strong { font-weight: 700; font-style: normal; }

    .head-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 8px;
      margin-bottom: 6px;
      align-items: stretch;
      flex-shrink: 0;
    }
    .box { border: 1px solid var(--layout-blue); }
    .head-grid .box {
      border: 0;
      min-height: 0;
    }
    .head-mini-table {
      width: 100%;
      height: 100%;
      border: 2px solid var(--layout-blue);
      border-collapse: collapse;
      table-layout: fixed;
      font-family: var(--pdf-font-stack);
    }
    .head-mini-table td {
      border: 1px solid var(--layout-blue);
      padding: 9px 12px;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      font-style: normal;
      line-height: 1.5;
      vertical-align: middle;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
      color: #111;
    }
    .head-mini-table .mini-label {
      width: 140px;
      min-width: 140px;
      font-family: var(--pdf-font-stack);
      font-size: 13px;
      font-weight: 700;
      font-style: normal;
      background: #fff;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding: 9px 10px;
      white-space: nowrap;
      vertical-align: middle;
      color: #111;
    }
    .head-mini-table td:not(.mini-label) {
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      font-style: normal;
      padding: 9px 12px;
      line-height: 1.5;
      vertical-align: middle;
    }
    /* Delivery note header — compact labels that stay inside the cell */
    .head-mini-table.dn-head-mini-table .mini-label {
      width: 128px;
      min-width: 128px;
      max-width: 128px;
      font-size: 12px;
      white-space: normal;
      line-height: 1.25;
      padding: 9px 8px;
      letter-spacing: 0.02em;
      overflow-wrap: anywhere;
      word-break: break-word;
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
      padding: 9px 12px;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      margin: 0;
      line-height: 1.5;
    }
    .doc-lines-shell .items-table-shell {
      border: none;
    }
    .doc-lines-shell .items-table {
      border: none;
    }

    .subject-bar {
      border: 2px solid var(--layout-blue);
      border-bottom: none;
      padding: 9px 12px;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      margin-top: 0;
      line-height: 1.5;
    }

    .items-table-shell {
      border: none;
      flex-shrink: 0;
    }
    .items-totals-only-shell .items-table {
      border-top: 2px solid var(--layout-blue);
    }
    .items-totals-only-shell tbody {
      display: none;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 2px solid var(--layout-blue);
      border-left: none;
      border-right: none;
      border-bottom: none;
      font-family: var(--pdf-table-font-stack);
      font-size: 12.5px;
      text-rendering: geometricPrecision;
      -webkit-font-smoothing: subpixel-antialiased;
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
      padding: 6px 5px;
      font-family: var(--pdf-table-font-stack);
      vertical-align: middle;
      color: #111;
    }
    .items-table col.sn-col { width: 3.5%; }
    .items-table col.desc-col { width: 30%; }
    .items-table col.qty-col { width: 6%; }
    .items-table col.num-col { width: 6.2%; }
    .items-table col.amount-col { width: 13%; }
    .items-table th.sn-col,
    .items-table td.sn-col {
      text-align: center;
      font-size: 12.5px;
      padding: 6px 3px;
    }
    .items-table th.desc-col {
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      line-height: 1.3;
      letter-spacing: normal;
      padding: 8px 6px;
      color: #111;
      text-align: center;
      vertical-align: middle;
      white-space: normal;
    }
    .items-table td.desc-col {
      font-size: 13px;
      line-height: 1.45;
      letter-spacing: normal;
      padding: 8px 8px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      text-align: left;
      vertical-align: middle;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .items-table td.desc-col .item-desc-body {
      font-weight: 700;
      font-style: normal;
      color: #111;
    }
    .items-table td.desc-col .item-desc-line {
      font-weight: 700;
      font-style: normal;
      font-size: 13px;
      line-height: 1.45;
      margin: 0;
    }
    .items-table td.desc-col .item-desc-line + .item-desc-line {
      margin-top: 2px;
    }
    .items-table th.num-col,
    .items-table td.num-col {
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      text-align: center;
      line-height: 1.3;
      white-space: nowrap;
      padding: 6px 3px;
    }
    .items-table th.amount-col,
    .items-table td.amount-col {
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      color: #111;
      text-align: center;
      line-height: 1.3;
      white-space: nowrap;
      padding: 6px 10px 6px 4px;
      overflow: visible;
    }
    .items-table th.num-col {
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      line-height: 1.3;
      vertical-align: middle;
      padding: 8px 3px;
    }
    .items-table th.amount-col {
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      line-height: 1.3;
      vertical-align: middle;
      padding: 8px 10px 8px 4px;
    }
    .items-table td.num-col-strong,
    .items-table td.num-col-amount {
      font-weight: 700;
    }
    .items-totals-foot tr.items-grand-total-row td.num-col-strong {
      font-family: var(--pdf-table-font-stack);
      font-size: 12.5px;
      font-weight: 700;
      font-style: normal;
      text-align: center;
      color: #111;
      padding: 6px 4px;
      white-space: nowrap;
    }
    .items-table td.qty-col {
      line-height: 1.2;
      padding: 6px 4px;
      white-space: normal;
    }
    .items-table td.qty-col .qty-val {
      display: block;
      font-weight: 700;
      font-size: 12.5px;
      white-space: nowrap;
    }
    .items-table td.qty-col .qty-unit {
      display: block;
      font-weight: 700;
      font-size: 12.5px;
      margin-top: 1px;
      white-space: nowrap;
    }
    .items-table th {
      font-weight: 700;
      background: #fff;
      text-align: center;
      vertical-align: middle;
      padding: 8px 4px;
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
    .items-totals-foot td {
      border: 1px solid var(--layout-blue);
      padding: 6px 5px;
      font-size: 12.5px;
      font-family: var(--pdf-table-font-stack);
      color: #111;
      vertical-align: middle;
    }
    .items-totals-foot tr.items-grand-total-row td {
      border-top: 2px solid var(--layout-blue);
      font-weight: 400;
    }
    .items-totals-foot tr.items-grand-total-row .grand-total-label {
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      text-align: left;
      padding-left: 9px;
    }
    .items-totals-foot tr.items-grand-total-row td.strong {
      font-weight: 700;
    }
    .items-totals-foot tr.items-summary-row td {
      font-weight: 400;
      border-top: none;
    }
    .items-totals-foot tr.items-summary-row .summary-label {
      font-weight: 700;
      text-align: right;
      text-transform: none;
      font-size: 13px;
      padding-right: 10px;
      white-space: nowrap;
      color: #000;
    }
    .items-totals-foot tr.items-summary-row .summary-value {
      text-align: right;
      font-weight: 400;
      font-size: 13.5px;
      padding: 6px 12px 6px 6px;
      white-space: nowrap;
      color: #000;
      font-variant-numeric: tabular-nums;
      overflow: visible;
    }
    .items-totals-foot .summary-value.amount-col {
      text-align: right;
    }
    .items-totals-foot tr.items-summary-row .summary-value.summary-value-subtotal {
      font-weight: 700;
      font-size: 13.5px;
    }
    .items-totals-foot tr.items-summary-row .summary-value.amount-col {
      font-weight: 700;
      font-size: 13.5px;
    }
    .items-totals-foot tr.items-summary-row-vat .summary-label {
      font-weight: 700;
    }
    .items-totals-foot tr.items-summary-row-vat .summary-value,
    .items-totals-foot tr.items-summary-row-vat .summary-value.amount-col {
      font-weight: 700;
      font-size: 13.5px;
    }
    .items-totals-foot tr.items-words-row td {
      border-top: 2px solid var(--layout-blue);
      border-bottom: 2px solid var(--layout-blue);
    }
    .items-totals-foot tr.items-words-row .amount-in-words {
      font-weight: 700;
      font-size: 12.5px;
      text-align: left;
      padding: 7px 9px;
      line-height: 1.45;
    }
    .items-totals-foot tr.items-words-row .summary-label {
      font-weight: 700;
      text-align: right;
      font-size: 13px;
      color: #000;
      padding-right: 10px;
    }
    .items-totals-foot tr.items-words-row .summary-value {
      font-weight: 700;
      font-size: 14px;
      text-align: right;
      padding: 6px 12px 6px 6px;
      white-space: nowrap;
      color: #000;
      font-variant-numeric: tabular-nums;
      overflow: visible;
    }
    .items-totals-foot tr.items-words-row .summary-value.net-total-value,
    .items-totals-foot tr.items-words-row .summary-value.net-total-value.amount-col,
    .items-totals-foot tr.items-summary-row .summary-value.net-total-value,
    .items-totals-foot tr.items-summary-row .summary-value.net-total-value.amount-col {
      font-size: 16px;
      font-weight: 700;
      padding: 7px 12px 7px 6px;
      text-align: right;
      white-space: nowrap;
      color: #000;
      font-variant-numeric: tabular-nums;
      overflow: visible;
    }
    .items-totals-foot td:first-child { border-left: none; }
    .items-totals-foot td:last-child { border-right: none; }

    .item-title { font-weight: 700; font-style: normal; color: #111; }
    .item-sub { font-weight: 700; font-style: italic; color: #111; }
    .item-spec { font-weight: 400; font-style: normal; color: #111; }

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
    .terms-plain { padding-top: 2px; font-family: var(--pdf-font-stack); }
    .terms-plain-title {
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      color: #111;
      text-decoration: underline;
      margin-bottom: 6px;
    }
    .terms-plain-body {
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.5;
      white-space: pre-line;
      color: #111;
    }
    .terms-plain + .terms-plain .terms-plain-body { margin-top: 0; }
    .notes-plain {
      margin-top: 6px;
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.5;
      color: #111;
    }
    .notes-plain strong {
      font-family: var(--pdf-font-stack);
      font-weight: 700;
      color: #111;
      text-decoration: underline;
    }

    /* Bank details centered; signature blocks on a full-width row below */
    .bank-signatures-wrap {
      margin-top: 12px;
      margin-left: -5mm;
      margin-right: -3mm;
      width: calc(100% + 5mm + 3mm);
      padding: 0 2mm;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .bank-signatures-wrap .bank-title-main {
      margin-bottom: 0;
    }
    .bank-signatures-wrap .bank-table-wrap {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .signatures-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-top: 12px;
      padding: 0 1mm;
      box-sizing: border-box;
    }
    .bank-title-main {
      text-align: center;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
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
      font-family: var(--pdf-font-stack);
    }
    .bank-table-full td {
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      padding: 9px 12px;
      border: 1px solid var(--layout-blue);
      vertical-align: middle;
      line-height: 1.5;
      color: #111;
    }
    .bank-table-full td:not(.mini-label) { white-space: nowrap; }
    .bank-table-full .mini-label {
      width: auto;
      white-space: nowrap;
      font-family: var(--pdf-font-stack);
      font-weight: 700;
      background: #fff;
      text-transform: none;
      font-size: 13px;
      color: #111;
    }

    .bank-signatures-wrap .sign-box {
      font-family: var(--pdf-font-stack);
      color: #111;
      font-weight: 700;
      flex: 0 1 auto;
      min-width: 0;
    }
    .bank-signatures-wrap .sign-box-company {
      text-align: left;
    }
    .bank-signatures-wrap .sign-box-customer {
      text-align: right;
      margin-left: auto;
    }
    .sign-label {
      font-family: var(--pdf-font-stack);
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.3;
      white-space: nowrap;
      color: #111;
    }
    .sign-line {
      width: 200px;
      max-width: 100%;
      margin-top: 28px;
      height: 0;
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

    /* Delivery note — 5-column items table (no pricing columns) */
    .items-table.dn-items-table col.sn-col { width: 5%; }
    .items-table.dn-items-table col.desc-col { width: 52%; }
    .items-table.dn-items-table col.num-col { width: 12%; }
    .items-table.dn-items-table col.qty-col { width: 16%; }

    .dn-notes-plain {
      margin-top: 6px;
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
      font-family: var(--pdf-font-stack);
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.5;
      color: #111;
    }
    .dn-notes-plain strong {
      font-family: var(--pdf-font-stack);
      font-weight: 700;
      color: #111;
      text-decoration: underline;
    }

    .dn-signatures-wrap {
      margin-top: 14px;
      width: 100%;
      padding: 0 2mm;
      box-sizing: border-box;
    }
    .dn-sign-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 24px;
      align-items: flex-start;
      width: 100%;
    }
    .dn-sign-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 0;
    }
    .dn-sign-slot .sign-label {
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    .dn-sign-slot .sign-line {
      width: 100%;
      max-width: 190px;
      margin-top: 28px;
      margin-left: auto;
      margin-right: auto;
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
      .items-table-shell,
      .doc-lines-shell,
      .closing-tail-flow,
      .bank-signatures-wrap,
      .dn-signatures-wrap {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .items-table td.desc-col,
      .items-table td.desc-col .item-desc-body,
      .items-table td.desc-col .item-desc-line,
      .items-table th.desc-col,
      .subject-bar,
      .doc-lines-shell {
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
