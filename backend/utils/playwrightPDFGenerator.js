/**
 * Playwright-based Quotation PDF Generator
 * Generates professional PDFs matching ACE ALUMINIUM design
 * Customized for ALCOA ALUMINIUM SCAFFOLDING
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

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
 * Format date to DD-MM-YYYY (matching the exact format in the image)
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Get logo as base64 data URI
 */
const getLogoBase64 = () => {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(__dirname, '../backend/assets/Logo.png'),
      path.join(__dirname, '../../backend/assets/Logo.png'),
      path.join(__dirname, '../assets/Logo.png')
    ];
    
    let logoPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        logoPath = testPath;
        break;
      }
    }
    
    if (logoPath) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      return `data:image/png;base64,${logoBase64}`;
    } else {
      console.warn('[PDF Generator] Logo not found. Tried paths:', possiblePaths);
      return null;
    }
  } catch (error) {
    console.error('[PDF Generator] Error loading logo:', error.message);
    return null;
  }
};

/**
 * Get header image as base64 data URI
 * This replaces the entire header section with a single PNG image
 */
const getHeaderImageBase64 = () => {
  try {
    // Try multiple possible paths for header image
    const possiblePaths = [
      path.join(__dirname, '../backend/assets/Header.png'),
      path.join(__dirname, '../../backend/assets/Header.png'),
      path.join(__dirname, '../assets/Header.png'),
      path.join(__dirname, '../backend/assets/header.png'),
      path.join(__dirname, '../../backend/assets/header.png'),
      path.join(__dirname, '../assets/header.png')
    ];
    
    let headerPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        headerPath = testPath;
        break;
      }
    }
    
    if (headerPath) {
      const headerBuffer = fs.readFileSync(headerPath);
      const headerBase64 = headerBuffer.toString('base64');
      return `data:image/png;base64,${headerBase64}`;
    } else {
      console.warn('[PDF Generator] Header image not found. Tried paths:', possiblePaths);
      console.warn('[PDF Generator] Please place your header image as Header.png in backend/assets/ folder');
      return null;
    }
  } catch (error) {
    console.error('[PDF Generator] Error loading header image:', error.message);
    return null;
  }
};

/**
 * Get footer image as base64 data URI
 * This replaces the entire footer section with a single PNG image
 */
const getFooterImageBase64 = () => {
  try {
    // Try multiple possible paths for footer image
    const possiblePaths = [
      path.join(__dirname, '../backend/assets/Footer.png'),
      path.join(__dirname, '../../backend/assets/Footer.png'),
      path.join(__dirname, '../assets/Footer.png'),
      path.join(__dirname, '../backend/assets/footer.png'),
      path.join(__dirname, '../../backend/assets/footer.png'),
      path.join(__dirname, '../assets/footer.png'),
      path.join(__dirname, '../backend/backend/assets/Footer.png'),
      path.join(__dirname, '../backend/backend/assets/footer.png')
    ];
    
    let footerPath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        footerPath = testPath;
        break;
      }
    }
    
    if (footerPath) {
      const footerBuffer = fs.readFileSync(footerPath);
      const footerBase64 = footerBuffer.toString('base64');
      return `data:image/png;base64,${footerBase64}`;
    } else {
      console.warn('[PDF Generator] Footer image not found. Tried paths:', possiblePaths);
      console.warn('[PDF Generator] Please place your footer image as Footer.png in backend/assets/ folder');
      return null;
    }
  } catch (error) {
    console.error('[PDF Generator] Error loading footer image:', error.message);
    return null;
  }
};

/**
 * Generate Terms & Conditions page HTML
 */
