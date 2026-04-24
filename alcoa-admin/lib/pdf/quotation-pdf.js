import { launchBrowser } from "./chromium";

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

function buildQuotationHTML(quotation) {
  const {
    quoteNumber = "",
    customerName = "",
    customerAddress = "",
    customerTRN = "",
    contactPersonName = "",
    contactPersonDesignation = "",
    quoteDate,
    validUntil,
    quoteType = "rental",
    subject = "",
    salesExecutive = "",
    preparedBy = "",
    paymentTerms = "Cash/CDC",
    deliveryTerms = "7-10 days from date of order",
    projectDuration = "",
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
    bankDetails = {},
  } = quotation;

  const companyName = process.env.NEXT_PUBLIC_APP_NAME || "ALCOA ALUMINIUM SCAFFOLDING LLC";
  const companyEmail = process.env.COMPANY_EMAIL || "sales@alcoascaffolding.com";

  const defaultTerms = `
1. All prices quoted are in AED (UAE Dirhams) unless otherwise stated.
2. This quotation is valid for 30 days from the date of issue.
3. Payment terms: ${paymentTerms}.
4. Delivery terms: ${deliveryTerms}.
5. Equipment remains the property of ${companyName} until full payment is received.
6. The client is responsible for securing the equipment during the rental period.
7. Any damage to equipment will be charged to the client.
8. ${companyName} reserves the right to withdraw or revise this quotation without prior notice.`;

  const itemRows = items
    .map(
      (item, i) => `
    <tr class="${i % 2 === 0 ? "row-even" : "row-odd"}">
      <td class="center">${i + 1}</td>
      <td>
        <strong>${item.equipmentType || ""}</strong>
        ${item.description ? `<br><span class="text-sm text-gray">${item.description}</span>` : ""}
        ${item.specifications ? `<br><span class="text-sm text-gray">${item.specifications}</span>` : ""}
        ${item.size ? `<br><span class="text-sm text-gray">Size: ${item.size}</span>` : ""}
      </td>
      <td class="center">${item.quantity} ${item.unit || "Nos"}</td>
      <td class="right">${formatCurrency(item.ratePerUnit, currency)}</td>
      <td class="right">${formatCurrency(item.subtotal, currency)}</td>
    </tr>`
    )
    .join("");

  const chargesRows = [
    deliveryCharges > 0 ? `<tr><td colspan="4" class="right">Delivery Charges:</td><td class="right">${formatCurrency(deliveryCharges, currency)}</td></tr>` : "",
    installationCharges > 0 ? `<tr><td colspan="4" class="right">Installation Charges:</td><td class="right">${formatCurrency(installationCharges, currency)}</td></tr>` : "",
    pickupCharges > 0 ? `<tr><td colspan="4" class="right">Pickup Charges:</td><td class="right">${formatCurrency(pickupCharges, currency)}</td></tr>` : "",
    discount > 0 ? `<tr><td colspan="4" class="right text-green">Discount${discountType === "percentage" ? ` (${discount}%)` : ""}:</td><td class="right text-green">- ${formatCurrency(discountType === "percentage" ? (subtotal * discount) / 100 : discount, currency)}</td></tr>` : "",
  ]
    .filter(Boolean)
    .join("");

  const bankSection = bankDetails?.accountNumber ? `
  <div class="section">
    <div class="section-title">Bank Details</div>
    <table class="details-table">
      ${bankDetails.bankName ? `<tr><td class="detail-label">Bank Name:</td><td>${bankDetails.bankName}</td></tr>` : ""}
      ${bankDetails.accountName ? `<tr><td class="detail-label">Account Name:</td><td>${bankDetails.accountName}</td></tr>` : ""}
      ${bankDetails.accountNumber ? `<tr><td class="detail-label">Account Number:</td><td>${bankDetails.accountNumber}</td></tr>` : ""}
      ${bankDetails.iban ? `<tr><td class="detail-label">IBAN:</td><td>${bankDetails.iban}</td></tr>` : ""}
      ${bankDetails.swiftCode ? `<tr><td class="detail-label">Swift Code:</td><td>${bankDetails.swiftCode}</td></tr>` : ""}
      ${bankDetails.branch ? `<tr><td class="detail-label">Branch:</td><td>${bankDetails.branch}</td></tr>` : ""}
    </table>
  </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quoteNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: white; }
    .page { width: 210mm; min-height: 297mm; padding: 15mm; }
    .header-bar { background: linear-gradient(135deg, #a54100, #7c2d12); color: white; padding: 20px 25px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .company-name { font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
    .company-sub { font-size: 11px; opacity: 0.85; margin-top: 3px; }
    .quote-badge { background: rgba(255,255,255,0.2); padding: 8px 15px; border-radius: 6px; text-align: right; }
    .quote-badge .label { font-size: 11px; opacity: 0.85; }
    .quote-badge .number { font-size: 18px; font-weight: bold; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
    .info-box-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px; font-weight: bold; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 500; color: #111827; text-align: right; max-width: 60%; }
    .customer-name { font-size: 15px; font-weight: bold; color: #111827; margin-bottom: 4px; }
    .customer-sub { font-size: 12px; color: #6b7280; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .items-table th { background: #a54100; color: white; padding: 9px 10px; font-size: 12px; text-align: left; }
    .items-table th.center, .items-table td.center { text-align: center; }
    .items-table th.right, .items-table td.right { text-align: right; }
    .row-even { background: #ffffff; }
    .row-odd { background: #fafafa; }
    .items-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .text-sm { font-size: 11px; }
    .text-gray { color: #6b7280; }
    .text-green { color: #059669; }
    .totals-section { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .totals-table { width: 300px; }
    .totals-table tr td { padding: 6px 10px; font-size: 13px; }
    .total-row { background: #a54100; color: white; font-weight: bold; font-size: 15px; }
    .total-row td { padding: 10px; }
    .amount-words { background: #fff7ed; border: 1px solid #fdba74; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 12px; }
    .amount-words strong { color: #9a3412; }
    .section { margin-bottom: 15px; }
    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #a54100; border-bottom: 2px solid #a54100; padding-bottom: 4px; margin-bottom: 10px; }
    .details-table { width: 100%; }
    .details-table td { padding: 4px 8px; font-size: 12px; }
    .detail-label { color: #6b7280; width: 150px; }
    .terms-list { font-size: 11px; color: #4b5563; line-height: 1.8; white-space: pre-line; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .signature-box { text-align: center; }
    .signature-line { border-bottom: 2px solid #374151; margin-bottom: 8px; height: 50px; }
    .signature-label { font-size: 11px; color: #6b7280; }
    .footer-bar { background: #0f172a; color: white; padding: 12px 20px; border-radius: 6px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
    .footer-bar a { color: #fdba74; text-decoration: none; }
  </style>
</head>
<body>
<div class="page">
  <div class="header-bar">
    <div>
      <div class="company-name">${companyName}</div>
      <div class="company-sub">Professional Scaffolding Solutions | UAE</div>
    </div>
    <div class="quote-badge">
      <div class="label">QUOTATION</div>
      <div class="number">${quoteNumber}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-title">Bill To</div>
      <div class="customer-name">${customerName}</div>
      ${customerAddress ? `<div class="customer-sub">${customerAddress}</div>` : ""}
      ${customerTRN ? `<div class="customer-sub">TRN: ${customerTRN}</div>` : ""}
      ${contactPersonName ? `<div class="customer-sub">Attn: ${contactPersonName}${contactPersonDesignation ? ` (${contactPersonDesignation})` : ""}</div>` : ""}
    </div>
    <div class="info-box">
      <div class="info-box-title">Quote Details</div>
      <div class="info-row"><span class="info-label">Quote Date:</span><span class="info-value">${formatDate(quoteDate)}</span></div>
      <div class="info-row"><span class="info-label">Valid Until:</span><span class="info-value" style="color:#dc2626;">${formatDate(validUntil)}</span></div>
      <div class="info-row"><span class="info-label">Quote Type:</span><span class="info-value" style="text-transform:capitalize;">${quoteType}</span></div>
      ${salesExecutive ? `<div class="info-row"><span class="info-label">Sales Executive:</span><span class="info-value">${salesExecutive}</span></div>` : ""}
      ${preparedBy ? `<div class="info-row"><span class="info-label">Prepared By:</span><span class="info-value">${preparedBy}</span></div>` : ""}
      ${projectDuration ? `<div class="info-row"><span class="info-label">Duration:</span><span class="info-value">${projectDuration}</span></div>` : ""}
    </div>
  </div>

  ${subject ? `<div style="background:#f0f9ff;border-left:4px solid #0284c7;padding:10px 15px;border-radius:4px;margin-bottom:15px;font-size:13px;"><strong>Subject:</strong> ${subject}</div>` : ""}

  <table class="items-table">
    <thead>
      <tr>
        <th style="width:40px;">#</th>
        <th>Description</th>
        <th class="center" style="width:80px;">Qty</th>
        <th class="right" style="width:120px;">Rate</th>
        <th class="right" style="width:130px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr><td style="color:#6b7280;">Subtotal:</td><td style="text-align:right;">${formatCurrency(subtotal, currency)}</td></tr>
      ${chargesRows}
      <tr><td style="color:#6b7280;">VAT (${vatPercentage}%):</td><td style="text-align:right;">${formatCurrency(vatAmount, currency)}</td></tr>
      <tr class="total-row"><td>TOTAL (${currency}):</td><td style="text-align:right;">${formatCurrency(totalAmount, currency)}</td></tr>
    </table>
  </div>

  <div class="amount-words">
    <strong>Amount in Words: </strong>${numberToWords(totalAmount)} Only.
  </div>

  <div class="info-grid">
    <div class="section">
      <div class="section-title">Terms</div>
      <table class="details-table">
        <tr><td class="detail-label">Payment Terms:</td><td>${paymentTerms}</td></tr>
        <tr><td class="detail-label">Delivery Terms:</td><td>${deliveryTerms}</td></tr>
      </table>
    </div>
    ${bankSection || `<div></div>`}
  </div>

  ${notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:12px;color:#374151;line-height:1.6;">${notes.replace(/\n/g, "<br>")}</p></div>` : ""}

  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <div class="terms-list">${(termsAndConditions || defaultTerms).replace(/\n/g, "<br>")}</div>
  </div>

  <div class="signatures">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signature<br>${companyName}</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Customer Signature & Stamp<br>${customerName}</div>
    </div>
  </div>

  <div class="footer-bar">
    <span>${companyName}</span>
    <span><a href="mailto:${companyEmail}">${companyEmail}</a></span>
    <span>Document generated on ${formatDate(new Date())}</span>
  </div>
</div>
</body>
</html>`;
}

/**
 * Generate a PDF buffer for a quotation
 * @param {Object} quotation - Mongoose document or plain object
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateQuotationPDF(quotation) {
  const html = buildQuotationHTML(quotation);

  const browser = await launchBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) await page.close();
    await browser.close();
  }
}
