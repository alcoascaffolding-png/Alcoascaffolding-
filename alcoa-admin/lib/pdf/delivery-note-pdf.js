import { launchBrowser } from "./chromium";
import { quotationPdfStyles, quotationPdfProbeStyles } from "./quotation-pdf-styles.js";
import {
  getQuotationLogoDataUri,
  getQuotationHeaderDataUri,
  getQuotationFooterDataUri,
  getQuotationCompanyTRN,
} from "@/lib/quotation-brand";
import {
  computeQuotationItemPages,
  resolveQuotationPdfPagePlan,
} from "./quotation-pdf.js";

const PDF_VIEWPORT_WIDTH = 794;
const PDF_VIEWPORT_HEIGHT = 1123;
const PDF_DEVICE_SCALE_FACTOR = Number(process.env.PDF_DEVICE_SCALE_FACTOR) || 4;
const QUOTATION_PDF_A4_HEIGHT_PX = PDF_VIEWPORT_HEIGHT;
const QUOTATION_PDF_PAGE_FIT_TOLERANCE_PX = 2;
const QUOTATION_PDF_FOOTER_CLEARANCE_PX = 4;

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

function formatPdfAmount(value) {
  return Number(value || 0).toFixed(2);
}

function wrapPdfPage({ head, body, foot, first = false, pageBreak = true, fillClass = "pdf-page-fill" }) {
  const firstCls = first ? "first-page " : "";
  const breakCls = pageBreak ? "page-break " : "";
  return `
      <section class="pdf-page page ${firstCls}${breakCls}" data-pdf-page>
        ${head}
        <div class="${fillClass} content">${body}</div>
        ${foot}
      </section>`;
}

async function pdfPageProbeFits(playwrightPage, bodyHtml) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery note measure</title>
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

function renderClosingBlockHtml(block) {
  return block.html || "";
}

function renderClosingTailHtml(blocks) {
  if (!blocks.length) return "";
  const inner = blocks.map((b) => renderClosingBlockHtml(b)).join("");
  return `<div class="closing-tail-flow">${inner}</div>`;
}

