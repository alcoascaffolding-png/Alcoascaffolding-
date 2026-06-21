import { launchBrowser } from "./chromium";
import { quotationPdfStyles, quotationPdfProbeStyles } from "./quotation-pdf-styles.js";
import {
  getQuotationCompanyName,
  getQuotationCompanyEmail,
  getQuotationCompanyTRN,
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** PDF table numbers — always 2 decimal places (e.g. 85.00). */
function formatPdfAmount(value) {
  return Number(value || 0).toFixed(2);
}

/** Comma-grouped amounts for summary totals only (e.g. 3,21,323.32). */
function formatPdfSummaryAmount(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Line total including VAT for PDF amount column. */
function itemAmountWithVat(item, defaultVatPct = 5) {
  const taxable = Number(item.taxableAmount ?? item.subtotal ?? 0);
  const vat = Number(item.vatAmount ?? 0);
  if (vat > 0) return taxable + vat;
  const pct = Number(item.vatPercentage ?? defaultVatPct ?? 5);
  return taxable * (1 + pct / 100);
}

function formatAmountInWords(num) {
  const amount = Number(num || 0);
  if (!amount || amount === 0) return "UAE Dirham Zero Dirhams Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convert(n % 100) : "");
    if (n < 1000000)
      return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 1000000000)
      return (
        convert(Math.floor(n / 1000000)) + " Million" + (n % 1000000 !== 0 ? " " + convert(n % 1000000) : "")
      );
    return amount.toLocaleString();
  }

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);
  let result = `UAE Dirham ${convert(intPart)} Dirham${intPart === 1 ? "" : "s"}`;
  if (decPart > 0) result += ` And ${convert(decPart)} Fil${decPart === 1 ? "" : "s"}`;
  return `${result} Only`;
}