const generateTermsAndConditionsPageHTML = (quotation) => {
  // Get header and footer images
  const headerImageBase64 = getHeaderImageBase64();
  const footerImageBase64 = getFooterImageBase64();
  
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
    
    /* Header Section - Now just an image */
    .header {
      text-align: center;
      margin-bottom: 5mm;
      width: 100%;
    }
    
    .header-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    .document-title {
      font-size: 14pt;
      font-weight: bold;
      color: #000000;
      text-decoration: underline;
      text-align: center;
      margin: 2mm 0 1mm;
      padding: 0;
    }
    
    .trn {
      font-size: 12pt;
      color: #000000;
      text-align: center;
      margin-bottom: 0mm;
      padding: 0;
      font-weight: normal;
    }
    
    .section {
      margin-top: 12mm;
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
    
    /* Footer Section - Fixed on every page, now just an image */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1000;
      text-align: center;
    }
    
    .footer-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="page-break"></div>
  
  <!-- Header - Single PNG Image -->
  <div class="header">
    ${headerImageBase64 ? `<img src="${headerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Header" class="header-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Header image not found. Please place Header.png in backend/assets/ folder</div>'}
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
  
  <!-- Footer - Single PNG Image -->
  <div class="footer">
    ${footerImageBase64 ? `<img src="${footerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Footer" class="footer-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Footer image not found. Please place Footer.png in backend/assets/ folder</div>'}
  </div>
</body>
</html>
  `;
};

/**
 * Generate item row HTML
 */
/**
 * Get item image as base64 data URI from filename or path
 */
const getItemImageBase64 = (itemImage) => {
  if (!itemImage) return '';
  
  try {
    // If it's already a data URI, return it
    if (itemImage.startsWith('data:image/')) {
      return itemImage;
    }
    
    // If it's a URL, return it (Playwright can load URLs)
    if (itemImage.startsWith('http://') || itemImage.startsWith('https://')) {
      return itemImage;
    }
    
    // If it's a filename or relative path, try to load from assets folder
    const imageFileName = path.basename(itemImage);
    const possiblePaths = [
      path.join(__dirname, '../backend/assets', imageFileName),
      path.join(__dirname, '../../backend/assets', imageFileName),
      path.join(__dirname, '../assets', imageFileName),
      path.join(__dirname, '..', 'backend', 'assets', imageFileName),
      // Also try as absolute path
      itemImage
    ];
    
    let imagePath = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        break;
      }
    }
    
    if (imagePath) {
      const imageBuffer = fs.readFileSync(imagePath);
      const ext = path.extname(imageFileName).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      
      const base64 = imageBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }
    
    return '';
  } catch (error) {
    console.warn(`[PDF Generator] Error loading item image ${itemImage}:`, error.message);
    return '';
  }
};

const generateItemRow = (item, serialNumber) => {
  const taxable = item.taxableAmount || item.subtotal || (item.quantity * item.ratePerUnit);
  const vatPercent = item.vatPercentage || 5;
  const vatAmt = item.vatAmount || (taxable * (vatPercent / 100));
  const total = taxable + vatAmt;
  const imageSrc = getItemImageBase64(item.itemImage || '');
  const imageTag = imageSrc ? `<img src="${imageSrc}" alt="Item" class="item-image" onerror="this.style.display='none'">` : '';
  
  return `
        <tr>
          <td class="col-sn">${serialNumber}</td>
          <td class="col-desc">
            <div class="item-description">
              <div class="item-text">${item.equipmentType}${item.description ? '<br>' + item.description : ''}</div>
              ${imageTag}
            </div>
          </td>
          <td class="col-wt">${item.weight ? parseFloat(item.weight).toFixed(2) : '0.00'}</td>
          <td class="col-cbm">${item.cbm ? parseFloat(item.cbm).toFixed(2) : '0.00'}</td>
          <td class="col-qty">${item.quantity} Nos</td>
          <td class="col-rate">${item.ratePerUnit.toFixed(2)}</td>
          <td class="col-taxable">${taxable.toFixed(2)}</td>
          <td class="col-vat-pct">${vatPercent}</td>
          <td class="col-vat-amt">${vatAmt.toFixed(2)}</td>
          <td class="col-amount">${total.toFixed(2)}</td>
        </tr>
        `;
};

/**
 * Generate continuation page with items table
 */
const generateContinuationPage = (quotation, items, startIndex, headerImageBase64) => {
  const itemsHTML = items.map((item, idx) => generateItemRow(item, startIndex + idx)).join('');
  
  return `
  <div class="page-break"></div>
  
  <!-- Header - Single PNG Image -->
  <div class="header">
    ${headerImageBase64 ? `<img src="${headerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Header" class="header-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Header image not found. Please place Header.png in backend/assets/ folder</div>'}
    <div class="document-title">QUOTATION</div>
    <div class="trn">TRN: 100123456700003</div>
  </div>
  
  <!-- Items Table Continuation -->
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
      ${itemsHTML}
    </tbody>
  </table>
  `;
};

/**
 * Generate HTML template for quotation
 */
const generateQuotationHTML = (quotation) => {
  // Get header and footer images
  const headerImageBase64 = getHeaderImageBase64();
  const footerImageBase64 = getFooterImageBase64();
  
  // Split items into pages (8 items per page)
  const itemsPerPage = 10;
  const totalItems = quotation.items.length;
  const firstPageItems = quotation.items.slice(0, itemsPerPage);
  const remainingItems = quotation.items.slice(itemsPerPage);
  
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
    
    /* Header Section - Now just an image */
    .header {
      text-align: center;
      margin-bottom: 5mm;
      width: 100%;
    }
    
    .header-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    .company-name-text {
      font-size: 28pt;
      font-weight: bold;
      color: #000000;
      display: inline-block;
      line-height: 0.2;
      margin: 0;
      padding: 0;
    }
    
    .company-name-arabic {
      font-size: 22pt;
      font-weight: bold;
      color: #000000;
      direction: rtl;
      font-family: 'Arial', 'Tahoma', sans-serif;
      margin-left: 10px;
      line-height: 0.2;
      margin-top: 0;
      margin-bottom: 0;
      padding: 0;
    }
    
    .tagline {
      font-size: 9pt;
      color: #0066cc;
      margin-bottom:0.5mm;
      text-align: center;
      padding-bottom: 0.5mm;
      padding-left: 4mm;
      padding-right: 4mm;
      border-bottom: 0.5px solid #0066cc;
      font-weight: bold;
      display: inline-block;
      width: fit-content;
    }
    
    .tagline-container {
      text-align: center;
      margin-bottom: 0.1mm;
    }
    
    .attributes-line {
      font-size: 8pt;
      color: #dc3545;
      text-align: center;
      margin: 0 auto;
      font-weight: bold;
      padding: 4px 12px;
      border: 1px solid #dc3545;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    
    .activities-line {
      font-size: 8pt;
      color: #0066cc;
      text-align: center;
      margin: 0 auto;
      font-weight: bold;
      padding: 4px 12px;
      border: 1px solid #0066cc;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    
    .header-boxes-container {
      text-align: center;
      margin: 0.05mm 0;
    }
    
    .divider {
      border-top: 1px solid #0066cc;
      margin: 3mm 0;
    }
    
    .document-title {
      font-size: 18pt;
      font-weight: bold;
      color: #000000;
      text-decoration: underline;
      text-align: center;
      margin: 2mm 0 1mm;
      padding: 0;
    }
    
    .trn {
      font-size: 22pt;
      color: #000000;
      text-align: center;
      margin-bottom: 3mm;
      padding: 0;
      font-weight: normal;
    }
    
    /* Customer and Quote Details Container */
    .details-container {
      display: flex;
      gap: 5mm;
      margin: 2mm 0;
      width: 100%;
      align-items: stretch;
    }
    
    /* Left Side - Customer Details Box */
    .customer-details-box {
      flex: 1 1 0;
      border: 1px solid #000000;
      padding: 8px 10px;
      font-size: 7.5pt;
      background-color: #ffffff;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-self: stretch;
    }
    
    .customer-detail-item {
      margin-bottom: 5px;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
    }
    
    .customer-detail-item:last-child {
      margin-bottom: 0;
    }
    
    .customer-detail-label {
      font-weight: bold;
      color: #000000;
      display: inline-block;
      min-width: 125px;
      flex-shrink: 0;
      margin-right: 6px;
      font-size: 7.5pt;
    }
    
    .customer-detail-value {
      color: #000000;
      flex: 1;
      word-wrap: break-word;
      font-size: 7.5pt;
    }
    
    /* Right Side - Quote Details Container */
    .quote-details-wrapper {
      flex: 1 1 0;
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      align-self: stretch;
    }
    
    /* Right Side - Quote Details Table */
    .quote-details-table {
      border-collapse: collapse;
      font-size: 7.5pt;
      border: 1px solid #000000;
      width: 100%;
      table-layout: fixed;
      box-sizing: border-box;
      height: 100%;
      display: table;
    }
    
    .quote-details-table tbody {
      height: 100%;
    }
    
    .quote-details-table tr:last-child {
      height: 100%;
    }
    
    .quote-details-table tr:last-child td {
      vertical-align: bottom;
    }
    
    .quote-details-table td {
      padding: 8px 10px;
      border: 1px solid #000000;
      vertical-align: middle;
      font-size: 7.5pt;
    }
    
    .quote-details-table .quote-label {
      font-weight: bold;
      color: #000000;
      background-color: #ffffff;
      font-size: 7.5pt;
    }
    
    .quote-details-table .quote-value {
      color: #000000;
      font-size: 7.5pt;
    }
    
    .quote-details-table tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .quote-details-table tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    /* Subject Section - Aligned with table */
    .subject-section {
      margin-top: 2mm;
      margin-bottom: 0mm;
      font-size: 8pt;
      width: 100%;
      border: 1px solid #000000;
      border-bottom: none;
      padding: 6px 4px;
      background-color: #ffffff;
      box-sizing: border-box;
    }
    
    .subject-label {
      font-weight: bold;
      color: #2c3e50;
      display: inline-block;
    }
    
    .subject-value {
      color: #2c3e50;
    }
    
    /* Table Styles */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      margin-bottom: 4mm;
      font-size: 8pt;
      page-break-inside: auto;
      border: 1px solid #000000;
      border-top: none;
    }
    
    .items-table thead {
      background-color: #ffffff;
      color: #000000;
      display: table-header-group;
    }
    
    .items-table thead tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .items-table th {
      padding: 6px 4px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #000000;
      font-size: 7.5pt;
    }
    
    .items-table tbody {
      display: table-row-group;
    }
    
    .items-table tbody tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    .items-table td {
      padding: 6px 4px;
      border: 1px solid #000000;
      vertical-align: middle;
    }
    
    .items-table tbody tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .items-table tbody tr:nth-child(odd) {
      background-color: #ffffff;
    }
    
    /* Page break for continuation pages */
    .table-page-break {
      page-break-before: always;
      break-before: page;
    }
    
    /* Ensure totals stay together */
    .totals-row,
    .summary-row,
    .net-total-row {
      page-break-inside: avoid;
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
      gap: 8px;
      flex-wrap: nowrap;
    }
    
    .item-text {
      flex: 1;
      font-weight: bold;
      color: #2c3e50;
      line-height: 1.4;
      min-width: 0;
      padding-right: 10px;
      border-right: 1px solid #000000;
      margin-right: 8px;
    }
    
    .item-image {
      width: 40px;
      height: 30px;
      object-fit: contain;
      border: 1px solid #d5d5d5;
      background: white;
      flex-shrink: 0;
      display: block;
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
      border: 1px solid #000000;
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
      color: #000000;
      font-size: 10pt;
      font-weight: bold;
    }
    
    .amount-in-words {
      font-size: 7.5pt;
      color: #666666;
      font-style: italic;
      padding-top: 2px;
    }
    
    /* Footer Section - Fixed on every page, now just an image */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 1000;
      text-align: center;
    }
    
    .footer-image {
      width: 100%;
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
  </style>
 </head>
 <body>
  <!-- Header - Single PNG Image -->
  <div class="header">
    ${headerImageBase64 ? `<img src="${headerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Header" class="header-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Header image not found. Please place Header.png in backend/assets/ folder</div>'}
    <div class="document-title">QUOTATION</div>
    <div class="trn">TRN: 100123456700003</div>
  </div>
  
  <!-- Customer and Quote Details Container -->
  <div class="details-container">
    <!-- Left Side - Customer Details Box -->
    <div class="customer-details-box">
      <div class="customer-detail-item">
        <div class="customer-detail-label">CUSTOMER NAME :</div>
        <div class="customer-detail-value">${quotation.customerName || ''}</div>
      </div>
      <div class="customer-detail-item">
        <div class="customer-detail-label">ADDRESS :</div>
        <div class="customer-detail-value">${quotation.customerAddress || ''}</div>
      </div>
      <div class="customer-detail-item">
        <div class="customer-detail-label">MOBILE NO :</div>
        <div class="customer-detail-value">${quotation.customerPhone || ''}</div>
      </div>
      <div class="customer-detail-item">
        <div class="customer-detail-label">TRN :</div>
        <div class="customer-detail-value">${quotation.customerTRN || ''}</div>
      </div>
      <div class="customer-detail-item">
        <div class="customer-detail-label">CONTACT PERSON :</div>
        <div class="customer-detail-value">${quotation.contactPersonName || ''}</div>
      </div>
    </div>
    
    <!-- Right Side - Quote Details Table -->
    <div class="quote-details-wrapper">
      <table class="quote-details-table">
        <colgroup>
          <col style="width: 28%;">
          <col style="width: 22%;">
          <col style="width: 25%;">
          <col style="width: 25%;">
        </colgroup>
        <tbody>
          <tr>
            <td class="quote-label">Quotation<br>No</td>
            <td class="quote-value">${quotation.quoteNumber || ''}</td>
            <td class="quote-label">Date</td>
            <td class="quote-value">${formatDate(quotation.quoteDate)}</td>
          </tr>
          <tr>
            <td class="quote-label">Sales Executive</td>
            <td class="quote-value" colspan="3">${quotation.salesExecutive || ''}</td>
          </tr>
          <tr>
            <td class="quote-label">PAYMENT TERMS</td>
            <td class="quote-value" colspan="3">${quotation.paymentTerms || 'CDC/Cash'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- Subject Section -->
  ${quotation.subject ? `
  <div class="subject-section">
    <span class="subject-label">Subject: </span>
    <span class="subject-value">${quotation.subject}</span>
  </div>
  ` : ''}
  
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
      ${firstPageItems.map((item, index) => generateItemRow(item, index + 1)).join('')}
      ${remainingItems.length === 0 ? `
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
      ` : ''}
     </tbody>
   </table>
   
   ${remainingItems.length > 0 ? (() => {
     // Split remaining items into pages of 8 items each
     let continuationPages = '';
     for (let i = 0; i < remainingItems.length; i += itemsPerPage) {
       const pageItems = remainingItems.slice(i, i + itemsPerPage);
       const isLastPage = (i + itemsPerPage >= remainingItems.length);
       const startIndex = itemsPerPage + i + 1;
       
       continuationPages += `
   <div class="page-break"></div>
   
   <!-- Header - Single PNG Image -->
   <div class="header">
     ${headerImageBase64 ? `<img src="${headerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Header" class="header-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Header image not found. Please place Header.png in backend/assets/ folder</div>'}
     <div class="document-title">QUOTATION</div>
     <div class="trn">TRN: 100123456700003</div>
   </div>
   
   <!-- Items Table Continuation -->
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
       ${pageItems.map((item, idx) => generateItemRow(item, startIndex + idx)).join('')}
       ${isLastPage ? `
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
       ` : ''}
     </tbody>
   </table>
   `;
     }
     return continuationPages;
   })() : ''}
   
   <!-- Footer - Single PNG Image -->
   <div class="footer">
     ${footerImageBase64 ? `<img src="${footerImageBase64}" alt="ALCOA ALUMINIUM SCAFFOLDING Footer" class="footer-image">` : '<div style="text-align: center; color: red; padding: 20px;">⚠️ Footer image not found. Please place Footer.png in backend/assets/ folder</div>'}
   </div>
 </body>
 </html>
  `;
};

/**
 * Verify Playwright browser installation
 * @returns {Promise<boolean>} - True if browser is installed
 */
const verifyBrowserInstallation = async () => {
  try {
    // Try to get the browser executable path
    const executablePath = chromium.executablePath();
    console.log('[Playwright] Checking browser at:', executablePath);
    
    if (executablePath && fs.existsSync(executablePath)) {
      console.log('[Playwright] ✅ Browser found at:', executablePath);
      return true;
    }
    
    // Check common Render paths manually
    const basePaths = [
      '/opt/render/.cache/ms-playwright',
      process.env.PLAYWRIGHT_BROWSERS_PATH,
      path.join(process.env.HOME || '/tmp', '.cache/ms-playwright'),
      path.join(process.cwd(), '.cache/ms-playwright')
    ].filter(Boolean);
    
    for (const basePath of basePaths) {
      try {
        if (!fs.existsSync(basePath)) continue;
        
        // Check for chromium directories
        const dirs = fs.readdirSync(basePath);
        for (const dir of dirs) {
          if (dir.startsWith('chromium')) {
            // Check for chrome-linux directory
            const chromeLinuxPath = path.join(basePath, dir, 'chrome-linux');
            if (fs.existsSync(chromeLinuxPath)) {
              const chromePath = path.join(chromeLinuxPath, 'chrome');
              const headlessShellPath = path.join(chromeLinuxPath, 'headless_shell');
              
              if (fs.existsSync(chromePath) || fs.existsSync(headlessShellPath)) {
                console.log('[Playwright] ✅ Browser found at alternative path:', chromePath || headlessShellPath);
                return true;
              }
            }
          }
        }
      } catch (e) {
        // Continue checking other paths
        console.log('[Playwright] Checked path:', basePath, '- not found');
      }
    }
    
    console.warn('[Playwright] ⚠️ Browser not found. Expected path:', executablePath);
    return false;
  } catch (error) {
    console.error('[Playwright] Verification error:', error.message);
    return false;
  }
};

/**
 * Install Playwright browsers if not already installed
 * @returns {Promise<boolean>} - True if installation successful or already installed
 */
const ensureBrowserInstalled = async () => {
  try {
    const isInstalled = await verifyBrowserInstallation();
    if (isInstalled) {
      console.log('[Playwright] ✅ Browsers already installed');
      return true;
    }
    
    console.log('[Playwright] ⚠️ Browsers not found. Installing...');
    execSync('npx playwright install chromium', {
      stdio: 'inherit',
      timeout: 300000, // 5 minutes timeout
      env: { ...process.env, PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '0' }
    });
    
    console.log('[Playwright] ✅ Browser installation completed');
    
    // Verify installation after install
    const verified = await verifyBrowserInstallation();
    if (!verified) {
      console.error('[Playwright] ❌ Browser installation completed but verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Playwright] ❌ Failed to install browsers:', error.message);
    return false;
  }
};

/**
 * Generate PDF buffer from quotation data using Playwright
 * @param {Object} quotation - Quotation data
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateQuotationPDFBuffer = async (quotation) => {
  let browser = null;
  
  try {
    // Ensure browser is installed (will check and install if needed)
    const isReady = await ensureBrowserInstalled();
    if (!isReady) {
      throw new Error('Playwright browser not installed. Please ensure browsers are installed during deployment.');
    }
    
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
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore browser close errors
        console.warn('Error closing browser:', closeError.message);
      }
    }
    
    // Log detailed error information
    console.error('PDF Generation Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Provide more helpful error messages for common Playwright issues
    if (error.message && (error.message.includes('Executable doesn\'t exist') || 
        error.message.includes('browserType.launch'))) {
      const enhancedError = new Error('Playwright browser not installed. The browser executable is missing. Please ensure Playwright browsers are installed during deployment.');
      enhancedError.originalError = error.message;
      enhancedError.statusCode = 503;
      throw enhancedError;
    }
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      const timeoutError = new Error('PDF generation timed out. The service may be overloaded. Please try again.');
      timeoutError.statusCode = 503;
      throw timeoutError;
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
  generateQuotationPDFFile,
  verifyBrowserInstallation,
  ensureBrowserInstalled
};


