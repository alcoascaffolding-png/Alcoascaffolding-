import { launchBrowser } from "./chromium";
import { quotationPdfStyles } from "./quotation-pdf-styles.js";
import {
  getQuotationCompanyName,
  getQuotationCompanyEmail,
  getQuotationLogoDataUri,
  getQuotationHeaderDataUri,
  getQuotationFooterDataUri,
} from "@/lib/quotation-brand";

/** Company bank details printed on every quotation PDF. */
const DEFAULT_QUOTATION_BANK_DETAILS = {
  accountName: "Alcoa aluminium scaffolding L.L.C - S.P.C",
  bankName: "ADCB, Musaffah branch, Abu Dhabi",
  accountNumber: "14262375920001",
  iban: "AE42 0030 0142 6237 5920 001",
};

/** Quotation PDF always uses company bank details (not per-quotation DB overrides). */
function getQuotationPdfBankDetails() {
  return { ...DEFAULT_QUOTATION_BANK_DETAILS };
}

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** PDF table numbers — always 2 decimal places (e.g. 85.00 not 85.000). */
function formatPdfAmount(value) {
  return Number(value || 0).toFixed(2);
}

/** Line total including VAT for PDF amount column. */
function itemAmountWithVat(item, defaultVatPct = 5) {
  const taxable = Number(item.taxableAmount ?? item.subtotal ?? 0);
  const vat = Number(item.vatAmount ?? 0);
  if (vat > 0) return taxable + vat;
  const pct = Number(item.vatPercentage ?? defaultVatPct ?? 5);
  return taxable * (1 + pct / 100);
}

function numberToWords(num) {
  if (!num || num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 1000000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    return n.toLocaleString();
  }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart) + " Dirhams";
  if (decPart > 0) result += ` and ${convert(decPart)} Fils`;
  return result;
}

/** A4 height in CSS px (~96dpi), used to detect overflow on a `.pdf-page` probe. */
const QUOTATION_PDF_A4_HEIGHT_PX = (297 / 25.4) * 96;
const QUOTATION_PDF_PAGE_FIT_TOLERANCE_PX = 2;
/** Extra gap required between body content and footer (avoids clipped terms). */
const QUOTATION_PDF_FOOTER_CLEARANCE_PX = 4;

/**
 * Wrap probe/final markup in a single A4 sheet (same flex layout as print output).
 * @param {{ head: string; body: string; foot: string; first?: boolean; pageBreak?: boolean }} parts
 */
function wrapQuotationPdfPage({
  head,
  body,
  foot,
  first = false,
  pageBreak = true,
  fillClass = "pdf-page-fill",
}) {
  const firstCls = first ? "first-page " : "";
  const breakCls = pageBreak ? "page-break " : "";
  return `
      <section class="pdf-page page ${firstCls}${breakCls}" data-pdf-page>
        ${head}
        <div class="${fillClass} content">${body}</div>
        ${foot}
      </section>`;
}

/**
 * @param {import("playwright").Page} playwrightPage
 * @param {string} bodyHtml single section containing `[data-pdf-page]`
 */
async function quotationPdfPageProbeFits(playwrightPage, bodyHtml) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation measure</title>
  <style>${quotationPdfStyles()}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
  await playwrightPage.setContent(html, { waitUntil: "domcontentloaded" });
  return playwrightPage.evaluate(
    ([limit, tol, footerGap]) => {
      const page = document.querySelector("[data-pdf-page]");
      if (!page) return false;
      const pageH = page.getBoundingClientRect().height;
      if (pageH > limit + tol) return false;

      const foot = page.querySelector(".pdf-running-foot");
      const footTop = foot
        ? foot.getBoundingClientRect().top
        : page.getBoundingClientRect().bottom;
      const maxContentBottom = footTop - footerGap;

      const fill = page.querySelector(".pdf-page-fill, .pdf-page-fill-closing");
      if (fill) {
        if (fill.scrollHeight > fill.clientHeight + tol) return false;
        for (const child of fill.children) {
          const bottom = child.getBoundingClientRect().bottom;
          if (bottom > maxContentBottom) return false;
        }
      }

      const closing = page.querySelector(".closing-tail-flow");
      if (closing && closing.getBoundingClientRect().bottom > maxContentBottom) return false;

      const head = page.querySelector(".pdf-running-head");
      if (head && foot) {
        const headBottom = head.getBoundingClientRect().bottom;
        if (footTop < headBottom - tol) return false;
      }
      return true;
    },
    [
      QUOTATION_PDF_A4_HEIGHT_PX,
      QUOTATION_PDF_PAGE_FIT_TOLERANCE_PX,
      QUOTATION_PDF_FOOTER_CLEARANCE_PX,
    ]
  );
}