/** A4 viewport at 96 CSS dpi (210mm × 297mm). */
const PDF_VIEWPORT_WIDTH = 794;
const PDF_VIEWPORT_HEIGHT = 1123;
/** Device pixel ratio for print PDF (3× ≈ 288dpi raster detail; HTML text stays vector in Chrome PDF). */
const PDF_DEVICE_SCALE_FACTOR = Number(process.env.PDF_DEVICE_SCALE_FACTOR) || 4;
const QUOTATION_PDF_A4_HEIGHT_PX = PDF_VIEWPORT_HEIGHT;
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
  <style>${quotationPdfProbeStyles()}</style>
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

      const shell = page.querySelector(".doc-lines-shell");
      if (shell) {
        const shellBottom = shell.getBoundingClientRect().bottom;
        if (shellBottom > maxContentBottom + tol) return false;
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

/** If totals were forced onto a page that cannot fit them, move totals to the next page. */
async function ensureLastPageTotalsFit(playwrightPage, layout, pages) {
  if (!pages.length) return;
  const last = pages[pages.length - 1];
  if (!last?.chunk?.length || last.totalsSeparate) return;

  const lastIdx = pages.length - 1;
  const isFirst = lastIdx === 0;
  const tbodyRowsHtml = layout.rowHtmls
    .slice(last.startIndex, last.startIndex + last.chunk.length)
    .join("");

  const fitsInline = () =>
    quotationPdfPageProbeFits(
      playwrightPage,
      isFirst
        ? layout.probeFirstInlineTotals(tbodyRowsHtml)
        : layout.probeContInlineTotals(tbodyRowsHtml)
    );
  const fitsTfoot = () =>
    quotationPdfPageProbeFits(
      playwrightPage,
      isFirst
        ? layout.probeFirstWithTotals(tbodyRowsHtml)
        : layout.probeContWithTotals(tbodyRowsHtml)
    );

  if (last.totalsInlineSeparate) {
    if (!(await fitsInline())) {
      last.totalsInlineSeparate = false;
      last.totalsSeparate = true;
    }
    return;
  }

  if (!(await fitsTfoot())) {
    if (await fitsInline()) {
      last.totalsInlineSeparate = true;
    } else {
      last.totalsSeparate = true;
      last.totalsInlineSeparate = false;
    }
  }
}

async function probeItemsPlusTotalsFit(playwrightPage, rem, isOpening, sliceRows, layout) {
  const {
    probeFirstInlineTotals,
    probeContInlineTotals,
    probeFirstWithTotals,
    probeContWithTotals,
  } = layout;
  const probeInlineTotals = (count) =>
    quotationPdfPageProbeFits(
      playwrightPage,
      isOpening ? probeFirstInlineTotals(sliceRows(count)) : probeContInlineTotals(sliceRows(count))
    );
  const probeWithTotals = (count) =>
    quotationPdfPageProbeFits(
      playwrightPage,
      isOpening ? probeFirstWithTotals(sliceRows(count)) : probeContWithTotals(sliceRows(count))
    );
  if (await probeWithTotals(rem)) return true;
  if (await probeInlineTotals(rem)) return true;
  return false;
}

/**
 * Split line items into pages by measuring real DOM height (variable row heights).
 * @param {import("playwright").Page} playwrightPage
 * @param {object} layout layout from {@link buildQuotationPdfLayout}
 * @returns {Promise<{ chunk: unknown[]; startIndex: number; totalsSeparate?: boolean; totalsInlineSeparate?: boolean }[]>}
 */
export async function computeQuotationItemPages(playwrightPage, layout) {
  const {
    items,
    rowHtmls,
    probeFirstNoTotals,
    probeFirstWithTotals,
    probeContNoTotals,
    probeContWithTotals,
    probeFirstInlineTotals,
    probeContInlineTotals,
  } = layout;
  const n = items.length;
  if (n === 0) return [{ chunk: [], startIndex: 0 }];

  const FALLBACK_PER_PAGE = 5;

  const chunks = [];
  let idx = 0;

  while (idx < n) {
    const rem = n - idx;
    const sliceRows = (count) => rowHtmls.slice(idx, idx + count).join("");
    const isOpening = chunks.length === 0;
    const probeNoTotals = (count) =>
      quotationPdfPageProbeFits(
        playwrightPage,
        isOpening ? probeFirstNoTotals(sliceRows(count)) : probeContNoTotals(sliceRows(count))
      );
    const probeWithTotals = (count) =>
      quotationPdfPageProbeFits(
        playwrightPage,
        isOpening ? probeFirstWithTotals(sliceRows(count)) : probeContWithTotals(sliceRows(count))
      );
    const probeInlineTotals = (count) =>
      quotationPdfPageProbeFits(
        playwrightPage,
        isOpening ? probeFirstInlineTotals(sliceRows(count)) : probeContInlineTotals(sliceRows(count))
      );
    const probeNoTotalsForCount = (count) =>
      isOpening ? probeFirstNoTotals(sliceRows(count)) : probeContNoTotals(sliceRows(count));

    if (await probeWithTotals(rem)) {
      chunks.push({ chunk: items.slice(idx, idx + rem), startIndex: idx });
      break;
    }

    if (await probeNoTotals(rem)) {
      if (await probeInlineTotals(rem)) {
        chunks.push({
          chunk: items.slice(idx, idx + rem),
          startIndex: idx,
          totalsInlineSeparate: true,
          totalsSeparate: false,
        });
        break;
      }

      if (rem > 1) {
        const maxWithTotals = await countRowsThatFit(playwrightPage, rem - 1, async (c) =>
          probeItemsPlusTotalsFit(playwrightPage, c, isOpening, sliceRows, layout)
        );
        if (maxWithTotals >= 1 && maxWithTotals < rem) {
          chunks.push({ chunk: items.slice(idx, idx + maxWithTotals), startIndex: idx });
          idx += maxWithTotals;
          continue;
        }
      }

      chunks.push({
        chunk: items.slice(idx, idx + rem),
        startIndex: idx,
        totalsSeparate: true,
        totalsInlineSeparate: false,
      });
      break;
    }

    if (rem === 1) {
      if (await probeWithTotals(1)) {
        chunks.push({ chunk: items.slice(idx, idx + 1), startIndex: idx });
      } else if (await probeInlineTotals(1)) {
        chunks.push({
          chunk: items.slice(idx, idx + 1),
          startIndex: idx,
          totalsInlineSeparate: true,
          totalsSeparate: false,
        });
      } else {
        chunks.push({
          chunk: items.slice(idx, idx + 1),
          startIndex: idx,
          totalsSeparate: true,
          totalsInlineSeparate: false,
        });
      }
      break;
    }

    let maxMid = await countRowsThatFit(playwrightPage, rem, async (c) => probeNoTotalsForCount(c));
    if (maxMid < 1) maxMid = 1;
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
  const {
    rowHtmls,
    probeLastItemsPage,
    probeLastItemsPageInlineTotals,
    probeTotalsOnlyPage,
    probeClosingOnlyPage,
    buildClosingBlocks,
  } = layout;
  const pages = sanitizeItemPages(
    itemPages.length ? [...itemPages.map((p) => ({ ...p }))] : []
  );
  if (!pages.length) {
    pages.push({ chunk: [], startIndex: 0 });
  }

  await ensureLastPageTotalsFit(playwrightPage, layout, pages);

  const buildClosingProbeHtml = (blocks) => probeClosingOnlyPage(renderClosingTailHtml(blocks));

  const lastIdx = pages.length - 1;
  const isFirst = lastIdx === 0;
  const last = pages[lastIdx];
  const tbodyRowsHtml = rowHtmls
    .slice(last.startIndex, last.startIndex + last.chunk.length)
    .join("");
  const lastHasTotalsSeparate = Boolean(last.totalsSeparate);
  const lastHasTotalsInline = Boolean(last.totalsInlineSeparate);

  const buildItemsProbeHtml =
    lastHasTotalsSeparate
      ? (blocks) => probeTotalsOnlyPage(false, renderClosingTailHtml(blocks))
      : lastHasTotalsInline
        ? (blocks) =>
            probeLastItemsPageInlineTotals(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks))
        : (blocks) => probeLastItemsPage(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks));

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

  const buildItemsClosingProbe =
    lastHasTotalsSeparate
      ? (blocks) => probeTotalsOnlyPage(false, renderClosingTailHtml(blocks))
      : lastHasTotalsInline
        ? (blocks) =>
            probeLastItemsPageInlineTotals(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks))
        : (blocks) => probeLastItemsPage(isFirst, tbodyRowsHtml, renderClosingTailHtml(blocks));

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
    totalsSeparate: lastHasTotalsSeparate,
    totalsInlineSeparate: lastHasTotalsInline,
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
  const isPurchaseOrder = docKind === "purchaseOrder";
  const isPurchaseInvoice = docKind === "purchaseInvoice";
  const isPurchase = isPurchaseOrder || isPurchaseInvoice;
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
  const companyTRN = getQuotationCompanyTRN();
  const safeSubject =
    subject ||
    (isSalesOrder
      ? `Sales Order ${quoteNumber}`
      : isSalesInvoice
        ? `Tax Invoice ${quoteNumber}`
        : isPurchaseOrder
          ? `Purchase Order ${quoteNumber}`
          : isPurchaseInvoice
            ? `Purchase Invoice ${quoteNumber}`
            : `Quotation ${quoteNumber}`);
  const docTitle = isSalesOrder
    ? "SALES ORDER"
    : isSalesInvoice
      ? "TAX INVOICE"
      : isPurchaseOrder
        ? "PURCHASE ORDER"
        : isPurchaseInvoice
          ? "PURCHASE INVOICE"
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
              <tr><td class="mini-label">Payment Status</td><td>${String(paymentStatus || status || "-").replace(/_/g, " ")}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>`
      : isPurchaseOrder
        ? `
              <tr><td class="mini-label">PO No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Order Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Status</td><td>${String(status || "-").replace(/_/g, " ")}</td></tr>
              <tr><td class="mini-label">Delivery Date</td><td>${formatDate(validUntil)}</td></tr>`
        : isPurchaseInvoice
          ? `
              <tr><td class="mini-label">Invoice No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Invoice Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Payment Status</td><td>${String(paymentStatus || status || "-").replace(/_/g, " ")}</td></tr>
              <tr><td class="mini-label">Due Date</td><td>${formatDate(validUntil)}</td></tr>`
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

  const defaultTerms = isSalesOrder
    ? `1. All prices are in AED unless otherwise stated.
