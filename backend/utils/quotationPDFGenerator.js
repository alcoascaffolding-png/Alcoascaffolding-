/**
 * Quotation PDF Generator (Backend)
 * Generates professional PDFs matching Alcoa invoice format
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Convert number to words
 * @param {number} num - Number to convert
 * @returns {string} - Number in words
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
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numToWords(n % 100000) : '');
    return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numToWords(n % 10000000) : '');
  };
  
  return numToWords(Math.floor(num));
};

/**
 * Generate quotation PDF buffer
 * @param {Object} quotation - Quotation data
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateQuotationPDFBuffer = (quotation) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors
      const primaryBlue = '#0066cc';
      const darkGray = '#3c3c3c';
      const lightGray = '#f0f0f0';

      // Company Header
      doc.fontSize(22).fillColor(primaryBlue).font('Helvetica-Bold')
         .text('ALCOA ALUMINIUM SCAFFOLDING', 50, 50, { align: 'center' });
      
      doc.fontSize(9).fillColor('#666666')
         .text('Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding', 50, 75, { align: 'center' });
      
      doc.fontSize(7).fillColor('#888888')
         .text('Sale | Hire | Installation | Maintenance | Safety Inspections | Training', 50, 88, { align: 'center' });
      
      // Horizontal line
      doc.moveTo(50, 98).lineTo(545, 98).stroke('#cccccc');

      // Document Title - QUOTATION
      doc.fontSize(24).fillColor('#dc3545').font('Helvetica-Bold')
         .text('QUOTATION', 50, 108, { align: 'center' });
      
      // TRN
      doc.fontSize(9).fillColor(darkGray).font('Helvetica')
         .text('TRN: 100123456700003', 50, 135, { align: 'center' });

      let yPos = 158;

      // Customer Details Box (Left)
      doc.rect(50, yPos, 240, 80).fill(lightGray);
      
      const labelX = 55;
      const valueX = 155;
      let currentY = yPos + 8;
      
      // CUSTOMER NAME (inline - same line)
      doc.fillColor('#000000').fontSize(8).font('Helvetica-Bold')
         .text('CUSTOMER NAME: ', labelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.customerName || 'N/A');
      
      currentY += 12;
      // ADDRESS (inline - same line)
      doc.font('Helvetica-Bold')
         .text('ADDRESS: ', labelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.customerAddress || 'N/A');
      
      currentY += 12;
      // MOBILE NO (inline - same line)
      doc.font('Helvetica-Bold')
         .text('MOBILE NO: ', labelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.customerPhone || 'N/A');
      
      currentY += 12;
      // TRN (inline - same line)
      doc.font('Helvetica-Bold')
         .text('TRN: ', labelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.customerTRN || 'N/A');
      
      currentY += 12;
      // CONTACT PERSON (inline - same line)
      doc.font('Helvetica-Bold')
         .text('CONTACT PERSON: ', labelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.contactPersonName || 'N/A');

      // Quote Details Box (Right)
      doc.rect(295, yPos, 250, 80).fill(lightGray);
      
      const rightLabelX = 300;
      const rightValueX = 395;
      currentY = yPos + 8;
      
      // Quotation No (inline - same line)
      doc.font('Helvetica-Bold')
         .text('Quotation No: ', rightLabelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.quoteNumber);
      
      currentY += 12;
      // Date (inline - same line)
      doc.font('Helvetica-Bold')
         .text('Date: ', rightLabelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(new Date(quotation.quoteDate).toLocaleDateString('en-GB'));
      
      currentY += 12;
      // Sales Executive (inline - same line)
      doc.font('Helvetica-Bold')
         .text('Sales Executive: ', rightLabelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.salesExecutive || 'N/A');
      
      currentY += 12;
      // PO No (inline - same line)
      doc.font('Helvetica-Bold')
         .text('PO No: ', rightLabelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.customerPONumber || 'N/A');
      
      currentY += 12;
      // Payment Terms (inline - same line)
      doc.font('Helvetica-Bold')
         .text('Payment Terms: ', rightLabelX, currentY, { continued: true });
      doc.font('Helvetica')
         .text(quotation.paymentTerms || 'Cash/CDC');

      yPos += 90;

      // Subject
      if (quotation.subject) {
        doc.fontSize(9).font('Helvetica-Bold')
           .text('Subject:', 50, yPos);
        doc.font('Helvetica')
           .text(quotation.subject, 95, yPos, { width: 450 });
        yPos += 20;
      }

      yPos += 10;

      // Items Table Header
      const tableTop = yPos;
      const tableHeaders = ['SN', 'Description of Goods', 'Wt\n(KG)', 'CBM', 'Qty', 'Rate\n(AED)', 'Taxable\nAmount', 'VAT\n%', 'VAT\nAmount', 'Amount\n(AED)'];
      const colWidths = [25, 180, 40, 35, 30, 45, 50, 30, 40, 50];
      let xPos = 50;

      doc.rect(50, tableTop, 495, 20).fill(primaryBlue);
      doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold');
      
      tableHeaders.forEach((header, i) => {
        const align = i === 1 ? 'left' : 'center';
        // Handle multi-line headers
        const headerText = header.replace(/\\n/g, '\n');
        doc.text(headerText, xPos + 2, tableTop + 4, { width: colWidths[i], align });
        xPos += colWidths[i];
      });

      yPos = tableTop + 25;

      // Items Rows
      quotation.items.forEach((item, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(8).fillColor('#000000').font('Helvetica');
        
        xPos = 50;
        // SN
        doc.text(index + 1, xPos + 2, yPos, { width: colWidths[0], align: 'center' });
        xPos += colWidths[0];
        
        // Description
        const descText = item.equipmentType + (item.description ? `\n${item.description}` : '');
        doc.text(descText, xPos + 2, yPos, { width: colWidths[1] - 4 });
        xPos += colWidths[1];
        
        // Weight
        doc.text(item.weight || '-', xPos + 2, yPos, { width: colWidths[2], align: 'center' });
        xPos += colWidths[2];
        
        // CBM
        doc.text(item.cbm || '-', xPos + 2, yPos, { width: colWidths[3], align: 'center' });
        xPos += colWidths[3];
        
        // Qty
        doc.text(item.quantity.toString(), xPos + 2, yPos, { width: colWidths[4], align: 'center' });
        xPos += colWidths[4];
        
        // Rate
        doc.text(item.ratePerUnit.toFixed(2), xPos + 2, yPos, { width: colWidths[5], align: 'right' });
        xPos += colWidths[5];
        
        // Taxable
        const taxable = item.subtotal || (item.quantity * item.ratePerUnit);
        doc.text(taxable.toFixed(2), xPos + 2, yPos, { width: colWidths[6], align: 'right' });
        xPos += colWidths[6];
        
        // VAT%
        doc.text('5', xPos + 2, yPos, { width: colWidths[7], align: 'center' });
        xPos += colWidths[7];
        
        // VAT Amount
        const vatAmt = taxable * 0.05;
        doc.text(vatAmt.toFixed(2), xPos + 2, yPos, { width: colWidths[8], align: 'right' });
        xPos += colWidths[8];
        
        // Amount
        doc.font('Helvetica-Bold').text((taxable + vatAmt).toFixed(2), xPos + 2, yPos, { width: colWidths[9], align: 'right' });
        
        yPos += 30;
        doc.moveTo(50, yPos - 5).lineTo(545, yPos - 5).stroke('#e5e7eb');
      });

      yPos += 10;

      // Financial Summary
      const summaryX = 370;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
      doc.text('Subtotal:', summaryX, yPos);
      doc.text(`AED ${quotation.subtotal.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
      
      yPos += 15;
      if (quotation.deliveryCharges > 0) {
        doc.text('Delivery:', summaryX, yPos);
        doc.text(`AED ${quotation.deliveryCharges.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
        yPos += 15;
      }
      
      if (quotation.installationCharges > 0) {
        doc.text('Installation:', summaryX, yPos);
        doc.text(`AED ${quotation.installationCharges.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
        yPos += 15;
      }
      
      if (quotation.discount > 0) {
        doc.fillColor('#10b981');
        doc.text('Discount:', summaryX, yPos);
        doc.text(`-AED ${quotation.discount.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
        doc.fillColor('#000000');
        yPos += 15;
      }
      
      doc.text(`VAT (${quotation.vatPercentage}%):`, summaryX, yPos);
      doc.text(`AED ${quotation.vatAmount.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
      
      yPos += 20;
      doc.rect(summaryX - 5, yPos - 5, 180, 20).fill(primaryBlue);
      doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold');
      doc.text('NET TOTAL:', summaryX, yPos);
      doc.text(`AED ${quotation.totalAmount.toLocaleString()}`, summaryX + 100, yPos, { align: 'right' });
      
      yPos += 25;

      // Amount in words - aligned with summary
      doc.fontSize(9).fillColor('#666666').font('Helvetica-Oblique');
      const amountInWords = numberToWords(Math.floor(quotation.totalAmount));
      doc.text(`(${amountInWords} Dirhams Only)`, summaryX - 5, yPos, { width: 180, align: 'right' });
      
      yPos += 20;

      // Terms & Conditions - Fixed position at bottom left above footer
      const termsYPosition = 660;
      doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold');
      doc.text('TERMS & CONDITIONS:', 50, termsYPosition);
      
      let termsY = termsYPosition + 12;
      doc.fontSize(8).font('Helvetica');
      const terms = [
        `Delivery: ${quotation.deliveryTerms || '7-10 days from date of order'}`,
        `Payment: ${quotation.paymentTerms || 'Cash/CDC'}`,
        'Our products are made of high grade Alloy 6082',
        'Manufactured as per BS EN 1004 Standard',
        '5 Years welding warranty on all products',
        'All equipment is safety certified and compliant with UAE regulations'
      ];
      
      terms.forEach(term => {
        doc.text(`• ${term}`, 55, termsY);
        termsY += 10;
      });

      // Footer - Fixed at bottom
      yPos = 750;
      doc.rect(0, yPos, 595, 92).fill(lightGray);
      
      // Services line
      doc.fontSize(7).fillColor('#666666').font('Helvetica');
      doc.text('Sale & Hire of Single & Double Width Mobile Towers • Ladders • Steel Cup Lock Scaffolding • Couplers', 50, yPos + 8, { align: 'center', width: 495 });
      
      // Contact details - properly aligned and spaced
      doc.fontSize(8).fillColor('#333333');
      const contactY = yPos + 20;
      
      // Build contact line with proper spacing
      const contactLine = 'Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Web: www.alcoascaffolding.com';
      doc.font('Helvetica');
      doc.text(contactLine, 50, contactY, { align: 'center', width: 495 });
      
      // Address
      doc.fontSize(7).fillColor('#888888').font('Helvetica');
      doc.text('Musaffah, Abu Dhabi, UAE', 50, yPos + 32, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
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

