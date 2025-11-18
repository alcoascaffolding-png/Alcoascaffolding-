/**
 * Playwright-based Quotation PDF Generator
 * Generates professional PDFs matching ACE ALUMINIUM design
 * Customized for ALCOA ALUMINIUM SCAFFOLDING
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

/**
 * Convert number to words
 */
const numberToWords = (num) => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const numToWords = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numToWords(n % 100) : '');
    if (n < 1000000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
    return n.toLocaleString();
  };
  
  return numToWords(Math.floor(num));
};

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Generate Terms & Conditions page HTML
 */
const generateTermsAndConditionsPageHTML = (quotation) => {
  // Default terms & conditions
  const defaultTerms = [
    'Current Dated Cheque / Cash with confirmation of order',
    'The Validity of the Quotation is 1 week from the date of Quotation',
    'Delivery: 1 day from the date of confirmed order.',
    'Tower assembly not included.',
    'Test certificates will be provided'
  ];
  
  // Get terms from quotation or use defaults
  let terms = defaultTerms;
  if (quotation.termsAndConditions) {
    // If it's a string, split by newlines or use as single item
    if (typeof quotation.termsAndConditions === 'string') {
      const splitTerms = quotation.termsAndConditions.split('\n').filter(t => t.trim());
      terms = splitTerms.length > 0 ? splitTerms : defaultTerms;
    }
  }
  
  // Calculate security cheque amount (use total amount or net total)
  const subtotalBeforeCharges = quotation.items.reduce((sum, item) => {
    const taxable = item.taxableAmount || item.subtotal || (item.quantity * item.ratePerUnit);
    return sum + parseFloat(taxable);
  }, 0);
  
  const additionalCharges = (parseFloat(quotation.deliveryCharges) || 0) + 
                             (parseFloat(quotation.installationCharges) || 0) + 
                             (parseFloat(quotation.pickupCharges) || 0);
  
  let beforeDiscount = subtotalBeforeCharges + additionalCharges;
  
  // Apply discount
  if (quotation.discount > 0) {
    if (quotation.discountType === 'percentage') {
      beforeDiscount -= (beforeDiscount * quotation.discount / 100);
    } else {
      beforeDiscount -= parseFloat(quotation.discount);
    }
  }
  
  const vatAmount = beforeDiscount * ((quotation.vatPercentage || 5) / 100);
  const netTotal = beforeDiscount + vatAmount;
  const securityChequeAmount = netTotal || quotation.totalAmount || 0;
  
  // Bank details (can be customized or use defaults)
  const bankDetails = {
    accountName: quotation.bankAccountName || 'ALCOA ALUMINIUM SCAFFOLDING',
    bankName: quotation.bankName || 'HABIB BANK AG ZURICH, AL FALAH BR, ABU DHABI',
    swiftCode: quotation.bankSwiftCode || 'HBZUAEADXXX',
    iban: quotation.bankIBAN || 'AE160290720311105877735',
    accountNo: quotation.bankAccountNumber || '0203070203111050877735'
  };
  
  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms & Conditions - ${quotation.quoteNumber || ''}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 9pt;
      color: #2c3e50;
      background: white;
      padding: 3mm 5mm 20mm 5mm;
      line-height: 1.4;
      min-height: 100vh;
      position: relative;
    }
    
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    
    /* Header Section - Compact */
    .header {
      text-align: center;
      margin-bottom: 4mm;
    }
    
    .tagline {
      font-size: 8pt;
      color: #3c3c3c;
      margin-bottom: 1mm;
    }
    
    .divider {
      border-top: 1px solid #c8c8c8;
      margin: 2mm 0;
    }
    
    .document-title {
      font-size: 16pt;
      font-weight: bold;
      color: #dc3545;
      text-align: center;
      margin: 2mm 0 1mm;
    }
    
    .trn {
      font-size: 8pt;
      color: #3c3c3c;
      text-align: center;
      margin-bottom: 3mm;
    }
    
    .section {
      margin-bottom: 6mm;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 3mm;
      text-decoration: underline;
    }
    
    .terms-list {
      list-style: decimal;
      padding-left: 18px;
      margin-bottom: 4mm;
    }
    
    .terms-list li {
      margin-bottom: 2.5mm;
      line-height: 1.5;
      color: #2c3e50;
      font-size: 8.5pt;
    }
    
    .security-cheque {
      margin-top: 3mm;
      padding: 2mm;
      background-color: #ffffff;
      border: 1px solid #e1e1e1;
      font-size: 8.5pt;
      line-height: 1.4;
      color: #2c3e50;
    }
    
    .bank-details-section {
      margin-top: 6mm;
    }
    
    .bank-details-title {
      font-size: 10pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 4mm;
      text-align: center;
      text-decoration: underline;
    }
    
    .bank-info {
      text-align: left;
    }
    
    .bank-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #2c3e50;
      margin-top: 3mm;
    }
    
    .bank-table td {
      padding: 3mm 4mm;
      border: 1px solid #2c3e50;
      font-size: 8.5pt;
    }
    
    .bank-label {
      font-weight: bold;
      color: #2c3e50;
      width: 35%;
      background-color: #f8f9fa;
    }
    
    .bank-value {
      color: #2c3e50;
      width: 65%;
    }
    
    .section-divider {
      border-top: 2px solid #2c3e50;
      margin: 8mm 0 6mm 0;
      width: 100%;
    }
    
    .security-cheque-text {
      margin-top: 3mm;
      line-height: 1.5;
      color: #2c3e50;
      font-size: 8.5pt;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 8mm;
      padding-top: 5mm;
      border-top: 1px solid #d0d0d0;
    }
    
    .signature-box {
      width: 45%;
      text-align: center;
    }
    
    .signature-label {
      font-weight: bold;
      font-size: 8.5pt;
      margin-bottom: 15mm;
      color: #2c3e50;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 1mm;
      padding-top: 1mm;
      min-height: 12mm;
    }
    
    /* Footer Section - Fixed on every page */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background-color: #f0f0f0;
      padding: 4mm 5mm;
      font-size: 7pt;
      text-align: center;
      z-index: 1000;
    }
    
    .footer-services {
      color: #3c3c3c;
      margin-bottom: 2mm;
    }
    
    .footer-contact {
      color: #3c3c3c;
      margin-bottom: 1mm;
    }
    
    .footer-address {
      color: #646464;
      font-size: 6.5pt;
    }
  </style>