/** Split stored terms into one array entry per numbered line. */
function splitTermsIntoLines(termsText) {
  const normalized = String(termsText || "")
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n");
  return normalized
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * @param {object[]} segBlocks blocks already on segment
 * @param {string[]} lines all term lines
 * @param {number} offset start index in lines
 * @param {boolean} showTitle
 */
function buildTermsTrialBlock(segBlocks, lines, offset, lineCount, showTitle) {
  return [
    ...segBlocks,
    {
      type: "terms",
      lines: lines.slice(offset, offset + lineCount),
      showTitle: lineCount > 0 && showTitle,
    },
  ];
}

/** Max term lines that fit; binary search + trim until footer clearance passes. */
async function maxTermLinesThatFit(playwrightPage, probeBlocks, segBlocks, lines, offset, showTitle, onItemsPage) {
  const remaining = lines.length - offset;
  if (remaining < 1) return 0;

  let lo = 1;
  let hi = remaining;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const trial = buildTermsTrialBlock(segBlocks, lines, offset, mid, showTitle);
    if (await probeBlocks(trial, onItemsPage)) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  while (best > 0) {
    const trial = buildTermsTrialBlock(segBlocks, lines, offset, best, showTitle);
    if (await probeBlocks(trial, onItemsPage)) break;
    best--;
  }

  return best;
}

async function maxRowsThatFit(playwrightPage, loInclusive, hiInclusive, buildHtmlForCount) {
  let lo = loInclusive;
  let hi = hiInclusive;
  let best = loInclusive - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const ok = await quotationPdfPageProbeFits(playwrightPage, await buildHtmlForCount(mid));
    if (ok) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

/** Binary-search max rows that fit (fewer Chromium loads than linear scan). */
async function countRowsThatFit(playwrightPage, maxCount, buildHtmlForCount) {
  if (maxCount < 1) return 0;
  const best = await maxRowsThatFit(playwrightPage, 1, maxCount, buildHtmlForCount);
  return Math.max(best, 0);
}

/** Drop empty item pages (can appear after bad splits). */
function sanitizeItemPages(pages) {
  return pages.filter((p) => p.chunk && p.chunk.length > 0);
}

/**
 * Split line items into pages by measuring real DOM height (variable row heights).
 * @param {import("playwright").Page} playwrightPage
 * @param {object} layout layout from {@link buildQuotationPdfLayout}
 * @returns {Promise<{ chunk: unknown[]; startIndex: number }[]>}
 */
export async function computeQuotationItemPages(playwrightPage, layout) {
  const { items, rowHtmls, probeFirstNoTotals, probeFirstWithTotals, probeContNoTotals, probeContWithTotals } =
    layout;
  const n = items.length;
  if (n === 0) return [{ chunk: [], startIndex: 0 }];

  const FALLBACK_PER_PAGE = 5;

  const chunks = [];
  let idx = 0;

  while (idx < n) {
    const rem = n - idx;
    const sliceRows = (count) => rowHtmls.slice(idx, idx + count).join("");
    const isOpening = chunks.length === 0;

    if (isOpening) {
      const allFitFirstWithTotals = await quotationPdfPageProbeFits(
        playwrightPage,
        probeFirstWithTotals(sliceRows(rem))
      );
      if (allFitFirstWithTotals) {
        chunks.push({ chunk: items.slice(idx, idx + rem), startIndex: idx });
        break;
      }
      if (rem === 1) {
        chunks.push({ chunk: items.slice(idx, idx + 1), startIndex: idx });
        break;
      }
      let maxMid = await countRowsThatFit(playwrightPage, rem, async (c) => probeFirstNoTotals(sliceRows(c)));
      if (maxMid < 1) maxMid = 1;
      chunks.push({ chunk: items.slice(idx, idx + maxMid), startIndex: idx });
      idx += maxMid;
      continue;
    }

    const allFitContWithTotals = await quotationPdfPageProbeFits(
      playwrightPage,
      probeContWithTotals(sliceRows(rem))
    );
    if (allFitContWithTotals) {
      chunks.push({ chunk: items.slice(idx, idx + rem), startIndex: idx });
      break;
    }
    if (rem === 1) {
      chunks.push({ chunk: items.slice(idx, idx + 1), startIndex: idx });
      break;
    }
    let maxMid = await countRowsThatFit(playwrightPage, rem, async (c) => probeContNoTotals(sliceRows(c)));
    if (maxMid < 1) maxMid = 1;
    if (maxMid > rem) maxMid = rem;
    chunks.push({ chunk: items.slice(idx, idx + maxMid), startIndex: idx });
    idx += maxMid;
  }

  if (!chunks.length) return [{ chunk: [], startIndex: 0 }];

  const totalRows = chunks.reduce((a, p) => a + p.chunk.length, 0);
  if (totalRows !== n) {
    const out = [];
    let cursor = 0;
    while (cursor < n) {
      const chunk = items.slice(cursor, cursor + FALLBACK_PER_PAGE);
      out.push({ chunk, startIndex: cursor });
      cursor += chunk.length;
    }
    return out;
  }

  return sanitizeItemPages(chunks);
}

/**
 * @param {{ type: string; lines?: string[]; html?: string }} block
 * @returns {string}
 */
function renderClosingBlockHtml(block) {
  if (block.type === "terms") {
    const lines = block.lines || [];
    const title = block.showTitle
      ? '<div class="terms-plain-title">Terms &amp; Conditions</div>'
      : "";
    const body = lines.map((line) => line.replace(/</g, "&lt;")).join("<br>");
    return `<div class="lower-grid"><div class="terms-plain">${title}<div class="terms-plain-body">${body}</div></div></div>`;
  }
  return block.html || "";
}

/**
 * @param {{ html?: string; type?: string; lines?: string[]; showTitle?: boolean }[]} blocks
 */
function renderClosingTailHtml(blocks) {
  if (!blocks.length) return "";
  const inner = blocks.map((b) => renderClosingBlockHtml(b)).join("");
  return `<div class="closing-tail-flow">${inner}</div>`;
}


/**
 * @param {import("playwright").Page} playwrightPage
 * @param {(blocks: object[]) => string} buildItemsProbeHtml
 * @param {(blocks: object[]) => string} buildClosingProbeHtml
 * @param {object[]} sourceBlocks
 */
async function flowClosingBlocks(
  playwrightPage,
  buildItemsProbeHtml,
  buildClosingProbeHtml,
  sourceBlocks,
  { closingPagesOnly = false } = {}
) {
  const segments = [{ blocks: [], onItemsPage: !closingPagesOnly }];

  const probeBlocks = async (blocks, onItemsPage) => {
    const html = onItemsPage ? buildItemsProbeHtml(blocks) : buildClosingProbeHtml(blocks);
    return quotationPdfPageProbeFits(playwrightPage, html);
  };

  for (const block of sourceBlocks) {
    if (block.type === "terms") {
      const lines = block.lines || [];
      let offset = 0;
      let showTitle = true;

      while (offset < lines.length) {
        let seg = segments[segments.length - 1];
        let linesThisPage = await maxTermLinesThatFit(
          playwrightPage,
          probeBlocks,
          seg.blocks,
          lines,
          offset,
          showTitle,
          seg.onItemsPage
        );

        if (linesThisPage < 1) {
          if (seg.blocks.length > 0) {
            segments.push({ blocks: [], onItemsPage: false });
            continue;
          }
          linesThisPage = 1;
        }

        seg = segments[segments.length - 1];
        seg.blocks.push({
          type: "terms",
          lines: lines.slice(offset, offset + linesThisPage),
          showTitle,
        });
        offset += linesThisPage;
        showTitle = false;

        if (offset < lines.length) {
          segments.push({ blocks: [], onItemsPage: false });
        }
      }
      continue;
    }

    let placed = false;
    while (!placed) {
      const seg = segments[segments.length - 1];
      const trial = [...seg.blocks, block];

      if (await probeBlocks(trial, seg.onItemsPage)) {
        seg.blocks = trial;
        placed = true;
      } else if (seg.blocks.length > 0) {
        segments.push({ blocks: [], onItemsPage: false });
      } else {
        seg.blocks = trial;
        placed = true;
      }
    }
  }

  return segments;
}

/**
 * Split item rows so the last page fits; then flow terms/notes/bank/sign block-by-block.
 * @param {import("playwright").Page} playwrightPage
 * @param {ReturnType<typeof buildQuotationPdfLayout>} layout
 * @param {{ chunk: unknown[]; startIndex: number }[]} itemPages
 */
export async function resolveQuotationPdfPagePlan(playwrightPage, layout, itemPages) {
  const { items, rowHtmls, probeLastItemsPage, probeClosingOnlyPage, buildClosingBlocks } = layout;
  const pages = sanitizeItemPages(
    itemPages.length ? [...itemPages.map((p) => ({ ...p }))] : []
  );
  if (!pages.length) {
    pages.push({ chunk: [], startIndex: 0 });
  }

  const buildClosingProbeHtml = (blocks) => probeClosingOnlyPage(renderClosingTailHtml(blocks));

  const lastIdx = pages.length - 1;
  const isFirst = lastIdx === 0;
  const last = pages[lastIdx];
  const tbodyRowsHtml = rowHtmls
    .slice(last.startIndex, last.startIndex + last.chunk.length)
    .join("");

  const buildItemsProbeHtml = (blocks) =>
    probeLastItemsPage(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks));

  const segments = await flowClosingBlocks(
    playwrightPage,
    buildItemsProbeHtml,
    buildClosingProbeHtml,
    buildClosingBlocks()
  );

  const itemsSegment = segments.find((s) => s.onItemsPage) || { blocks: [] };
  let lastPageClosingBlocks = itemsSegment.blocks;
  let followUpClosingPages = segments
    .filter((s) => !s.onItemsPage && s.blocks.length > 0)
    .map((s) => s.blocks);

  const buildItemsClosingProbe = (blocks) =>
    probeLastItemsPage(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks));

  while (
    lastPageClosingBlocks.length > 0 &&
    !(await quotationPdfPageProbeFits(playwrightPage, buildItemsClosingProbe(lastPageClosingBlocks)))
  ) {
    const termsBlock = lastPageClosingBlocks.find((b) => b.type === "terms");
    if (!termsBlock || termsBlock.lines.length === 0) break;

    const overflow = termsBlock.lines.pop();
    if (!overflow) break;

    const carry = {
      type: "terms",
      lines: [overflow],
      showTitle: false,
    };
    if (
      followUpClosingPages.length > 0 &&
      followUpClosingPages[0][0]?.type === "terms"
    ) {
      followUpClosingPages[0][0].lines.unshift(overflow);
    } else {
      followUpClosingPages.unshift([carry]);
    }

    if (termsBlock.lines.length === 0) {
      lastPageClosingBlocks = lastPageClosingBlocks.filter((b) => b.type !== "terms");
    }
  }

  return {
    itemPages: pages,
    lastPageClosingBlocks,
    followUpClosingPages,
  };
}

