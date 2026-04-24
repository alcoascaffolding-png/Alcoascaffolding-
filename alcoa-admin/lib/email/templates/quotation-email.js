const companyName = process.env.NEXT_PUBLIC_APP_NAME || "Alcoa Aluminium Scaffolding";
const companyEmail = process.env.COMPANY_EMAIL || "sales@alcoascaffolding.com";

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount, currency = "AED") {
  return `${currency} ${Number(amount || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function quotationEmailTemplate(quotation) {
  const {
    quoteNumber,
    customerName,
    quoteDate,
    validUntil,
    items = [],
    subtotal = 0,
    vatAmount = 0,
    totalAmount = 0,
    vatPercentage = 5,
    paymentTerms = "Cash/CDC",
    deliveryTerms = "7-10 days from date of order",
    notes,
    salesExecutive,
  } = quotation;

  const itemRows = items
    .map(
      (item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"};">
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;">${i + 1}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;">
        <strong>${item.equipmentType}</strong>
        ${item.description ? `<br><span style="color:#6b7280;font-size:12px;">${item.description}</span>` : ""}
      </td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:center;">${item.quantity} ${item.unit || "Nos"}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;">${formatCurrency(item.ratePerUnit)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:13px;text-align:right;font-weight:bold;">${formatCurrency(item.subtotal)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quoteNumber}</title>
</head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f5f5f5;">
  <div style="max-width:700px;margin:20px auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(135deg,#a54100 0%,#7c2d12 100%);color:white;padding:30px;text-align:center;">
      <h1 style="margin:0;font-size:28px;">QUOTATION</h1>
      <p style="margin:8px 0 0;font-size:16px;opacity:0.9;">${quoteNumber}</p>
    </div>

    <div style="padding:30px;">
      <table style="width:100%;margin-bottom:20px;">
        <tr>
          <td style="vertical-align:top;width:50%;">
            <p style="margin:0 0 5px;color:#6b7280;font-size:12px;text-transform:uppercase;font-weight:bold;">To:</p>
            <p style="margin:0;font-size:16px;font-weight:bold;color:#111827;">${customerName}</p>
          </td>
          <td style="vertical-align:top;width:50%;text-align:right;">
            <p style="margin:0 0 3px;font-size:13px;color:#6b7280;">Date: <strong style="color:#111827;">${formatDate(quoteDate)}</strong></p>
            <p style="margin:0;font-size:13px;color:#6b7280;">Valid Until: <strong style="color:#e53e3e;">${formatDate(validUntil)}</strong></p>
            ${salesExecutive ? `<p style="margin:3px 0 0;font-size:13px;color:#6b7280;">Executive: <strong style="color:#111827;">${salesExecutive}</strong></p>` : ""}
          </td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#a54100;color:white;">
            <th style="padding:10px;text-align:left;font-size:13px;width:40px;">#</th>
            <th style="padding:10px;text-align:left;font-size:13px;">Description</th>
            <th style="padding:10px;text-align:center;font-size:13px;">Qty</th>
            <th style="padding:10px;text-align:right;font-size:13px;">Rate</th>
            <th style="padding:10px;text-align:right;font-size:13px;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:300px;margin-left:auto;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:8px 10px;font-size:13px;color:#6b7280;">Subtotal:</td>
          <td style="padding:8px 10px;font-size:13px;text-align:right;font-weight:bold;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr>
          <td style="padding:8px 10px;font-size:13px;color:#6b7280;">VAT (${vatPercentage}%):</td>
          <td style="padding:8px 10px;font-size:13px;text-align:right;">${formatCurrency(vatAmount)}</td>
        </tr>
        <tr style="background:#4f46e5;color:white;">
          <td style="padding:12px 10px;font-size:16px;font-weight:bold;">TOTAL:</td>
          <td style="padding:12px 10px;font-size:16px;font-weight:bold;text-align:right;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>

      <table style="width:100%;margin-bottom:20px;">
        <tr>
          <td style="padding:8px;font-size:13px;color:#6b7280;width:40%;">Payment Terms:</td>
          <td style="padding:8px;font-size:13px;color:#111827;">${paymentTerms}</td>
        </tr>
        <tr>
          <td style="padding:8px;font-size:13px;color:#6b7280;">Delivery Terms:</td>
          <td style="padding:8px;font-size:13px;color:#111827;">${deliveryTerms}</td>
        </tr>
      </table>

      ${notes ? `<div style="background:#fff7ed;border-left:4px solid #4f46e5;padding:15px;border-radius:5px;margin-bottom:20px;"><p style="margin:0 0 5px;font-weight:bold;color:#a54100;">Notes:</p><p style="margin:0;color:#374151;font-size:13px;">${notes.replace(/\n/g, "<br>")}</p></div>` : ""}
    </div>

    <div style="background:#0f172a;color:white;padding:20px;text-align:center;">
      <p style="margin:5px 0;font-weight:bold;">${companyName}</p>
      <p style="margin:5px 0;font-size:13px;"><a href="mailto:${companyEmail}" style="color:#fdba74;">${companyEmail}</a></p>
    </div>
  </div>
</body>
</html>`;
}