</head>
<body>
  <div class="page-break"></div>
  
  <!-- Header -->
  <div class="header">
    <div>
      <span style="color: #0066cc; font-size: 16pt; font-weight: bold;">ALCOA</span>
      <span style="color: #000000; font-size: 16pt; font-weight: bold;"> ALUMINIUM SCAFFOLDING</span>
      <span style="color: #000000; font-size: 12pt; font-weight: bold; margin-left: 8px; direction: rtl; font-family: 'Arial', 'Tahoma', sans-serif;">الكوا سقالات ألمنيوم</span>
    </div>
    <div class="tagline">Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding</div>
    <div style="font-size: 7pt; color: #666; margin: 1mm 0;">Sale | Hire | Installation | Maintenance | Safety Inspection | Training</div>
    
    <div class="divider"></div>
    
    <div class="document-title">QUOTATION</div>
    <div class="trn">TRN: 100123456700003</div>
  </div>
  
  <!-- Terms & Conditions -->
  <div class="section">
    <div class="section-title">Terms & Conditions</div>
    <ol class="terms-list">
      ${terms.map(term => `<li>${term}</li>`).join('')}
    </ol>
    <div class="security-cheque-text">
      Undated security cheque of AED ${securityChequeAmount.toLocaleString()}/- to be provided upon delivery of materials and will be returned during collection of materials.
    </div>
  </div>
  
  <!-- Horizontal Divider -->
  <div class="section-divider"></div>
  
  <!-- Bank Details -->
  <div class="section bank-details-section">
    <div class="bank-details-title">BANK DETAILS</div>
    <table class="bank-table">
      <tr>
        <td class="bank-label">Account Name:</td>
        <td class="bank-value">${bankDetails.accountName}</td>
      </tr>
      <tr>
        <td class="bank-label">Bank Name:</td>
        <td class="bank-value">${bankDetails.bankName}</td>
      </tr>
      <tr>
        <td class="bank-label">Swift Code:</td>
        <td class="bank-value">${bankDetails.swiftCode}</td>
      </tr>
      <tr>
        <td class="bank-label">IBAN:</td>
        <td class="bank-value">${bankDetails.iban}</td>
      </tr>
      <tr>
        <td class="bank-label">Account No:</td>
        <td class="bank-value">${bankDetails.accountNo}</td>
      </tr>
    </table>
  </div>
  
  <!-- Signatures -->
  <div class="signatures">
    <div class="signature-box">
      <div class="signature-label">CUSTOMER'S SIGNATURE</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-label">For ALCOA ALUMINIUM SCAFFOLDING</div>
      <div class="signature-line"></div>
    </div>
  </div>
  
  <!-- Footer - Always at bottom -->
  <div class="footer">
    <div class="footer-services">
      Sale & Hire of Single & Double Width Mobile Towers • Ladders • Steel Cup Lock Scaffolding • Couplers
    </div>
    <div class="footer-contact">
      Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Web: www.alcoascaffolding.com
    </div>
    <div class="footer-address">
      Musaffah, Abu Dhabi, UAE
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate HTML template for quotation
 */