function buildDeliveryNotePdfLayout(note, options = {}) {
  const { logoDataUri = "", headerDataUri = "", footerDataUri = "" } = options;
  const {
    deliveryNoteNumber = "",
    salesOrderNumber = "",
    customerName = "",
    customerAddress = "",
    customerPhone = "",
    deliveryAddress = "",
    contactPersonName = "",
    contactPersonPhone = "",
    driverName = "",
    vehicleNumber = "",
    deliveryDate,
    noteDate,
    notes = "",
    deliveryInstructions = "",
    items = [],
  } = note;

  const companyTRN = getQuotationCompanyTRN();
  const safeSubject = `Delivery Note ${deliveryNoteNumber}`;

  const headerImageBlock = headerDataUri
    ? `<img class="header-art" src="${headerDataUri}" alt="Header" crossorigin="anonymous" />`
    : "";
  const footerImageBlock = footerDataUri
    ? `<img class="footer-art" src="${footerDataUri}" alt="Footer" crossorigin="anonymous" />`
    : "";

  const watermarkBlock = logoDataUri
    ? `<div class="pdf-page-watermark" aria-hidden="true"><img src="${logoDataUri}" alt="" crossorigin="anonymous" /></div>`
    : "";

  const runningHeadBlock = `
        <div class="pdf-running-head header">
          <div class="top-brand">${headerImageBlock}</div>
          <div class="doc-heading">
            <div class="doc-title">DELIVERY NOTE</div>
            <div class="doc-trn"><strong>TRN:</strong> ${companyTRN}</div>
          </div>
        </div>`;

  const runningFootBlock = `
        <div class="pdf-running-foot footer">
          <div class="footer-main">${footerImageBlock}</div>
        </div>`;

  const renderRows = (pageItems, start) =>
    pageItems
      .map(
        (item, idx) => `
      <tr>
        <td class="center">${start + idx + 1}</td>
        <td class="desc-col">
          <div class="item-title">${escapeHtml(item.equipmentType || item.description || "")}</div>
          ${item.description && item.equipmentType && item.description !== item.equipmentType ? `<div class="item-sub">${escapeHtml(item.description)}</div>` : ""}
          ${item.specifications ? `<div class="item-sub">${escapeHtml(item.specifications)}</div>` : ""}
          ${item.size ? `<div class="item-sub">Size: ${escapeHtml(item.size)}</div>` : ""}
        </td>
        <td class="center">${formatPdfAmount(item.weight)}</td>
        <td class="center">${formatPdfAmount(item.cbm)}</td>
        <td class="center">${item.quantity || 0} ${item.unit || "Nos"}</td>
      </tr>`
      )
      .join("");

  const renderTable = (rows) => `
    <table class="items-table dn-items-table">
      <thead>
        <tr>
          <th style="width:5%;">SN</th>
          <th class="desc-col" style="width:55%;">Description of Goods</th>
          <th style="width:12%;">Wt (KG)</th>
          <th style="width:12%;">CBM</th>
          <th style="width:16%;">Qty</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  /** Fixed 5 rows per column so both header tables stay the same height in PDF. */
  const HEAD_META_ROW_COUNT = 5;
  const renderHeadMetaRow = (label, value) =>
    `<tr><td class="mini-label">${label}</td><td>${escapeHtml(value || "-")}</td></tr>`;

  const driverVehicleDisplay = [driverName, vehicleNumber].filter(Boolean).join(" — ") || "";

  const leftHeadRows = [
    ["Customer Name", customerName],
    ["Delivery Address", deliveryAddress || customerAddress],
    ["Mobile No", customerPhone],
    ["Contact Person", contactPersonName],
    ["Contact Phone", contactPersonPhone],
  ];

  const rightHeadRows = [
    ["Delivery Note No", deliveryNoteNumber],
    ["Date", formatDate(noteDate)],
    ["Order Ref", salesOrderNumber],
    ["Delivery Date", formatDate(deliveryDate)],
    ["Driver / Vehicle", driverVehicleDisplay],
  ];

  const padHeadRows = (rows) => {
    const out = rows.slice(0, HEAD_META_ROW_COUNT);
    while (out.length < HEAD_META_ROW_COUNT) out.push(["", ""]);
    return out;
  };

  const headGridHtml = `
        <div class="head-grid dn-head-grid">
          <div class="box">
            <table class="mini-table head-mini-table dn-head-mini-table">
              ${padHeadRows(leftHeadRows).map(([l, v]) => renderHeadMetaRow(l, v)).join("")}
            </table>
          </div>
          <div class="box">
            <table class="mini-table head-mini-table dn-head-mini-table">
              ${padHeadRows(rightHeadRows).map(([l, v]) => renderHeadMetaRow(l, v)).join("")}
            </table>
          </div>
        </div>`;

  const signaturesHtml = `
          <div class="dn-signatures-wrap">
            <div class="dn-sign-row">
              <div class="dn-sign-slot">
                <div class="dn-sign-label">Dispatched By</div>
                <div class="dn-sign-line"></div>
              </div>
              <div class="dn-sign-slot">
                <div class="dn-sign-label">Received By</div>
                <div class="dn-sign-line"></div>
              </div>
              <div class="dn-sign-slot">
                <div class="dn-sign-label">Driver</div>
                <div class="dn-sign-line"></div>
              </div>
            </div>
          </div>`;

  function buildClosingBlocks() {
    const blocks = [];
    if (deliveryInstructions) {
      blocks.push({
        type: "instructions",
        html: `<div class="dn-notes-plain"><strong>Delivery instructions:</strong> ${escapeHtml(deliveryInstructions).replace(/\n/g, "<br>")}</div>`,
      });
    }
    if (notes) {
      blocks.push({
        type: "notes",
        html: `<div class="dn-notes-plain"><strong>Notes:</strong> ${escapeHtml(notes).replace(/\n/g, "<br>")}</div>`,
      });
    }
    blocks.push({ type: "signatures", html: signaturesHtml });
    return blocks;
  }

  const rowHtmls = items.map((item, gi) => renderRows([item], gi).trim());

  const probeFirstNoTotals = (tbodyRowsHtml) =>
    wrapPdfPage({
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

  const probeContNoTotals = (tbodyRowsHtml) =>
    wrapPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      body: renderTable(tbodyRowsHtml),
    });

  const probeLastItemsPage = (isFirst, tbodyRowsHtml, closingHtml = "") => {
    const firstBody = `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(tbodyRowsHtml)}
        </div>`;
    return wrapPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      first: isFirst,
      body: `${isFirst ? firstBody : renderTable(tbodyRowsHtml)}${closingHtml}`,
    });
  };

  const probeClosingOnlyPage = (closingHtml = "") =>
    wrapPdfPage({
      head: runningHeadBlock,
      foot: runningFootBlock,
      fillClass: "pdf-page-fill pdf-page-fill-closing",
      body: closingHtml,
    });

  function buildItemSectionsHtml(itemPages, lastPageClosingBlocks, followUpClosingPages) {
    const pages = itemPages.filter((p) => p.chunk?.length > 0);
    const safePages = pages.length ? pages : [{ chunk: [], startIndex: 0 }];
    return safePages
      .map(({ chunk, startIndex }, pageIndex) => {
        const isFirst = pageIndex === 0;
        const isLastItemsPage = pageIndex === safePages.length - 1;
        const closingHtml =
          isLastItemsPage && lastPageClosingBlocks.length
            ? renderClosingTailHtml(lastPageClosingBlocks)
            : "";
        const pageBreakAfter = !isLastItemsPage || followUpClosingPages.length > 0;
        const body = isFirst
          ? `
        ${headGridHtml}
        <div class="doc-lines-shell">
        <div class="subject-bar"><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        ${renderTable(renderRows(chunk, startIndex))}
        </div>
        ${closingHtml}`
          : `${renderTable(renderRows(chunk, startIndex))}${closingHtml}`;
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
      .filter((blocks) => blocks?.length > 0)
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
  <title>Delivery Note ${deliveryNoteNumber}</title>
  <style>${quotationPdfStyles()}</style>
  <style>
    .closing-tail-flow {
      padding-left: 5mm;
      padding-right: 3mm;
    }
    .dn-notes-plain {
      margin-top: 8px;
      padding-top: 6px;
      padding-left: 2mm;
      border-top: 1px solid #d1d5db;
      font-size: 11px;
      line-height: 1.55;
      color: #111;
    }
    .dn-notes-plain strong {
      color: #235aa0;
      font-weight: 700;
      text-decoration: none;
    }
    .dn-signatures-wrap {
      margin-top: 14px;
      padding-left: 2mm;
      width: 100%;
      box-sizing: border-box;
    }
    .dn-sign-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      column-gap: 20px;
      align-items: end;
      width: 100%;
    }
    .dn-sign-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      text-align: center;
      min-width: 0;
    }
    .dn-sign-label {
      font-size: 10px;
      color: #235aa0;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 6px;
      width: 100%;
    }
    .dn-sign-line {
      width: 100%;
      max-width: 190px;
      height: 32px;
      border-bottom: 1px solid #235aa0;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .dn-items-table th:last-child,
    .dn-items-table td:last-child { border-right: none; }
    /* Equal-height header meta tables (same row count + stretch). */
    .dn-head-grid {
      align-items: stretch;
      grid-template-columns: 1fr 1fr;
    }
    .dn-head-grid .box {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .dn-head-mini-table {
      height: 100%;
      table-layout: fixed;
    }
    .dn-head-mini-table tr {
      height: 20%;
      min-height: 30px;
    }
    .dn-head-mini-table td {
      vertical-align: middle;
    }
    .dn-head-mini-table .mini-label {
      width: 118px;
      min-width: 118px;
    }
  </style>
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
    probeFirstWithTotals: probeFirstNoTotals,
    probeContNoTotals,
    probeContWithTotals: probeContNoTotals,
    probeLastItemsPage,
    probeClosingOnlyPage,
    buildClosingBlocks,
    buildCompleteHtml,
  };
}

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

async function renderDeliveryNotePdfBuffer(note, brandOpts) {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: PDF_VIEWPORT_WIDTH, height: PDF_VIEWPORT_HEIGHT },
    deviceScaleFactor: PDF_DEVICE_SCALE_FACTOR,
  });
  let page;
  try {
    page = await context.newPage();
    const layout = buildDeliveryNotePdfLayout(note, brandOpts);
    const itemPages = await computeQuotationItemPages(page, layout);
    const pagePlan = await resolveQuotationPdfPagePlan(page, layout, itemPages);
    const html = layout.buildCompleteHtml(pagePlan);

    await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
    await waitForDocumentImages(page);
    await page.evaluate(() => document.fonts.ready).catch(() => {});
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

export async function generateDeliveryNotePDF(note, pdfOptions = {}) {
  const { mapDeliveryNoteForPdf } = await import("@/lib/map-delivery-note-for-pdf");
  const mapped = mapDeliveryNoteForPdf(note);
  const logoDataUri = getQuotationLogoDataUri();
  const headerDataUri = getQuotationHeaderDataUri();
  const footerDataUri = getQuotationFooterDataUri();
  const brandOpts = { logoDataUri, headerDataUri, footerDataUri, ...pdfOptions };

  try {
    return await renderDeliveryNotePdfBuffer(mapped, brandOpts);
  } catch (err) {
    if (!isBrowserClosedError(err)) throw err;
    console.warn("[PDF] Browser closed during delivery note generation, retrying once:", err?.message);
    return await renderDeliveryNotePdfBuffer(mapped, brandOpts);
  }
}
