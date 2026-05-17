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
const QUOTATION_PDF_PAGE_FIT_TOLERANCE_PX = 3;

/** 15-item quotes: keep table page clean; render all closing sections on following page(s). */
const QUOTATION_FORCE_CLOSING_NEXT_PAGE_ITEM_COUNT = 15;

/**
 * @param {import("playwright").Page} playwrightPage
 * @param {string} bodyHtml single section or fragment containing `[data-pdf-page]`
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
    ([limit, tol]) => {
      const page = document.querySelector("[data-pdf-page]");
      if (!page) return false;
      /*
       * Use footer bottom vs page top — fill.scrollHeight already includes footer
       * padding reserve; adding footer height again caused premature page breaks.
       */
      const foot = page.querySelector(".pdf-running-foot");
      const pageTop = page.getBoundingClientRect().top;
      const used = foot
        ? foot.getBoundingClientRect().bottom - pageTop
        : page.scrollHeight;
      return used <= limit + tol;
    },
    [QUOTATION_PDF_A4_HEIGHT_PX, QUOTATION_PDF_PAGE_FIT_TOLERANCE_PX]
  );
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

/** Add rows one-by-one until the next full row would overflow (uses actual DOM row heights). */
async function countRowsThatFit(playwrightPage, maxCount, buildHtmlForCount) {
  let best = 0;
  for (let count = 1; count <= maxCount; count++) {
    const html = await buildHtmlForCount(count);
    if (await quotationPdfPageProbeFits(playwrightPage, html)) {
      best = count;
    } else {
      break;
    }
  }
  return best;
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
        const remaining = lines.length - offset;
        let linesThisPage = 0;

        for (let i = 0; i < remaining; i++) {
          const trial = [
            ...seg.blocks,
            {
              type: "terms",
              lines: lines.slice(offset, offset + i + 1),
              showTitle: i === 0 && showTitle,
            },
          ];
          if (await probeBlocks(trial, seg.onItemsPage)) {
            linesThisPage = i + 1;
          } else {
            break;
          }
        }

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

  if (items.length === QUOTATION_FORCE_CLOSING_NEXT_PAGE_ITEM_COUNT) {
    const segments = await flowClosingBlocks(
      playwrightPage,
      buildClosingProbeHtml,
      buildClosingProbeHtml,
      buildClosingBlocks(),
      { closingPagesOnly: true }
    );
    const followUpClosingPages = segments
      .filter((s) => s.blocks.length > 0)
      .map((s) => s.blocks);

    return {
      itemPages: pages,
      lastPageClosingBlocks: [],
      followUpClosingPages,
    };
  }

  /*
   * Item row splits are handled only in computeQuotationItemPages.
   * Re-splitting here (old n-1 cap) caused 15-item quotes to become 14+1 with a sparse
   * page and a near-blank continuation sheet.
   */

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
  const followUpClosingPages = segments
    .filter((s) => !s.onItemsPage && s.blocks.length > 0)
    .map((s) => s.blocks);

  return {
    itemPages: pages,
    lastPageClosingBlocks: itemsSegment.blocks,
    followUpClosingPages,
  };
}

/**
 * Shared layout fragments for measurement + final HTML (keeps probes in sync with print markup).
 * @param {Record<string, unknown>} quotation
 * @param {{ logoDataUri?: string; headerDataUri?: string; footerDataUri?: string }} options
 */