/**
 * Shared layout fragments for measurement + final HTML (keeps probes in sync with print markup).
 * @param {Record<string, unknown>} quotation
 * @param {{ logoDataUri?: string; headerDataUri?: string; footerDataUri?: string }} options
 */
function buildQuotationPdfLayout(quotation, options = {}) {
  const { logoDataUri = "", headerDataUri = "", footerDataUri = "", docKind = "quotation" } =
    options;
  const isSalesOrder = docKind === "salesOrder";
  const isSalesInvoice = docKind === "salesInvoice";
  const {
    quoteNumber = "",
    customerName = "",
    customerAddress = "",
    customerPhone = "",
    customerTRN = "",
    contactPersonName = "",
    subject = "",
    salesExecutive = "",
    preparedBy = "",
    paymentTerms = "Cash/CDC",
    deliveryTerms = "7-10 days from date of order",
    status = "",
    paymentStatus = "",
    paidAmount = 0,
    balance,
    items = [],
    subtotal = 0,
    deliveryCharges = 0,
    installationCharges = 0,
    pickupCharges = 0,
    discount = 0,
    discountType = "fixed",
    vatPercentage = 5,
    vatAmount = 0,
    totalAmount = 0,
    currency = "AED",
    notes = "",
    termsAndConditions = "",
    quoteDate,
    validUntil,
  } = quotation;

  const companyName = getQuotationCompanyName();
  const companyEmail = getQuotationCompanyEmail();
  const companyTRN = process.env.COMPANY_TRN || "100123456700003";
  const safeSubject =
    subject ||
    (isSalesOrder
      ? `Sales Order ${quoteNumber}`
      : isSalesInvoice
        ? `Sales Invoice ${quoteNumber}`
        : `Quotation ${quoteNumber}`);
  const docTitle = isSalesOrder
    ? "SALES ORDER"
    : isSalesInvoice
      ? "SALES INVOICE"
      : "QUOTATION";
  const displayBalance =
    balance != null
      ? Number(balance)
      : Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0));
  const rightMetaRows = isSalesOrder
    ? `
              <tr><td class="mini-label">Order No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Order Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Status</td><td>${String(status || "-").replace(/_/g, " ")}</td></tr>
              <tr><td class="mini-label">Delivery Date</td><td>${formatDate(validUntil)}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>`
    : isSalesInvoice
      ? `
              <tr><td class="mini-label">Invoice No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Invoice Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Due Date</td><td>${formatDate(validUntil)}</td></tr>
              <tr><td class="mini-label">Payment Status</td><td>${String(paymentStatus || status || "-").replace(/_/g, " ")}</td></tr>
              <tr><td class="mini-label">Paid</td><td>${formatPdfAmount(paidAmount)}</td></tr>
              <tr><td class="mini-label">Balance</td><td>${formatPdfAmount(displayBalance)}</td></tr>`
      : `
              <tr><td class="mini-label">Quotation No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Sales Executive</td><td>${salesExecutive || preparedBy || "-"}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>
              <tr><td class="mini-label">Delivery Terms</td><td>${deliveryTerms || "-"}</td></tr>`;
  const pdfBank = getQuotationPdfBankDetails();
  const headerImageBlock = headerDataUri
    ? `<img class="header-art" src="${headerDataUri}" alt="Quotation header" crossorigin="anonymous" />`
    : `<div class="header-fallback">${logoDataUri ? `<img class="header-logo-fallback" src="${logoDataUri}" alt="" />` : ""}<div class="header-fallback-title">${companyName.toUpperCase()}</div></div>`;
  const footerImageBlock = footerDataUri
    ? `<img class="footer-art" src="${footerDataUri}" alt="Quotation footer" crossorigin="anonymous" />`
    : `<div class="footer-fallback">For inquiries contact ${companyEmail}.</div>`;

  const watermarkBlock = logoDataUri
    ? `<div class="pdf-page-watermark" aria-hidden="true"><img src="${logoDataUri}" alt="" crossorigin="anonymous" /></div>`
    : "";

  const defaultTerms = `
1. All prices quoted are in AED (UAE Dirhams) unless otherwise stated.
2. This quotation is valid for 30 days from the date of issue.
3. Payment terms: ${paymentTerms}.
4. Delivery terms: ${deliveryTerms}.
5. Equipment remains the property of ${companyName} until full payment is received.
6. The client is responsible for securing the equipment during the rental period.
7. Any damage to equipment will be charged to the client.
8. ${companyName} reserves the right to withdraw or revise this quotation without prior notice.`;

  const discountValue =
    discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const beforeVAT =
    subtotal +
    Number(deliveryCharges || 0) +
    Number(installationCharges || 0) +
    Number(pickupCharges || 0) -
    Number(discountValue || 0);
  const displaySubtotal = Math.max(0, Number(beforeVAT || 0));

  const renderRows = (pageItems, start) =>
    pageItems
      .map(
        (item, idx) => `
      <tr>
        <td class="center">${start + idx + 1}</td>
        <td class="desc-col">
          <div class="item-title">${item.equipmentType || ""}</div>
          ${item.description ? `<div class="item-sub">${item.description}</div>` : ""}
          ${item.specifications ? `<div class="item-sub">${item.specifications}</div>` : ""}
          ${item.size ? `<div class="item-sub">Size: ${item.size}</div>` : ""}
        </td>
        <td class="center">${formatPdfAmount(item.weight)}</td>
        <td class="center">${formatPdfAmount(item.cbm)}</td>
        <td class="center">${item.quantity || 0} ${item.unit || "Nos"}</td>
        <td class="right">${formatPdfAmount(item.ratePerUnit)}</td>
        <td class="right">${formatPdfAmount(item.taxableAmount ?? item.subtotal)}</td>
        <td class="right">${formatPdfAmount(item.vatAmount)}</td>
        <td class="right strong">${formatPdfAmount(itemAmountWithVat(item, vatPercentage))}</td>
      </tr>`
      )
      .join("");

  const renderTotalsTfoot = () => {
    const invoicePaymentRows = isSalesInvoice
      ? `
        <tr>
          <td colspan="2" class="totals-spacer"></td>
          <td colspan="4" class="totals-label">Paid</td>
          <td colspan="3" class="totals-value right">${formatPdfAmount(paidAmount)}</td>
        </tr>
        <tr>
          <td colspan="2" class="totals-spacer"></td>
          <td colspan="4" class="totals-label">Balance</td>
          <td colspan="3" class="totals-value right strong">${formatPdfAmount(displayBalance)}</td>
        </tr>`
      : "";
    return `
      <tfoot class="items-totals-foot">
        <tr>
          <td colspan="2" class="totals-spacer"></td>
          <td colspan="4" class="totals-label">Subtotal</td>
          <td colspan="3" class="totals-value right strong">${formatPdfAmount(displaySubtotal)}</td>
        </tr>
        <tr>
          <td colspan="2" class="totals-spacer"></td>
          <td colspan="4" class="totals-label">VAT (${vatPercentage}%)</td>
          <td colspan="3" class="totals-value right">${formatPdfAmount(vatAmount)}</td>
        </tr>
        <tr class="totals-grand">
          <td colspan="2" class="totals-spacer"></td>
          <td colspan="4" class="totals-label totals-label-total">Total<br /><span class="totals-currency">(${currency})</span></td>
          <td colspan="3" class="totals-value right strong">${formatPdfAmount(totalAmount)}</td>
        </tr>${invoicePaymentRows}
      </tfoot>`;
  };

  const renderTable = (rows, withTotals = false) => `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:3%;">SN</th>
          <th class="desc-col" style="width:52%;">Description of Goods</th>
          <th style="width:5%;">Wt (KG)</th>
          <th style="width:4%;">CBM</th>
          <th style="width:5%;">Qty</th>
          <th style="width:9%;">Rate<br>(AED)</th>
          <th style="width:8%;">Taxable Amount</th>
          <th style="width:7%;">VAT (${vatPercentage}%)<br>AMOUNT</th>
          <th style="width:7%;">Amount<br>(AED)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      ${withTotals ? renderTotalsTfoot() : ""}
    </table>`;

  const docHeadingBlock = `
        <div class="doc-heading">
          <div class="doc-title">${docTitle}</div>
          <div class="doc-trn"><strong>TRN:</strong> ${companyTRN}</div>
        </div>`;

  const runningHeadBlock = `
        <div class="pdf-running-head header">
          <div class="top-brand">${headerImageBlock}</div>
          ${docHeadingBlock}
        </div>`;

  const runningFootBlock = `
        <div class="pdf-running-foot footer">
          <div class="footer-main">${footerImageBlock}</div>
        </div>`;

  const bankSignaturesHtml = `
          <div class="bank-signatures-wrap">
            <div class="bank-title-main">BANK DETAILS</div>
            <div class="sign-box sign-box-company">
              <div>For ALCOA ALUMINIUM SCAFFOLDING</div>
              <div class="sign-line"></div>
            </div>
            <div class="bank-table-wrap">
              <table class="bank-table-full">
                <tr><td class="mini-label">Bank details</td><td>${pdfBank.accountName}</td></tr>
                <tr><td class="mini-label">Bank name</td><td>${pdfBank.bankName}</td></tr>
                <tr><td class="mini-label">Account no</td><td>${pdfBank.accountNumber}</td></tr>
                <tr><td class="mini-label">IBAN</td><td>${pdfBank.iban}</td></tr>
              </table>
            </div>
            <div class="sign-box sign-box-customer">
              <div>CUSTOMER'S SIGNATURE</div>
              <div class="sign-line"></div>
            </div>
          </div>`;

  const closingTailHtml = `
        <div class="closing-tail-flow">
          <div class="lower-grid">
            <div class="terms-plain">
              <div class="terms-plain-title">Terms &amp; Conditions</div>
              <div class="terms-plain-body">${(termsAndConditions || defaultTerms).replace(/\n/g, "<br>")}</div>
            </div>
          </div>
          ${notes ? `<div class="notes-plain"><strong>Notes:</strong> ${notes.replace(/\n/g, "<br>")}</div>` : ""}
          ${bankSignaturesHtml}
        </div>`;

  function buildClosingBlocks() {
    const termsText = (termsAndConditions || defaultTerms).trim();
    const lines = splitTermsIntoLines(termsText);
    const blocks = [{ type: "terms", lines }];
    if (notes) {
      blocks.push({
        type: "notes",
        html: `<div class="notes-plain"><strong>Notes:</strong> ${notes.replace(/\n/g, "<br>")}</div>`,
      });
    }
    blocks.push({
      type: "bank-signatures",
      html: bankSignaturesHtml,
    });
    return blocks;
  }

  const headGridHtml = `
        <div class="head-grid">
          <div class="box">
            <table class="mini-table head-mini-table">
              <tr><td class="mini-label">Customer Name</td><td>${customerName || "-"}</td></tr>
              <tr><td class="mini-label">Address</td><td>${customerAddress || "-"}</td></tr>
              <tr><td class="mini-label">Mobile No</td><td>${customerPhone || "-"}</td></tr>
              <tr><td class="mini-label">TRN</td><td>${customerTRN || "-"}</td></tr>
              <tr><td class="mini-label">Contact Person</td><td>${contactPersonName || "-"}</td></tr>
            </table>
          </div>
          <div class="box">
            <table class="mini-table head-mini-table">
              ${rightMetaRows}
            </table>
          </div>
        </div>`;

  const rowHtmls = items.map((item, gi) => renderRows([item], gi).trim());

  /* Totals probes omit closingTailHtml — terms/bank/signatures follow in the same section and may
   * paginate; including them in height checks forced too-small row chunks (e.g. 2 + 1 items). */
  const probeFirstNoTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: true,
      body: `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml)}
        </div>`,
    });

  const probeFirstWithTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: true,
      body: `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml, true)}
        </div>`,
    });

  const probeContNoTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      body: renderTable(tbodyRowsHtml),
    });

  const probeContWithTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      body: renderTable(tbodyRowsHtml, true),
    });

  const probeLastItemsPage = (isFirst, tbodyRowsHtml, closingHtml = "") => {
    const firstBody = `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml, true)}
        </div>`;
    return wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirst,
      body: `${isFirst ? firstBody : renderTable(tbodyRowsHtml, true)}${closingHtml}`,
    });
  };

  const probeClosingOnlyPage = (closingHtml = "") =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      fillClass: "pdf-page-fill pdf-page-fill-closing",
      body: closingHtml,
    });

  function buildItemSectionsHtml(itemPages, lastPageClosingBlocks, followUpClosingPages) {
    const pages = sanitizeItemPages(itemPages);
    return pages
      .map(({ chunk, startIndex }, pageIndex) => {
        const isFirst = pageIndex === 0;
        const isLastItemsPage = pageIndex === pages.length - 1;
        const closingHtml =
          isLastItemsPage && lastPageClosingBlocks.length
            ? renderClosingTailHtml(lastPageClosingBlocks)
            : "";
        const pageBreakAfter = !isLastItemsPage || followUpClosingPages.length > 0;
        const body = isFirst
          ? `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(renderRows(chunk, startIndex), isLastItemsPage)}
        </div>
        ${closingHtml}`
          : `${renderTable(renderRows(chunk, startIndex), isLastItemsPage)}${closingHtml}`;
        return `
      <section class="pdf-page page ${isFirst ? "first-page " : ""}${pageBreakAfter ? "page-break" : ""}" data-pdf-page>
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill content">${body}</div>
        ${runningFootBlock}
      </section>`;
      })
      .join("");
  }

  function buildFollowUpClosingSections(blocksPerPage) {
    return blocksPerPage
      .filter((blocks) => blocks && blocks.length > 0)
      .map((blocks, pageIndex, arr) => {
        const pageBreakAfter = pageIndex < arr.length - 1;
        const closingHtml = renderClosingTailHtml(blocks);
        if (!closingHtml.trim()) return "";
        return `
      <section class="pdf-page page ${pageBreakAfter ? "page-break" : ""}" data-pdf-page>
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill pdf-page-fill-closing content">${closingHtml}</div>
        ${runningFootBlock}
      </section>`;
      })
      .join("");
  }

  function buildCompleteHtml(pagePlan) {
    const itemPages = Array.isArray(pagePlan) ? pagePlan : pagePlan.itemPages;
    const lastPageClosingBlocks = Array.isArray(pagePlan)
      ? []
      : pagePlan.lastPageClosingBlocks || [];
    const followUpClosingPages = Array.isArray(pagePlan) ? [] : pagePlan.followUpClosingPages || [];
    const itemSections = buildItemSectionsHtml(itemPages, lastPageClosingBlocks, followUpClosingPages);
    const closingSections = buildFollowUpClosingSections(followUpClosingPages);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quoteNumber}</title>
  <style>${quotationPdfStyles()}</style>
