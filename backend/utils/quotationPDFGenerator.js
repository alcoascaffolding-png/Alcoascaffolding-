/**
 * Quotation PDF Generator (Backend)
 * Professional PDFs inspired by ACE ALUMINIUM design
 * Customized for ALCOA ALUMINIUM SCAFFOLDING
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Colors - RGB values for PDFKit compatibility
      const primaryBlue = '#0066cc'; // rgb(0, 102, 204) - matches admin panel
      const darkGray = '#3c3c3c';
      const lightGray = '#f0f0f0';

      let yPos = 5; // Minimized top margin - matches admin panel

      // ==================== HEADER SECTION ====================
      
      // Company Name (English) - Centered, matches admin panel
      doc.fontSize(12).fillColor(primaryBlue).font('Helvetica-Bold')
         .text('ALCOA ALUMINIUM SCAFFOLDING', 40, yPos, { width: 515, align: 'center' });

      yPos += 6.5; // Minimal spacing

      // Tagline - positioned closer to header
      doc.fontSize(9).fillColor(darkGray).font('Helvetica')
         .text('Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding', 40, yPos, { width: 515, align: 'center' });

      yPos += 7.5; // Minimal spacing

      // Services line
      doc.fontSize(7).fillColor('#646464').font('Helvetica')
         .text('Sale | Hire | Installation | Maintenance | Safety Inspections | Training', 40, yPos, { width: 515, align: 'center' });

      yPos += 6.5; // Minimal spacing

      // Horizontal line
      doc.lineWidth(0.5).strokeColor('#c8c8c8')
         .moveTo(40, yPos).lineTo(555, yPos).stroke();

      yPos += 6; // Spacing after line

      // Document Title - QUOTATION (Red, size 18, matches admin panel)
      doc.fontSize(18).fillColor('#dc3545').font('Helvetica-Bold')
         .text('QUOTATION', 40, yPos, { width: 515, align: 'center' });

      yPos += 10.5; // Close spacing

      // TRN - Centered
      doc.fontSize(9).fillColor(darkGray).font('Helvetica')
         .text('TRN: 100123456700003', 40, yPos, { width: 515, align: 'center' });

      yPos += 13; // Minimal spacing

      // ==================== CUSTOMER & QUOTATION DETAILS ====================
      // Simple table format - no gray boxes, labels and values close together

      // Customer Details Table (Left) - Labels and values close together
      const leftLabelX = 40;
      let leftY = yPos + 15;
      
      doc.fontSize(8).fillColor('#000000');
      
      // CUSTOMER NAME - label and value close together
      doc.font('Helvetica-Bold')
         .text('CUSTOMER NAME:', leftLabelX, leftY);
      const label1Width = doc.widthOfString('CUSTOMER NAME:');
      doc.font('Helvetica')
         .text(quotation.customerName || 'N/A', leftLabelX + label1Width + 2, leftY);
      
      leftY += 15;
      // ADDRESS - label and value close together
      doc.font('Helvetica-Bold')
         .text('ADDRESS:', leftLabelX, leftY);
      const label2Width = doc.widthOfString('ADDRESS:');
      doc.font('Helvetica')
         .text(quotation.customerAddress || 'N/A', leftLabelX + label2Width + 2, leftY);
      
      leftY += 15;
      // MOBILE NO - label and value close together
      doc.font('Helvetica-Bold')
         .text('MOBILE NO:', leftLabelX, leftY);
      const label3Width = doc.widthOfString('MOBILE NO:');
      doc.font('Helvetica')
         .text(quotation.customerPhone || 'N/A', leftLabelX + label3Width + 2, leftY);
      
      leftY += 15;
      // TRN - label and value close together
      doc.font('Helvetica-Bold')
         .text('TRN:', leftLabelX, leftY);
      const label4Width = doc.widthOfString('TRN:');
      doc.font('Helvetica')
         .text(quotation.customerTRN || 'N/A', leftLabelX + label4Width + 2, leftY);
      
      leftY += 15;
      // CONTACT PERSON - label and value close together
      doc.font('Helvetica-Bold')
         .text('CONTACT PERSON:', leftLabelX, leftY);
      const label5Width = doc.widthOfString('CONTACT PERSON:');
      doc.font('Helvetica')
         .text(quotation.contactPersonName || 'N/A', leftLabelX + label5Width + 2, leftY);

      // Quote Details Table (Right) - Labels and values close together
      const rightLabelX = 295;
      let rightY = yPos + 15;
      
      // Quotation No - label and value close together
      doc.font('Helvetica-Bold')
         .text('Quotation No:', rightLabelX, rightY);
      const rightLabel1Width = doc.widthOfString('Quotation No:');
      doc.font('Helvetica')
         .text(quotation.quoteNumber || 'N/A', rightLabelX + rightLabel1Width + 2, rightY);
      
      rightY += 15;
      // Date - label and value close together
      doc.font('Helvetica-Bold')
         .text('Date:', rightLabelX, rightY);
      const rightLabel2Width = doc.widthOfString('Date:');
      doc.font('Helvetica')
         .text(new Date(quotation.quoteDate).toLocaleDateString('en-GB'), rightLabelX + rightLabel2Width + 2, rightY);
      
      rightY += 15;
      // Sales Executive - label and value close together
      doc.font('Helvetica-Bold')
         .text('Sales Executive:', rightLabelX, rightY);
      const rightLabel3Width = doc.widthOfString('Sales Executive:');
      doc.font('Helvetica')
         .text(quotation.salesExecutive || 'N/A', rightLabelX + rightLabel3Width + 2, rightY);
      
      rightY += 15;
      // PO No - label and value close together
      doc.font('Helvetica-Bold')
         .text('PO No:', rightLabelX, rightY);
      const rightLabel4Width = doc.widthOfString('PO No:');
      doc.font('Helvetica')
         .text(quotation.customerPONumber || 'N/A', rightLabelX + rightLabel4Width + 2, rightY);
      
      rightY += 15;
      // Payment Terms - label and value close together
      doc.font('Helvetica-Bold')
         .text('PAYMENT TERMS:', rightLabelX, rightY);
      const rightLabel5Width = doc.widthOfString('PAYMENT TERMS:');
      doc.font('Helvetica')
         .text(quotation.paymentTerms || 'Cash/CDC', rightLabelX + rightLabel5Width + 2, rightY);

      yPos += 100; // Spacing after tables

      // Subject Line - Simple format, no background
      if (quotation.subject) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
           .text('Subject:', 40, yPos);
        doc.font('Helvetica')
           .text(quotation.subject, 60, yPos, { width: 515 - 20 });
        const subjectLines = doc.heightOfString(quotation.subject, { width: 515 - 20 });
        yPos += subjectLines + 3;
      }

      yPos += 8; // Minimal spacing before table

      // ==================== ITEMS TABLE ====================

      const tableTop = yPos;
      // Column headers - Match admin panel format
      const tableHeaders = ['S N', 'Description of Goods', 'Wt\n(KG)', 'CB M', 'Qty', 'Rate\n(AED)', 'Taxable\nAmount', 'VAT\n%', 'VAT\nAmount', 'Amount\n(AED)'];
      // Column widths - Description column wider to accommodate image (170px total: 140px text + 30px image)
      const colWidths = [25, 170, 35, 30, 30, 40, 50, 25, 40, 50];
      // Calculate table width and align with customer details box (starts at 40px)
      const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0); // Total: 495px
      const tableStartX = 40; // Align left edge with customer details box
      let xPos = tableStartX;

      // Table Header Background - Professional blue with white text (matches admin panel)
      const headerHeight = 22;
      doc.rect(tableStartX, tableTop, totalTableWidth, headerHeight).fill(primaryBlue);
      doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold');
      
      tableHeaders.forEach((header, i) => {
        // All headers centered for professional look
        const align = 'center';
        // Handle multi-line headers (replace \n with actual newline)
        const headerText = header.replace(/\\n/g, '\n');
        doc.text(headerText, xPos + 1, tableTop + 5, { width: colWidths[i] - 2, align });
        xPos += colWidths[i];
      });

      // Draw professional header border lines
      const tableEndX = tableStartX + totalTableWidth;
      doc.lineWidth(1);
      doc.moveTo(tableStartX, tableTop).lineTo(tableEndX, tableTop).stroke('#1a4d8c');
      doc.moveTo(tableStartX, tableTop + headerHeight).lineTo(tableEndX, tableTop + headerHeight).stroke('#333333');

      yPos = tableTop + headerHeight + 2;

      // Items Rows
      const items = quotation.items || [];
      items.forEach((item, index) => {
        if (yPos > 680) {
          doc.addPage();
          yPos = 50;
          // Recalculate tableStartX on new page
          const newTableStartX = 40;
        }

        const rowHeight = 28; // Professional row height with good spacing
        const rowY = yPos;

        // Row background - white with subtle alternating for readability
        const rowBgColor = index % 2 === 0 ? '#ffffff' : '#fafafa';
        doc.rect(tableStartX, rowY, totalTableWidth, rowHeight).fill(rowBgColor);

        doc.fontSize(8).fillColor('#2c3e50').font('Helvetica');
        
        xPos = tableStartX;
        // SN - Professional styling
        doc.font('Helvetica-Bold').fillColor('#34495e');
        doc.text((index + 1).toString(), xPos + 1, rowY + 11, { width: colWidths[0] - 2, align: 'center' });
        doc.font('Helvetica').fillColor('#2c3e50');
        xPos += colWidths[0];
        
        // Description Column - with image inside
        const descColumnX = xPos + 3;
        const descColumnWidth = colWidths[1] - 6; // Total width for description column
        const imageWidth = 32; // Slightly larger image for better visibility
        const textWidth = descColumnWidth - imageWidth - 6; // Text width (leave space for image)
        
        // Description text (left side of column) - Professional font
        doc.font('Helvetica-Bold').fillColor('#2c3e50');
        const descText = item.equipmentType + (item.description ? `\n${item.description}` : '');
        doc.text(descText, descColumnX, rowY + 9, { width: textWidth });
        doc.font('Helvetica').fillColor('#555555');
        
        // Product Image (right side of Description column)
        const imageBoxX = descColumnX + textWidth + 4;
        const imageBoxY = rowY + 4;
        const imageBoxWidth = imageWidth;
        const imageBoxHeight = 20;
        
        // Professional image box with subtle border
        doc.save();
        doc.rect(imageBoxX, imageBoxY, imageBoxWidth, imageBoxHeight)
           .lineWidth(0.3)
           .stroke('#d5d5d5')
           .fill('#ffffff');
        doc.restore();
        
        // Try to load and display image if itemImage URL exists
        if (item.itemImage && typeof item.itemImage === 'string' && item.itemImage.trim() !== '') {
          try {
            // Check if it's a local file path or URL
            if (item.itemImage.startsWith('http://') || item.itemImage.startsWith('https://')) {
              // For HTTP/HTTPS URLs, PDFKit supports them directly
              doc.image(item.itemImage, imageBoxX + 1, imageBoxY + 1, { 
                width: imageBoxWidth - 2, 
                height: imageBoxHeight - 2,
                fit: [imageBoxWidth - 2, imageBoxHeight - 2]
              });
            } else {
              // Local file path
              const imagePath = path.isAbsolute(item.itemImage) 
                ? item.itemImage 
                : path.join(__dirname, '../../', item.itemImage);
              
              if (fs.existsSync(imagePath)) {
                doc.image(imagePath, imageBoxX + 1, imageBoxY + 1, { 
                  width: imageBoxWidth - 2, 
                  height: imageBoxHeight - 2,
                  fit: [imageBoxWidth - 2, imageBoxHeight - 2]
                });
              }
            }
          } catch (err) {
            // Image loading failed, keep placeholder box (already drawn)
          }
        }
        
        xPos += colWidths[1];
        
        // Weight - Professional alignment
        doc.fillColor('#555555').font('Helvetica');
        doc.text(item.weight ? parseFloat(item.weight).toFixed(2) : '0.00', xPos + 1, rowY + 11, { width: colWidths[2] - 2, align: 'center' });
        xPos += colWidths[2];
        
        // CBM
        doc.text(item.cbm ? parseFloat(item.cbm).toFixed(2) : '0.00', xPos + 1, rowY + 11, { width: colWidths[3] - 2, align: 'center' });
        xPos += colWidths[3];
        
        // Qty - Bold for emphasis
        doc.font('Helvetica-Bold').fillColor('#2c3e50');
        doc.text(item.quantity.toString(), xPos + 1, rowY + 11, { width: colWidths[4] - 2, align: 'center' });
        doc.font('Helvetica').fillColor('#555555');
        xPos += colWidths[4];
        
        // Rate - Right aligned, professional
        doc.text(item.ratePerUnit.toFixed(2), xPos + 1, rowY + 11, { width: colWidths[5] - 2, align: 'right' });
        xPos += colWidths[5];
        
        // Taxable Amount - Right aligned
        const taxable = item.subtotal || (item.quantity * item.ratePerUnit);
        doc.text(taxable.toFixed(2), xPos + 1, rowY + 11, { width: colWidths[6] - 2, align: 'right' });
        xPos += colWidths[6];
        
        // VAT% - Center aligned
        const vatPercent = item.vatPercentage || 5;
        doc.text(vatPercent.toString(), xPos + 1, rowY + 11, { width: colWidths[7] - 2, align: 'center' });
        xPos += colWidths[7];
        
        // VAT Amount - Right aligned
        const vatAmt = item.vatAmount || (taxable * (vatPercent / 100));
        doc.text(vatAmt.toFixed(2), xPos + 1, rowY + 11, { width: colWidths[8] - 2, align: 'right' });
        xPos += colWidths[8];
        
        // Amount (Total) - Bold, right aligned
        doc.font('Helvetica-Bold').fillColor('#2c3e50');
        doc.text((taxable + vatAmt).toFixed(2), xPos + 1, rowY + 11, { width: colWidths[9] - 2, align: 'right' });
        
        // Professional row borders - subtle grid lines
        doc.lineWidth(0.2);
        doc.moveTo(tableStartX, rowY).lineTo(tableEndX, rowY).stroke('#e5e5e5');
        doc.moveTo(tableStartX, rowY + rowHeight).lineTo(tableEndX, rowY + rowHeight).stroke('#d0d0d0');
        
        // Vertical column separators - subtle
        let separatorX = tableStartX;
        for (let i = 0; i <= colWidths.length; i++) {
          if (i > 0) separatorX += colWidths[i - 1];
          doc.moveTo(separatorX, rowY).lineTo(separatorX, rowY + rowHeight).stroke('#e8e8e8');
        }
        doc.lineWidth(0.5); // Reset line width
        
        yPos += rowHeight;
      });

      // ==================== TOTALS ROW IN TABLE ====================
      const totalsRowY = yPos + 2; // Small gap before totals
      const totalsRowHeight = 22; // Professional height
      
      // Calculate totals
      const subtotalBeforeCharges = items.reduce((sum, item) => {
        const taxable = item.subtotal || (item.quantity * item.ratePerUnit);
        return sum + taxable;
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
      
      // Professional totals row background - light gray with border
      doc.rect(tableStartX, totalsRowY, totalTableWidth, totalsRowHeight).fill('#f8f9fa');
      
      // Draw professional totals row borders
      doc.lineWidth(1);
      doc.moveTo(tableStartX, totalsRowY).lineTo(tableEndX, totalsRowY).stroke('#333333');
      doc.moveTo(tableStartX, totalsRowY + totalsRowHeight).lineTo(tableEndX, totalsRowY + totalsRowHeight).stroke('#333333');
      
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#2c3e50');
      let totalsX = tableStartX;
      
      // SN column - empty
      totalsX += colWidths[0];
      
      // "TOTAL" label - spans across first 6 columns (SN through Rate), right-aligned
      const labelSpanWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5];
      doc.text('TOTAL', totalsX + 2, totalsRowY + 8, { width: labelSpanWidth - 4, align: 'right' });
      totalsX += labelSpanWidth;
      
      // Taxable Amount column (index 6)
      doc.text(subtotalBeforeCharges.toFixed(2), totalsX + 2, totalsRowY + 8, { width: colWidths[6], align: 'right' });
      totalsX += colWidths[6];
      
      // VAT % column (index 7) - empty
      totalsX += colWidths[7];
      
      // VAT Amount column (index 8)
      doc.text(vatAmount.toFixed(2), totalsX + 2, totalsRowY + 8, { width: colWidths[8], align: 'right' });
      totalsX += colWidths[8];
      
      // Amount (AED) column (index 9) - NET TOTAL in bold
      doc.fillColor('#0066cc'); // Blue for net total
      doc.fontSize(10);
      doc.text(netTotal.toFixed(2), totalsX + 2, totalsRowY + 9, { width: colWidths[9] - 4, align: 'right' });
      doc.fillColor('#2c3e50');
      doc.fontSize(9);
      
      // Vertical lines for totals row
      doc.lineWidth(0.5);
      let separatorX = tableStartX;
      for (let i = 0; i <= colWidths.length; i++) {
        if (i > 0) separatorX += colWidths[i - 1];
        if (i === 1 || i === 6 || i === 7 || i === 8 || i === 9) { // Only show key separators
          doc.moveTo(separatorX, totalsRowY).lineTo(separatorX, totalsRowY + totalsRowHeight).stroke('#333333');
        }
      }
      
      yPos = totalsRowY + totalsRowHeight;
      doc.lineWidth(0.5); // Reset

      // ==================== FINANCIAL SUMMARY ROWS IN TABLE ====================
      const summaryRowHeight = 20; // Professional height
      
      // Calculate label span (first 6 columns: SN through Rate)
      const labelSpan = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5];
      
      // Helper function to draw professional vertical borders for summary rows
      const drawSummaryRowBorders = (rowY, rowHeight) => {
        doc.lineWidth(0.5);
        // Left border
        doc.moveTo(tableStartX, rowY).lineTo(tableStartX, rowY + rowHeight).stroke('#333333');
        // Right border
        doc.moveTo(tableEndX, rowY).lineTo(tableEndX, rowY + rowHeight).stroke('#333333');
        // Main separator (between label area and value columns)
        doc.moveTo(tableStartX + labelSpan, rowY).lineTo(tableStartX + labelSpan, rowY + rowHeight).stroke('#333333');
        // Separator before Amount column
        const amountStartX = tableStartX + labelSpan + colWidths[6] + colWidths[7] + colWidths[8];
        doc.moveTo(amountStartX, rowY).lineTo(amountStartX, rowY + rowHeight).stroke('#333333');
      };
      
      // Row 1: Total w/o VAT - Professional styling
      const row1Y = yPos + 2;
      doc.rect(tableStartX, row1Y, totalTableWidth, summaryRowHeight).fill('#ffffff');
      doc.lineWidth(0.5);
      doc.moveTo(tableStartX, row1Y).lineTo(tableEndX, row1Y).stroke('#d0d0d0');
      doc.moveTo(tableStartX, row1Y + summaryRowHeight).lineTo(tableEndX, row1Y + summaryRowHeight).stroke('#d0d0d0');
      
      doc.fontSize(8).font('Helvetica').fillColor('#555555');
      doc.text('Total w/o VAT:', tableStartX + 3, row1Y + 7, { width: labelSpan - 6 });
      
      // Value in Amount column (right-aligned)
      const amountStartX = tableStartX + labelSpan + colWidths[6] + colWidths[7] + colWidths[8];
      doc.font('Helvetica-Bold').fillColor('#2c3e50');
      doc.text(beforeDiscount.toFixed(2), amountStartX + 2, row1Y + 7, { width: colWidths[9] - 4, align: 'right' });
      
      drawSummaryRowBorders(row1Y, summaryRowHeight);
      yPos = row1Y + summaryRowHeight;
      
      // Row 2: VAT - Professional styling
      const row2Y = yPos;
      doc.rect(tableStartX, row2Y, totalTableWidth, summaryRowHeight).fill('#ffffff');
      doc.moveTo(tableStartX, row2Y).lineTo(tableEndX, row2Y).stroke('#d0d0d0');
      doc.moveTo(tableStartX, row2Y + summaryRowHeight).lineTo(tableEndX, row2Y + summaryRowHeight).stroke('#d0d0d0');
      
      doc.font('Helvetica').fillColor('#555555');
      doc.text(`VAT (${quotation.vatPercentage || 5}%):`, tableStartX + 3, row2Y + 7, { width: labelSpan - 6 });
      doc.font('Helvetica-Bold').fillColor('#2c3e50');
      doc.text(vatAmount.toFixed(2), amountStartX + 2, row2Y + 7, { width: colWidths[9] - 4, align: 'right' });
      
      drawSummaryRowBorders(row2Y, summaryRowHeight);
      yPos = row2Y + summaryRowHeight;
      
      // Row 3: Net Total - Professional styling with amount in words
      const netTotalRowHeight = 26;
      const row3Y = yPos;
      doc.rect(tableStartX, row3Y, totalTableWidth, netTotalRowHeight).fill('#ffffff');
      doc.lineWidth(0.8);
      doc.moveTo(tableStartX, row3Y).lineTo(tableEndX, row3Y).stroke('#333333');
      doc.moveTo(tableStartX, row3Y + netTotalRowHeight).lineTo(tableEndX, row3Y + netTotalRowHeight).stroke('#333333');
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#2c3e50');
      doc.text('Net Total:', tableStartX + 3, row3Y + 7, { width: labelSpan - 6 });
      doc.fontSize(10);
      doc.fillColor('#0066cc'); // Blue for total amount
      doc.text(netTotal.toFixed(2), amountStartX + 2, row3Y + 7, { width: colWidths[9] - 4, align: 'right' });
      
      // Amount in words on left side, aligned with Net Total row (below the label)
      doc.fontSize(8).font('Helvetica').fillColor('#666666');
      const amountInWords = numberToWords(Math.floor(netTotal));
      const amountText = `UAE Dirham ${amountInWords}`;
      doc.text(amountText, tableStartX + 3, row3Y + 17, { width: labelSpan - 6 });
      
      drawSummaryRowBorders(row3Y, netTotalRowHeight);
      yPos = row3Y + netTotalRowHeight + 10;

      // ==================== FOOTER ====================
      // Match admin panel footer format

      const footerY = 800;
      doc.rect(0, footerY - 5, 595, 30).fill(lightGray);
      
      // Services line
      doc.fontSize(7).fillColor(darkGray).font('Helvetica');
      const footerServices = 'Sale & Hire of Single & Double Width Mobile Towers • Ladders • Steel Cup Lock Scaffolding • Couplers';
      doc.text(footerServices, 40, footerY, { width: 515, align: 'center' });
      
      // Contact details - Centered format matching admin panel
      doc.fontSize(8).fillColor(darkGray).font('Helvetica');
      const contactLine = 'Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Web: www.alcoascaffolding.com';
      doc.text(contactLine, 40, footerY + 5, { width: 515, align: 'center' });
      
      // Address - centered
      doc.fontSize(7).fillColor('#646464');
      doc.text('Musaffah, Abu Dhabi, UAE', 40, footerY + 10, { width: 515, align: 'center' });

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