function buildQuotationPdfLayout(quotation, options = {}) {
  const { logoDataUri = "", headerDataUri = "", footerDataUri = "" } = options;
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
  } = quotation;

  const companyName = getQuotationCompanyName();
  const companyEmail = getQuotationCompanyEmail();
  const companyTRN = process.env.COMPANY_TRN || "100123456700003";
  const safeSubject = subject || `Quotation ${quoteNumber}`;
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
        <td class="center">${Number(item.weight || 0).toFixed(2)}</td>
        <td class="center">${Number(item.cbm || 0).toFixed(2)}</td>
        <td class="center">${item.quantity || 0} ${item.unit || "Nos"}</td>
        <td class="right">${Number(item.ratePerUnit || 0).toFixed(2)}</td>
        <td class="right">${Number(item.taxableAmount ?? item.subtotal ?? 0).toFixed(2)}</td>
        <td class="center">${Number(item.vatPercentage ?? vatPercentage ?? 5)}</td>
        <td class="right">${Number(item.vatAmount || 0).toFixed(2)}</td>
        <td class="right strong">${Number(item.subtotal || 0).toFixed(2)}</td>
      </tr>`
      )
      .join("");

  const renderTotalsTfoot = () => `
      <tfoot class="items-totals-foot">
        <tr>
          <td colspan="7" class="totals-spacer"></td>
          <td colspan="2" class="totals-label">Subtotal</td>
          <td class="totals-value right strong">${displaySubtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="7" class="totals-spacer"></td>
          <td colspan="2" class="totals-label">VAT (${vatPercentage}%)</td>
          <td class="totals-value right">${Number(vatAmount || 0).toFixed(2)}</td>
        </tr>
        <tr class="totals-grand">
          <td colspan="7" class="totals-spacer"></td>
          <td colspan="2" class="totals-label totals-label-total">Total<br /><span class="totals-currency">(${currency})</span></td>
          <td class="totals-value right strong">${Number(totalAmount || 0).toFixed(2)}</td>
        </tr>
      </tfoot>`;

  const renderTable = (rows, withTotals = false) => `
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:3%;">SN</th>
          <th class="desc-col" style="width:49%;">Description of Goods</th>
          <th style="width:5%;">Wt (KG)</th>
          <th style="width:4%;">CBM</th>
          <th style="width:5%;">Qty</th>
          <th style="width:9%;">Rate<br>(AED)</th>
          <th style="width:8%;">Taxable Amount</th>
          <th style="width:3%;">VAT %</th>
          <th style="width:6%;">VAT Amount</th>
          <th style="width:8%;">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      ${withTotals ? renderTotalsTfoot() : ""}
    </table>`;

  const docHeadingBlock = `
        <div class="doc-heading">
          <div class="doc-title">QUOTATION</div>
          <div class="doc-trn"><strong>TRN:</strong> ${companyTRN}</div>
        </div>`;

  const runningHeadBlock = `
        <div class="pdf-running-head">
          <div class="top-brand">${headerImageBlock}</div>
          ${docHeadingBlock}
        </div>`;

  const runningFootBlock = `
        <div class="pdf-running-foot">
          <div class="footer-main">${footerImageBlock}</div>
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
          <div class="bank-block">
            <div class="bank-title-main">BANK DETAILS</div>
            <div class="bank-table-wrap">
              <table class="bank-table-full">
                <tr><td class="mini-label">Bank details</td><td>${pdfBank.accountName}</td></tr>
                <tr><td class="mini-label">Bank name</td><td>${pdfBank.bankName}</td></tr>
                <tr><td class="mini-label">Account no</td><td>${pdfBank.accountNumber}</td></tr>
                <tr><td class="mini-label">IBAN</td><td>${pdfBank.iban}</td></tr>
              </table>
            </div>
          </div>
          <div class="sign-row">
            <div class="sign-box"><div>For ALCOA ALUMINIUM SCAFFOLDING</div><div class="sign-line"></div></div>
            <div class="sign-box"><div>CUSTOMER'S SIGNATURE</div><div class="sign-line"></div></div>
          </div>
        </div>`;

  function buildClosingBlocks() {
    const termsText = (termsAndConditions || defaultTerms).trim();
    const lines = termsText.split(/\n/).map((line) => line.trim()).filter(Boolean);
    const blocks = [{ type: "terms", lines }];
    if (notes) {
      blocks.push({
        type: "notes",
        html: `<div class="notes-plain"><strong>Notes:</strong> ${notes.replace(/\n/g, "<br>")}</div>`,
      });
    }
    blocks.push({
      type: "bank",
      html: `<div class="bank-block">
            <div class="bank-title-main">BANK DETAILS</div>
            <div class="bank-table-wrap">
              <table class="bank-table-full">
                <tr><td class="mini-label">Bank details</td><td>${pdfBank.accountName}</td></tr>
                <tr><td class="mini-label">Bank name</td><td>${pdfBank.bankName}</td></tr>
                <tr><td class="mini-label">Account no</td><td>${pdfBank.accountNumber}</td></tr>
                <tr><td class="mini-label">IBAN</td><td>${pdfBank.iban}</td></tr>
              </table>
            </div>
          </div>`,
    });
    blocks.push({
      type: "sign",
      html: `<div class="sign-row">
            <div class="sign-box"><div>For ALCOA ALUMINIUM SCAFFOLDING</div><div class="sign-line"></div></div>
            <div class="sign-box"><div>CUSTOMER'S SIGNATURE</div><div class="sign-line"></div></div>
          </div>`,
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
              <tr><td class="mini-label">Quotation No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Sales Executive</td><td>${salesExecutive || preparedBy || "-"}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>
              <tr><td class="mini-label">Delivery Terms</td><td>${deliveryTerms || "-"}</td></tr>
            </table>
          </div>
        </div>`;

  const rowHtmls = items.map((item, gi) => renderRows([item], gi).trim());

  /* Totals probes omit closingTailHtml — terms/bank/signatures follow in the same section and may
   * paginate; including them in height checks forced too-small row chunks (e.g. 2 + 1 items). */
  const probeFirstNoTotals = (tbodyRowsHtml) => `
      <section class="pdf-page pdf-page-measure first-page page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill">
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
              <tr><td class="mini-label">Quotation No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Sales Executive</td><td>${salesExecutive || preparedBy || "-"}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>
              <tr><td class="mini-label">Delivery Terms</td><td>${deliveryTerms || "-"}</td></tr>
            </table>
          </div>
        </div>
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml)}
        </div>
        </div>
        ${runningFootBlock}
      </section>`;

  const probeFirstWithTotals = (tbodyRowsHtml) => `
      <section class="pdf-page pdf-page-measure first-page page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill">
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
              <tr><td class="mini-label">Quotation No</td><td>${quoteNumber || "-"}</td></tr>
              <tr><td class="mini-label">Date</td><td>${formatDate(quoteDate)}</td></tr>
              <tr><td class="mini-label">Sales Executive</td><td>${salesExecutive || preparedBy || "-"}</td></tr>
              <tr><td class="mini-label">Payment Terms</td><td>${paymentTerms || "Cash/CDC"}</td></tr>
              <tr><td class="mini-label">Delivery Terms</td><td>${deliveryTerms || "-"}</td></tr>
            </table>
          </div>
        </div>
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml, true)}
        </div>
        </div>
        ${runningFootBlock}
      </section>`;

  const probeContNoTotals = (tbodyRowsHtml) => `
      <section class="pdf-page pdf-page-measure page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill">
        ${renderTable(tbodyRowsHtml)}
        </div>
        ${runningFootBlock}
      </section>`;

  const probeContWithTotals = (tbodyRowsHtml) => `
      <section class="pdf-page pdf-page-measure page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill">
        ${renderTable(tbodyRowsHtml, true)}
        </div>
        ${runningFootBlock}
      </section>`;

  const probeLastItemsPage = (isFirst, tbodyRowsHtml, closingHtml = "") => {
    const firstBody = `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(tbodyRowsHtml, true)}
        </div>`;
    return `
      <section class="pdf-page pdf-page-measure ${isFirst ? "first-page " : ""}page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill">
        ${isFirst ? firstBody : renderTable(tbodyRowsHtml, true)}
        ${closingHtml}
        </div>
        ${runningFootBlock}
      </section>`;
  };

  const probeClosingOnlyPage = (closingHtml = "") => `
      <section class="pdf-page pdf-page-measure page-break" data-pdf-page>
        ${runningHeadBlock}
        <div class="pdf-page-fill pdf-page-fill-closing">
        ${closingHtml}
        </div>
        ${runningFootBlock}
      </section>`;

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
        return `
      <section class="pdf-page ${isFirst ? "first-page " : ""}${pageBreakAfter ? "page-break" : ""}">
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill">
        ${isFirst ? `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${safeSubject}</div>
        ${renderTable(renderRows(chunk, startIndex), isLastItemsPage)}
        </div>
        ` : renderTable(renderRows(chunk, startIndex), isLastItemsPage)}
        ${closingHtml}
        </div>
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
      <section class="pdf-page ${pageBreakAfter ? "page-break" : ""}">
        ${watermarkBlock}
        ${runningHeadBlock}
        <div class="pdf-page-fill pdf-page-fill-closing">
        ${closingHtml}
        </div>
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
export async function generateQuotationPDF(quotation) {
  const logoDataUri = getQuotationLogoDataUri();
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const brandOpts = { logoDataUri, headerDataUri, footerDataUri };

  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    // Match A4 width so line wrapping / row heights match the final PDF layout.
    await page.setViewportSize({ width: 794, height: 1123 });

    const layout = buildQuotationPdfLayout(quotation, brandOpts);
    const itemPages = await computeQuotationItemPages(page, layout);
    const pagePlan = await resolveQuotationPdfPagePlan(page, layout, itemPages);
    const html = layout.buildCompleteHtml(pagePlan);

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}