</head>
<body>
  ${itemSections}${closingSections}
</body>
</html>`;
  }

  return {
    items,
    rowHtmls,
    probeFirstNoTotals,
    probeFirstWithTotals,
    probeContNoTotals,
    probeContWithTotals,
    probeLastItemsPage,
    probeClosingOnlyPage,
    buildClosingBlocks,
    buildCompleteHtml,
  };
}

function buildQuotationHTML(quotation, options = {}) {
  const layout = buildQuotationPdfLayout(quotation, options);
  const { items } = layout;
  let itemPages = options.itemPages;
  if (!Array.isArray(itemPages) || itemPages.length === 0) {
    itemPages = [];
    if (!items.length) {
      itemPages.push({ chunk: [], startIndex: 0 });
    } else {
      const FALLBACK_ITEMS_PER_PAGE = 6;
      let cursor = 0;
      let startIndex = 0;
      while (cursor < items.length) {
        const chunk = items.slice(cursor, cursor + FALLBACK_ITEMS_PER_PAGE);
        itemPages.push({ chunk, startIndex });
        cursor += chunk.length;
        startIndex += chunk.length;
      }
    }
  }
  return layout.buildCompleteHtml({ itemPages, lastPageClosingBlocks: [], followUpClosingPages: [] });
}

/**
 * Generate a PDF buffer for a quotation
 * @param {Object} quotation - Mongoose document or plain object
 * @returns {Promise<Buffer>} PDF buffer
 */
async function waitForDocumentImages(page) {
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.src.startsWith("data:"))
        .map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) resolve();
              else {
                img.addEventListener("load", resolve, { once: true });
                img.addEventListener("error", resolve, { once: true });
              }
            })
        )
    )
  );
}

function isBrowserClosedError(err) {
  const msg = String(err?.message || err || "");
  return /has been closed|Target page, context or browser/i.test(msg);
}

async function renderQuotationPdfBuffer(quotation, brandOpts) {
  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setViewportSize({ width: 794, height: 1123 });

    const layout = buildQuotationPdfLayout(quotation, brandOpts);
    const itemPages = await computeQuotationItemPages(page, layout);
    const pagePlan = await resolveQuotationPdfPagePlan(page, layout, itemPages);
    const html = layout.buildCompleteHtml(pagePlan);

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await waitForDocumentImages(page);
    await page.evaluate(() => document.fonts.ready);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

export async function generateQuotationPDF(quotation, pdfOptions = {}) {
  const logoDataUri = getQuotationLogoDataUri();
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const brandOpts = { logoDataUri, headerDataUri, footerDataUri, ...pdfOptions };

  try {
    return await renderQuotationPdfBuffer(quotation, brandOpts);
  } catch (err) {
    if (!isBrowserClosedError(err)) throw err;
    console.warn("[PDF] Browser closed during generation, retrying once:", err?.message);
    return await renderQuotationPdfBuffer(quotation, brandOpts);
  }
}