2. Payment terms: ${paymentTerms}.
3. Delivery as per the dates shown above.
4. Equipment remains the property of ${companyName} until full payment is received.
5. Standard rental terms and damage charges apply as per signed agreement.`
    : isSalesInvoice
      ? `1. All amounts are in AED unless otherwise stated.
2. Payment terms: ${paymentTerms}.
3. Please quote invoice number on all remittances.
4. Late payment may incur charges per our credit terms.`
      : isPurchase
        ? `1. All amounts are in AED unless otherwise stated.
2. Goods/services as per the line items above.
3. Delivery and payment per vendor agreement.
4. This document is for internal procurement records.`
      : `1. All prices quoted are in AED (UAE Dirhams) unless otherwise stated.
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
  const sumWeight = items.reduce((s, it) => s + Number(it.weight || 0), 0);
  const sumCbm = items.reduce((s, it) => s + Number(it.cbm || 0), 0);
  const sumQty = items.reduce((s, it) => s + Number(it.quantity || 0), 0);

  const formatVatPct = (item) => {
    const pct = Number(item?.vatPercentage ?? vatPercentage ?? 5);
    return Number.isInteger(pct) ? String(pct) : pct.toFixed(2).replace(/\.?0+$/, "");
  };

  /** One flowing bold description block — same pattern as competitor quotation cells. */
  const formatItemDescriptionHtml = (item) => {
    const lines = [];
    const title = String(item.equipmentType || "").trim();
    const desc = String(item.description || "").trim();
    const specs = String(item.specifications || "").trim();
    const size = String(item.size || "").trim();

    if (title) lines.push(title);
    if (desc && desc !== title) lines.push(desc);
    if (specs) lines.push(specs);
    if (size) lines.push(size.startsWith("Size:") ? size : `Size: ${size}`);

    if (!lines.length) return "";
    return lines.map((line) => `<div class="item-desc-line">${escapeHtml(line)}</div>`).join("");
  };

  const renderRows = (pageItems, start) =>
    pageItems
      .map(
        (item, idx) => `
      <tr>
        <td class="sn-col">${start + idx + 1}</td>
        <td class="desc-col">
          <div class="item-desc-body">${formatItemDescriptionHtml(item)}</div>
        </td>
        <td class="num-col num-col-strong">${formatPdfAmount(item.weight)}</td>
        <td class="num-col num-col-strong">${formatPdfAmount(item.cbm)}</td>
        <td class="num-col qty-col"><span class="qty-val">${item.quantity || 0}</span><span class="qty-unit">${item.unit || "Nos"}</span></td>
        <td class="num-col num-col-amount">${formatPdfAmount(item.ratePerUnit)}</td>
        <td class="num-col num-col-amount">${formatPdfAmount(item.taxableAmount ?? item.subtotal)}</td>
        <td class="num-col num-col-amount">${formatVatPct(item)}</td>
        <td class="num-col num-col-amount">${formatPdfAmount(item.vatAmount)}</td>
        <td class="num-col num-col-amount amount-col">${formatPdfAmount(itemAmountWithVat(item, vatPercentage))}</td>
      </tr>`
      )
      .join("");

  const renderTotalsTfoot = () => {
    const amountWords = formatAmountInWords(totalAmount);
    const invoicePaymentRows = isSalesInvoice
      ? `
        <tr class="items-summary-row">
          <td colspan="7"></td>
          <td colspan="2" class="summary-label">Paid</td>
          <td class="summary-value strong amount-col">${formatPdfAmount(paidAmount)}</td>
        </tr>
        <tr class="items-summary-row">
          <td colspan="7"></td>
          <td colspan="2" class="summary-label">Balance</td>
          <td class="summary-value net-total-value amount-col">${formatPdfSummaryAmount(displayBalance)}</td>
        </tr>`
      : "";
    return `
      <tfoot class="items-totals-foot">
        <tr class="items-grand-total-row">
          <td></td>
          <td class="grand-total-label">TOTAL</td>
          <td class="num-col num-col-strong">${formatPdfAmount(sumWeight)}</td>
          <td class="num-col num-col-strong">${formatPdfAmount(sumCbm)}</td>
          <td class="num-col qty-col num-col-strong"><span class="qty-val">${sumQty}</span></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr class="items-summary-row">
          <td colspan="7"></td>
          <td colspan="2" class="summary-label">Total w/o VAT</td>
          <td class="summary-value summary-value-subtotal amount-col">${formatPdfSummaryAmount(displaySubtotal)}</td>
        </tr>
        <tr class="items-summary-row items-summary-row-vat">
          <td colspan="7"></td>
          <td colspan="2" class="summary-label">VAT ${vatPercentage}%</td>
          <td class="summary-value amount-col">${formatPdfAmount(vatAmount)}</td>
        </tr>
        <tr class="items-words-row">
          <td colspan="7" class="amount-in-words">${escapeHtml(amountWords)}</td>
          <td colspan="2" class="summary-label">Net Total</td>
          <td class="summary-value net-total-value amount-col">${formatPdfSummaryAmount(totalAmount)}</td>
        </tr>${invoicePaymentRows}
      </tfoot>`;
  };

  const renderTable = (rows, withTotals = false) => `
    <div class="items-table-shell">
      <table class="items-table">
        <colgroup>
          <col class="sn-col" />
          <col class="desc-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="qty-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="amount-col" />
        </colgroup>
        <thead>
          <tr>
            <th class="sn-col">SN</th>
            <th class="desc-col">Description of goods</th>
            <th class="num-col">Wt<br>(KG)</th>
            <th class="num-col">CBM</th>
            <th class="qty-col">Qty</th>
            <th class="num-col">Rate<br>(AED)</th>
            <th class="num-col">Taxable<br>Amount</th>
            <th class="num-col">VAT<br>%</th>
            <th class="num-col">VAT<br>Amount</th>
            <th class="amount-col">Amount<br>(AED)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        ${withTotals ? renderTotalsTfoot() : ""}
      </table>
    </div>`;

  const renderTotalsOnlyTable = () => `
    <div class="items-table-shell items-totals-only-shell">
      <table class="items-table">
        <colgroup>
          <col class="sn-col" />
          <col class="desc-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="qty-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="num-col" />
          <col class="amount-col" />
        </colgroup>
        <tbody></tbody>
        ${renderTotalsTfoot()}
      </table>
    </div>`;

  const docHeadingBlock = `
        <div class="doc-heading">
          <div class="doc-title">${docTitle}</div>
          <div class="doc-trn"><strong>TRN: ${companyTRN}</strong></div>
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
            <div class="bank-table-wrap">
              <table class="bank-table-full">
                <tr><td class="mini-label">Bank details</td><td>${pdfBank.accountName}</td></tr>
                <tr><td class="mini-label">Bank name</td><td>${pdfBank.bankName}</td></tr>
                <tr><td class="mini-label">Account no</td><td>${pdfBank.accountNumber}</td></tr>
                <tr><td class="mini-label">IBAN</td><td>${pdfBank.iban}</td></tr>
              </table>
            </div>
            <div class="signatures-row">
              <div class="sign-box sign-box-company">
                <div class="sign-label">For ALCOA ALUMINIUM SCAFFOLDING</div>
                <div class="sign-line"></div>
              </div>
              <div class="sign-box sign-box-customer">
                <div class="sign-label">CUSTOMER'S SIGNATURE</div>
                <div class="sign-line"></div>
              </div>
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
            <table class="head-mini-table">
              <tr><td class="mini-label">${isPurchase ? "Vendor Name" : "Customer Name"}</td><td>${escapeHtml(customerName || "-")}</td></tr>
              <tr><td class="mini-label">Address</td><td>${escapeHtml(customerAddress || "-")}</td></tr>
              <tr><td class="mini-label">Mobile No</td><td>${escapeHtml(customerPhone || "-")}</td></tr>
              <tr><td class="mini-label">TRN</td><td>${escapeHtml(customerTRN || "-")}</td></tr>
              <tr><td class="mini-label">Contact Person</td><td>${escapeHtml(contactPersonName || "-")}</td></tr>
            </table>
          </div>
          <div class="box">
            <table class="head-mini-table">
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
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
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
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
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

  const probeFirstInlineTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: true,
      body: `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(tbodyRowsHtml)}
        ${renderTotalsOnlyTable()}
        </div>`,
    });

  const probeContInlineTotals = (tbodyRowsHtml) =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      body: `${renderTable(tbodyRowsHtml)}${renderTotalsOnlyTable()}`,
    });

  const probeLastItemsPage = (isFirst, tbodyRowsHtml, closingHtml = "") => {
    const firstBody = `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(tbodyRowsHtml, true)}
        </div>`;
    return wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirst,
      body: `${isFirst ? firstBody : renderTable(tbodyRowsHtml, true)}${closingHtml}`,
    });
  };

  const probeLastItemsPageNoTotals = (isFirst, tbodyRowsHtml) => {
    const firstBody = `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(tbodyRowsHtml)}
        </div>`;
    return wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirst,
      body: isFirst ? firstBody : renderTable(tbodyRowsHtml),
    });
  };

  const probeLastItemsPageInlineTotals = (isFirst, tbodyRowsHtml, closingHtml = "") => {
    const itemsBlock = `
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(tbodyRowsHtml)}
        ${renderTotalsOnlyTable()}
        </div>`;
    const firstBody = `${headGridHtml}${itemsBlock}`;
    const contBody = `${renderTable(tbodyRowsHtml)}${renderTotalsOnlyTable()}`;
    return wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirst,
      body: `${isFirst ? firstBody : contBody}${closingHtml}`,
    });
  };

  const probeTotalsOnlyPage = (isFirstPage, closingHtml = "") => {
    const totalsBlock = `<div class="doc-lines-shell">${renderTotalsOnlyTable()}</div>`;
    const body = isFirstPage
      ? `${headGridHtml}${totalsBlock}${closingHtml}`
      : `${totalsBlock}${closingHtml}`;
    return wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirstPage,
      body,
    });
  };

  const probeClosingOnlyPage = (closingHtml = "") =>
    wrapQuotationPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      fillClass: "pdf-page-fill pdf-page-fill-closing",
      body: closingHtml,
    });

  function buildItemSectionsHtml(
    itemPages,
    lastPageClosingBlocks,
    followUpClosingPages,
    totalsSeparate = false,
    totalsInlineSeparate = false
  ) {
    const pages = sanitizeItemPages(itemPages);
    const htmlParts = [];

    pages.forEach(({ chunk, startIndex, totalsSeparate: chunkTotalsSeparate, totalsInlineSeparate: chunkInlineTotals }, pageIndex) => {
      const isFirst = pageIndex === 0;
      const isLastItemsPage = pageIndex === pages.length - 1;
      const separateTotalsPage =
        isLastItemsPage && (Boolean(chunkTotalsSeparate) || totalsSeparate) && !chunkInlineTotals && !totalsInlineSeparate;
      const inlineTotals =
        isLastItemsPage && (Boolean(chunkInlineTotals) || totalsInlineSeparate);
      const closingHtml =
        isLastItemsPage && lastPageClosingBlocks.length && !separateTotalsPage
          ? renderClosingTailHtml(lastPageClosingBlocks)
          : "";
      const withTotals = isLastItemsPage && !separateTotalsPage && !inlineTotals;
      const itemsPageBreakAfter =
        !isLastItemsPage || separateTotalsPage || followUpClosingPages.length > 0;

      const rowsHtml = renderRows(chunk, startIndex);
      const itemsTableHtml = renderTable(rowsHtml, withTotals);
      const inlineTotalsHtml = inlineTotals ? renderTotalsOnlyTable() : "";

      const body = isFirst
        ? `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${itemsTableHtml}
        ${inlineTotalsHtml}
        </div>
        ${closingHtml}`
        : `${itemsTableHtml}${inlineTotalsHtml}${closingHtml}`;

      htmlParts.push(`
      <section class="pdf-page page ${isFirst ? "first-page " : ""}${itemsPageBreakAfter ? "page-break" : ""}" data-pdf-page>
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill content">${body}</div>
        ${runningFootBlock}
      </section>`);

      if (separateTotalsPage) {
        const totalsClosingHtml = lastPageClosingBlocks.length
          ? renderClosingTailHtml(lastPageClosingBlocks)
          : "";
        const totalsPageBreakAfter = followUpClosingPages.length > 0;
        htmlParts.push(`
      <section class="pdf-page page ${totalsPageBreakAfter ? "page-break" : ""}" data-pdf-page>
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill content">
          <div class="doc-lines-shell">${renderTotalsOnlyTable()}</div>
          ${totalsClosingHtml}
        </div>
        ${runningFootBlock}
      </section>`);
      }
    });

    return htmlParts.join("");
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
    const totalsSeparate = Array.isArray(pagePlan) ? false : Boolean(pagePlan.totalsSeparate);
    const totalsInlineSeparate = Array.isArray(pagePlan) ? false : Boolean(pagePlan.totalsInlineSeparate);
    const itemSections = buildItemSectionsHtml(
      itemPages,
      lastPageClosingBlocks,
      followUpClosingPages,
      totalsSeparate,
      totalsInlineSeparate
    );
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
    probeFirstInlineTotals,
    probeContInlineTotals,
    probeLastItemsPage,
    probeLastItemsPageNoTotals,
    probeLastItemsPageInlineTotals,
    probeTotalsOnlyPage,
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
  const context = await browser.newContext({
    viewport: { width: PDF_VIEWPORT_WIDTH, height: PDF_VIEWPORT_HEIGHT },
    deviceScaleFactor: PDF_DEVICE_SCALE_FACTOR,
  });
  let page;
  try {
    page = await context.newPage();

    const layout = buildQuotationPdfLayout(quotation, brandOpts);
    const itemPages = await computeQuotationItemPages(page, layout);
    const pagePlan = await resolveQuotationPdfPagePlan(page, layout, itemPages);
    const html = layout.buildCompleteHtml(pagePlan);

    await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
    await waitForDocumentImages(page);
    await page
      .evaluate(() => document.fonts.ready)
      .catch(() => {});
    await page.emulateMedia({ media: "print" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
      tagged: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close().catch(() => {});
    await context.close().catch(() => {});
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
