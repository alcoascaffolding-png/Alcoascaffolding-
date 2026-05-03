import {
  QUOTATION_BRAND,
  getQuotationCompanyName,
  getQuotationTagline,
  getQuotationCompanyEmail,
} from "@/lib/quotation-brand";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function quotationEmailTemplate(quotation, options = {}) {
  const { logoDataUri = "" } = options;
  const b = QUOTATION_BRAND;
  const companyName = getQuotationCompanyName();
  const tagline = getQuotationTagline();
  const companyEmail = getQuotationCompanyEmail();

  const {
    quoteNumber,
    customerName,
    customerAddress = "",
    quoteDate,
    validUntil,
    quoteType = "rental",
    subject = "",
    salesExecutive,
    preparedBy,
    items = [],
    subtotal = 0,
    vatAmount = 0,
    totalAmount = 0,
    vatPercentage = 5,
    paymentTerms = "Cash/CDC",
    deliveryTerms = "7-10 days from date of order",
    notes,
  } = quotation;

  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" alt="" width="132" height="52" style="height:52px;width:auto;max-width:160px;object-fit:contain;display:block;" />`
    : "";

  const itemRows = items
    .map(
      (item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"};">
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${i + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">
        <strong style="color:${b.text};">${item.equipmentType || ""}</strong>
        ${item.description ? `<br><span style="color:${b.muted};font-size:12px;">${item.description}</span>` : ""}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;">${item.quantity} ${item.unit || "Nos"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;">${formatCurrency(item.ratePerUnit)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quoteNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.55;color:${b.text};margin:0;padding:24px 12px;background:#e8eef5;">
  <div style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(29,58,108,0.12);border:1px solid ${b.accentBorder};">
    <div style="background:${b.headerGradient};color:#fff;padding:22px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:16px;min-width:0;">
        ${logoImg}
        <div>
          <div style="font-size:18px;font-weight:700;letter-spacing:0.02em;">${companyName}</div>
          <div style="font-size:11px;opacity:0.92;margin-top:4px;font-weight:500;">${tagline}</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.28);padding:10px 16px;border-radius:8px;text-align:right;">
        <div style="font-size:10px;opacity:0.92;letter-spacing:0.12em;font-weight:600;">QUOTATION</div>
        <div style="font-size:17px;font-weight:700;margin-top:2px;">${quoteNumber}</div>
      </div>
    </div>

    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="vertical-align:top;width:50%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${b.muted};font-weight:700;margin-bottom:8px;">Bill to</div>
            <div style="font-size:16px;font-weight:700;color:${b.text};">${customerName}</div>
            ${customerAddress ? `<div style="font-size:12px;color:${b.muted};margin-top:6px;white-space:pre-line;">${String(customerAddress).replace(/\n/g, "<br>")}</div>` : ""}
          </td>
          <td style="width:16px;"></td>
          <td style="vertical-align:top;width:50%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${b.muted};font-weight:700;margin-bottom:8px;">Quote details</div>
            <table style="width:100%;font-size:12px;">
              <tr><td style="color:${b.muted};padding:3px 0;">Quote date</td><td style="text-align:right;font-weight:600;">${formatDate(quoteDate)}</td></tr>
              <tr><td style="color:${b.muted};padding:3px 0;">Valid until</td><td style="text-align:right;font-weight:600;color:#dc2626;">${formatDate(validUntil)}</td></tr>
              <tr><td style="color:${b.muted};padding:3px 0;">Type</td><td style="text-align:right;font-weight:600;text-transform:capitalize;">${quoteType}</td></tr>
              ${salesExecutive ? `<tr><td style="color:${b.muted};padding:3px 0;">Sales executive</td><td style="text-align:right;font-weight:600;">${salesExecutive}</td></tr>` : ""}
              ${preparedBy ? `<tr><td style="color:${b.muted};padding:3px 0;">Prepared by</td><td style="text-align:right;font-weight:600;">${preparedBy}</td></tr>` : ""}
            </table>
          </td>
        </tr>
      </table>

      ${subject ? `<div style="background:${b.accentWash};border-left:4px solid ${b.primary};padding:12px 16px;border-radius:6px;margin-bottom:20px;font-size:13px;"><strong>Subject:</strong> ${subject}</div>` : ""}

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:${b.primary};color:#fff;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;width:40px;">#</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;">Description</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;">Rate</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:280px;margin-left:auto;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:8px 10px;font-size:13px;color:${b.muted};">Subtotal:</td>
          <td style="padding:8px 10px;font-size:13px;text-align:right;font-weight:600;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 10px;font-size:13px;color:${b.muted};">VAT (${vatPercentage}%):</td>
          <td style="padding:8px 10px;font-size:13px;text-align:right;">${formatCurrency(vatAmount)}</td>
        </tr>
        <tr style="background:${b.totalBar};color:#fff;">
          <td style="padding:12px 10px;font-size:15px;font-weight:700;">TOTAL:</td>
          <td style="padding:12px 10px;font-size:15px;font-weight:700;text-align:right;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <table style="width:100%;margin-bottom:16px;font-size:13px;">
        <tr>
          <td style="padding:6px 0;color:${b.muted};width:38%;">Payment terms</td>
          <td style="padding:6px 0;">${paymentTerms}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${b.muted};">Delivery terms</td>
          <td style="padding:6px 0;">${deliveryTerms}</td>
        </tr>
      </table>

      ${notes ? `<div style="background:${b.accentWash};border:1px solid ${b.accentBorder};padding:14px 16px;border-radius:8px;margin-bottom:8px;"><p style="margin:0 0 6px;font-weight:700;color:${b.primary};font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Notes</p><p style="margin:0;color:${b.text};font-size:13px;line-height:1.6;">${String(notes).replace(/\n/g, "<br>")}</p></div>` : ""}
    </div>

    <div style="background:${b.footerBg};color:#e2e8f0;padding:18px 24px;text-align:center;font-size:12px;">
      <p style="margin:4px 0;font-weight:700;color:#fff;">${companyName}</p>
      <p style="margin:4px 0;"><a href="mailto:${companyEmail}" style="color:#c7d2fe;text-decoration:none;">${companyEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}