const generateQuotationHTML = (quotation) => {
  // Calculate totals
  const subtotalBeforeCharges = quotation.items.reduce((sum, item) => {
    const taxable = item.taxableAmount || item.subtotal || (item.quantity * item.ratePerUnit);
    return sum + parseFloat(taxable);
  }, 0);
  
  const additionalCharges = (parseFloat(quotation.deliveryCharges) || 0) + 
                             (parseFloat(quotation.installationCharges) || 0) + 
                             (parseFloat(quotation.pickupCharges) || 0);
  
  let beforeDiscount = subtotalBeforeCharges + additionalCharges;
  
  // Apply discount
  if (quotation.discount > 0) {
    if (quotation.discountType === 'percentage') {
      beforeDiscount -= (beforeDiscount * quotation.discount / 100);
    } else {
      beforeDiscount -= parseFloat(quotation.discount);
    }
  }
  
  const vatAmount = beforeDiscount * ((quotation.vatPercentage || 5) / 100);
  const netTotal = beforeDiscount + vatAmount;
  const amountInWords = numberToWords(Math.floor(netTotal));
  const amountText = `UAE Dirham ${amountInWords} Dirhams And ${Math.floor((netTotal % 1) * 100)} Fils Only`;

  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quotation.quoteNumber || ''}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 9pt;
      color: #2c3e50;
      background: white;
      padding: 5mm 5mm 30mm 5mm;
      line-height: 1.4;
      position: relative;
      min-height: 100vh;
    }
    
    /* Header Section */
    .header {
      text-align: center;
      margin-bottom: 8mm;
    }
    
    .company-name {
      font-size: 18pt;
      font-weight: bold;
      background: linear-gradient(to right, #dc3545 0%, #dc3545 50%, #0066cc 50%, #0066cc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1mm;
      display: inline-block;
    }
    
    .company-name-arabic {
      font-size: 14pt;
      font-weight: bold;
      color: #0066cc;
      direction: rtl;
      font-family: 'Arial', 'Tahoma', sans-serif;
      margin-bottom: 2mm;
    }
    
    .tagline {
      font-size: 9pt;
      color: #3c3c3c;
      margin-bottom: 2mm;
    }
    
    
    .divider {
      border-top: 1px solid #c8c8c8;
      margin: 3mm 0;
    }
    
    .document-title {
      font-size: 18pt;
      font-weight: bold;
      color: #dc3545;
      text-align: center;
      margin: 4mm 0 2mm;
    }
    
    .trn {
      font-size: 9pt;
      color: #3c3c3c;
      text-align: center;
      margin-bottom: 5mm;
    }
    
    /* Customer and Quote Details Table */
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4mm 0;
      font-size: 8pt;
      border: 1px solid #d0d0d0;
    }
    
    .details-table td {
      padding: 5px 8px;
      border: 1px solid #e1e1e1;
      vertical-align: top;
    }
    
    .details-table .detail-label {
      font-weight: bold;
      color: #0066cc;
      width: 40%;
      background-color: #f8f9fa;
    }
    
    .details-table .detail-value {
      color: #2c3e50;
      width: 60%;
    }
    
    .details-table tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .details-table tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    /* Table Styles */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 4mm 0;
      font-size: 8pt;
    }
    
    .items-table thead {
      background-color: #0066cc;
      color: white;
    }
    
    .items-table th {
      padding: 6px 4px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #004d99;
      font-size: 7.5pt;
    }
    
    .items-table td {
      padding: 6px 4px;
      border: 1px solid #e1e1e1;
      vertical-align: middle;
    }
    
    .items-table tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .items-table tbody tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    .col-sn { width: 3%; text-align: center; font-weight: bold; }
    .col-desc { width: 35%; }
    .col-wt { width: 8%; text-align: center; }
    .col-cbm { width: 8%; text-align: center; }
    .col-qty { width: 6%; text-align: center; font-weight: bold; }
    .col-rate { width: 10%; text-align: right; }
    .col-taxable { width: 11%; text-align: right; }
    .col-vat-pct { width: 6%; text-align: center; }
    .col-vat-amt { width: 8%; text-align: right; }
    .col-amount { width: 9%; text-align: right; font-weight: bold; }
    
    .item-description {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .item-text {
      flex: 1;
      font-weight: bold;
      color: #2c3e50;
    }
    
    .item-image {
      width: 32px;
      height: 24px;
      object-fit: contain;
      border: 1px solid #d5d5d5;
      background: white;
      flex-shrink: 0;
    }
    
    /* Totals Section */
    .totals-row {
      background-color: #f8f9fa !important;
      font-weight: bold;
    }
    
    .totals-row td {
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
    }
    
    .totals-label {
      text-align: right !important;
      padding-right: 10px;
    }
    
    .summary-row {
      background-color: #ffffff !important;
    }
    
    .summary-row td {
      border: 1px solid #d0d0d0;
    }
    
    .net-total-row {
      background-color: #ffffff !important;
      border-top: 2px solid #333 !important;
      border-bottom: 2px solid #333 !important;
    }
    
    .net-total-row td {
      border-top: 2px solid #333;
      border-bottom: 2px solid #333;
    }
    
    .net-total-amount {
      color: #0066cc;
      font-size: 10pt;
      font-weight: bold;
    }
    
    .amount-in-words {
      font-size: 7.5pt;
      color: #666666;
      font-style: italic;
      padding-top: 2px;
    }
    
    /* Footer Section - Fixed on every page */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      background-color: #f0f0f0;
      padding: 4mm 5mm;
      font-size: 7pt;
      text-align: center;
      z-index: 1000;
    }
    
    .footer-services {
      color: #3c3c3c;
      margin-bottom: 2mm;
    }
    
    .footer-contact {
      color: #3c3c3c;
      margin-bottom: 1mm;
    }
    
    .footer-address {
      color: #646464;
      font-size: 6.5pt;
    }
    
  </style>
 </head>
 <body>
  <!-- Header -->
  <div class="header">
    <div>
      <span style="color: #0066cc; font-size: 18pt; font-weight: bold;">ALCOA</span>
      <span style="color: #000000; font-size: 18pt; font-weight: bold;"> ALUMINIUM SCAFFOLDING</span>
      <span style="color: #000000; font-size: 14pt; font-weight: bold; margin-left: 10px; direction: rtl; font-family: 'Arial', 'Tahoma', sans-serif;">الكوا سقالات ألمنيوم</span>
    </div>
    <div class="tagline">Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding</div>
    <div style="font-size: 7.5pt; color: #666; margin: 2mm 0;">Sale | Hire | Installation | Maintenance | Safety Inspection | Training</div>
    
    <div class="divider"></div>
    
    <div class="document-title">QUOTATION</div>
    <div class="trn">TRN: 100123456700003</div>
  </div>
  
  <!-- Customer and Quote Details Table -->
  <table class="details-table">
    <tbody>
      <tr>
        <td class="detail-label">CUSTOMER NAME:</td>
        <td class="detail-value">${quotation.customerName || 'N/A'}</td>
        <td class="detail-label">Quotation No:</td>
        <td class="detail-value">${quotation.quoteNumber || 'N/A'}</td>
      </tr>
      <tr>
        <td class="detail-label">ADDRESS:</td>
        <td class="detail-value">${quotation.customerAddress || 'N/A'}</td>
        <td class="detail-label">Date:</td>
        <td class="detail-value">${formatDate(quotation.quoteDate)}</td>
      </tr>
      <tr>
        <td class="detail-label">MOBILE NO:</td>
        <td class="detail-value">${quotation.customerPhone || 'N/A'}</td>
        <td class="detail-label">Sales Executive:</td>
        <td class="detail-value">${quotation.salesExecutive || 'N/A'}</td>
      </tr>
      <tr>
        <td class="detail-label">TRN:</td>
        <td class="detail-value">${quotation.customerTRN || 'N/A'}</td>
        <td class="detail-label">PO No:</td>
        <td class="detail-value">${quotation.customerPONumber || 'N/A'}</td>
      </tr>
      <tr>
        <td class="detail-label">CONTACT PERSON:</td>
        <td class="detail-value">${quotation.contactPersonName || 'N/A'}</td>
        <td class="detail-label">PAYMENT TERMS:</td>
        <td class="detail-value">${quotation.paymentTerms || 'Cash/CDC'}</td>
      </tr>
      ${quotation.subject ? `
      <tr>
        <td class="detail-label">Subject:</td>
        <td class="detail-value" colspan="3">${quotation.subject}</td>
      </tr>
      ` : ''}
    </tbody>
  </table>
  
  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="col-sn">SN</th>
        <th class="col-desc">Description of Goods</th>
        <th class="col-wt">Wt<br>(KG)</th>
        <th class="col-cbm">CBM</th>
        <th class="col-qty">Qty</th>
        <th class="col-rate">Rate<br>(AED)</th>
        <th class="col-taxable">Taxable<br>Amount</th>
        <th class="col-vat-pct">VAT<br>%</th>
        <th class="col-vat-amt">VAT<br>Amount</th>
        <th class="col-amount">Amount<br>(AED)</th>
      </tr>
    </thead>
    <tbody>
      ${quotation.items.map((item, index) => {
        const taxable = item.taxableAmount || item.subtotal || (item.quantity * item.ratePerUnit);
        const vatPercent = item.vatPercentage || 5;
        const vatAmt = item.vatAmount || (taxable * (vatPercent / 100));
        const total = taxable + vatAmt;
        const imageSrc = item.itemImage || '';
        const imageTag = imageSrc ? `<img src="${imageSrc}" alt="Item" class="item-image" onerror="this.style.display='none'">` : '';
        
        return `
        <tr>
          <td class="col-sn">${index + 1}</td>
          <td class="col-desc">
            <div class="item-description">
              <div class="item-text">${item.equipmentType}${item.description ? '<br>' + item.description : ''}</div>
              ${imageTag}
            </div>
          </td>
          <td class="col-wt">${item.weight ? parseFloat(item.weight).toFixed(2) : '0.00'}</td>
          <td class="col-cbm">${item.cbm ? parseFloat(item.cbm).toFixed(2) : '0.00'}</td>
          <td class="col-qty">${item.quantity}</td>
          <td class="col-rate">${item.ratePerUnit.toFixed(2)}</td>
          <td class="col-taxable">${taxable.toFixed(2)}</td>
          <td class="col-vat-pct">${vatPercent}</td>
          <td class="col-vat-amt">${vatAmt.toFixed(2)}</td>
          <td class="col-amount">${total.toFixed(2)}</td>
        </tr>
        `;
      }).join('')}
      
      <!-- Totals Row -->
      <tr class="totals-row">
        <td class="col-sn"></td>
        <td class="col-desc totals-label">TOTAL</td>
        <td class="col-wt"></td>
        <td class="col-cbm"></td>
        <td class="col-qty"></td>
        <td class="col-rate"></td>
        <td class="col-taxable">${subtotalBeforeCharges.toFixed(2)}</td>
        <td class="col-vat-pct"></td>
        <td class="col-vat-amt">${vatAmount.toFixed(2)}</td>
        <td class="col-amount net-total-amount">${netTotal.toFixed(2)}</td>
      </tr>
      
      <!-- Summary Rows -->
      <tr class="summary-row">
        <td class="col-sn"></td>
        <td class="col-desc">Total w/o VAT</td>
        <td class="col-wt"></td>
        <td class="col-cbm"></td>
        <td class="col-qty"></td>
        <td class="col-rate"></td>
        <td class="col-taxable">${beforeDiscount.toFixed(2)}</td>
        <td class="col-vat-pct"></td>
        <td class="col-vat-amt"></td>
        <td class="col-amount"></td>
      </tr>
      
      <tr class="summary-row">
        <td class="col-sn"></td>
        <td class="col-desc">VAT (${quotation.vatPercentage || 5}%)</td>
        <td class="col-wt"></td>
        <td class="col-cbm"></td>
        <td class="col-qty"></td>
        <td class="col-rate"></td>
        <td class="col-taxable"></td>
        <td class="col-vat-pct"></td>
        <td class="col-vat-amt">${vatAmount.toFixed(2)}</td>
        <td class="col-amount"></td>
      </tr>
      
      <tr class="net-total-row">
        <td class="col-sn"></td>
        <td class="col-desc">
          Net Total
          <div class="amount-in-words">${amountText}</div>
        </td>
        <td class="col-wt"></td>
        <td class="col-cbm"></td>
        <td class="col-qty"></td>
        <td class="col-rate"></td>
        <td class="col-taxable"></td>
        <td class="col-vat-pct"></td>
        <td class="col-vat-amt"></td>
        <td class="col-amount net-total-amount">${netTotal.toFixed(2)}</td>
      </tr>
     </tbody>
   </table>
   
   <!-- Footer - Always at bottom -->
   <div class="footer">
     <div class="footer-services">
       Sale & Hire of Single & Double Width Mobile Towers • Ladders • Steel Cup Lock Scaffolding • Couplers
     </div>
     <div class="footer-contact">
       Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Web: www.alcoascaffolding.com
     </div>
     <div class="footer-address">
       Musaffah, Abu Dhabi, UAE
     </div>
   </div>
 </body>
 </html>
  `;
};

/**
 * Generate PDF buffer from quotation data using Playwright
 * @param {Object} quotation - Quotation data
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateQuotationPDFBuffer = async (quotation) => {
  let browser = null;
  
  try {
    // Launch browser with production-friendly configuration
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Generate HTML for both pages
    const firstPageHTML = generateQuotationHTML(quotation);
    const termsPageHTML = generateTermsAndConditionsPageHTML(quotation);
    
    // Extract body content from both HTML strings (remove any style tags that might be in body)
    const extractBodyContent = (html) => {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      let bodyContent = bodyMatch ? bodyMatch[1] : html;
      // Remove any style tags that might have leaked into body
      bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      return bodyContent;
    };
    
    const firstPageBody = extractBodyContent(firstPageHTML);
    const termsPageBody = extractBodyContent(termsPageHTML);
    
    // Extract styles from both pages (only the content, not the tags)
    const extractStyles = (html) => {
      const styleMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      const styles = [];
      for (const match of styleMatches) {
        if (match[1]) {
          styles.push(match[1].trim());
        }
      }
      return styles.join('\n');
    };
    
    const firstPageStyles = extractStyles(firstPageHTML);
    const termsPageStyles = extractStyles(termsPageHTML);
    
    // Combine both pages with page break
    const combinedHTML = `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation ${quotation.quoteNumber || ''}</title>
  <style>
    ${firstPageStyles}
    ${termsPageStyles}
    .page-break {
      page-break-before: always;
      break-before: page;
      clear: both;
    }
  </style>
</head>
<body>
  ${firstPageBody}
  ${termsPageBody}
</body>
</html>
    `;
    
    // Set content and wait for images to load
    await page.setContent(combinedHTML, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait a bit more for any lazy-loaded images
    await page.waitForTimeout(1000);
    
    // Generate PDF with both pages
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '25mm',
        left: '5mm'
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw error;
  }
};

/**
 * Generate and save PDF to temporary file
 * @param {Object} quotation - Quotation data
 * @returns {Promise<string>} - File path
 */
const generateQuotationPDFFile = async (quotation) => {
  const buffer = await generateQuotationPDFBuffer(quotation);
  const tempDir = path.join(__dirname, '../temp');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const fileName = `Quotation_${quotation.quoteNumber}_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);
  
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
};

module.exports = {
  generateQuotationPDFBuffer,
  generateQuotationPDFFile
};


