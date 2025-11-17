/**
 * Professional Quotation PDF Generator
 * Matches Alcoa Scaffolding invoice format
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { processBilingualText } from './arabicTextHelper';

/**
 * Load image from URL and convert to base64
 */
const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      try {
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Generate text as image for proper Arabic rendering
 */
const textToImage = (text, fontSize = 16, fontWeight = 'bold', color = '#0066cc') => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set font
    ctx.font = `${fontWeight} ${fontSize}px Arial, Helvetica, sans-serif`;
    
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.5;
    
    // Set canvas size
    canvas.width = textWidth + 20;
    canvas.height = textHeight;
    
    // Re-set font after canvas resize (canvas resets context)
    ctx.font = `${fontWeight} ${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Fill background (transparent)
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Convert to base64
    const base64 = canvas.toDataURL('image/png');
    resolve({ base64, width: textWidth, height: textHeight });
  });
};

export const generateProfessionalQuotationPDF = async (quotation) => {
  // Pre-load images for items that have itemImage URLs
  const imagePromises = quotation.items.map(async (item, index) => {
    if (item.itemImage && (item.itemImage.startsWith('http://') || item.itemImage.startsWith('https://'))) {
      try {
        const base64 = await loadImageAsBase64(item.itemImage);
        return { index, base64 };
      } catch (err) {
        console.log(`Failed to load image for item ${index}:`, err);
        return { index, base64: null };
      }
    }
    return { index, base64: item.itemImage?.startsWith('data:image') ? item.itemImage : null };
  });
  
  const loadedImages = await Promise.all(imagePromises);
  const imageMap = {};
  loadedImages.forEach(({ index, base64 }) => {
    if (base64) imageMap[index] = base64;
  });
  
  // Generate header text as image for proper Arabic rendering
  const headerImage = await textToImage('ALCOA ALUMINIUM SCAFFOLDING  |  الكوا سقالات ألمنيوم', 28, 'bold', '#0066cc');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryBlue = [0, 102, 204];
  const darkGray = [60, 60, 60];
  const lightGray = [240, 240, 240];

  let yPos = 5; // Minimized top margin

  // ==================== HEADER ====================
  
  // Company Name (English and Arabic rendered as image for proper display)
  if (headerImage && headerImage.base64) {
    const imgWidth = (headerImage.width * 0.264583) / 1.5; // Convert px to mm and scale appropriately
    const imgHeight = (headerImage.height * 0.264583) / 1.5;
    const imgX = (pageWidth - imgWidth) / 2;
    
    try {
      doc.addImage(headerImage.base64, 'PNG', imgX, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 2; // Minimal spacing
    } catch (err) {
      // Fallback to text if image fails
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryBlue);
      doc.text('ALCOA ALUMINIUM SCAFFOLDING', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
    }
  } else {
    // Fallback to text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryBlue);
    doc.text('ALCOA ALUMINIUM SCAFFOLDING', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
  }
  
  // Tagline - positioned closer to header
  yPos += 2.5; // Minimal spacing
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text('Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding', pageWidth / 2, yPos, { align: 'center' });
  
  // Services line
  yPos += 3; // Minimal spacing
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Sale | Hire | Installation | Maintenance | Safety Inspections | Training', pageWidth / 2, yPos, { align: 'center' });
  
  // Horizontal line
  yPos += 2.5; // Minimal spacing
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  // Document Title - QUOTATION (below the line with proper spacing)
  yPos += 6; // Increased spacing to ensure no overlap
  doc.setFontSize(18); // Reduced size
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69); // Red
  doc.text('QUOTATION', pageWidth / 2, yPos, { align: 'center' });
  
  // TRN (close to QUOTATION)
  yPos += 4; // Close spacing
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text('TRN: 100123456700003', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5; // Minimal spacing
  
  // ==================== CUSTOMER & QUOTE INFO ====================
  
  // Customer Details Table (Left) - Labels and values close together
  const leftLabelX = 15;
  let leftY = yPos + 5.5;
  
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  
  // CUSTOMER NAME - label and value close together
  doc.setFont('helvetica', 'bold');
  const label1 = 'CUSTOMER NAME:';
  const label1Width = doc.getTextWidth(label1);
  doc.text(label1, leftLabelX, leftY);
  doc.setFont('helvetica', 'normal');
  const value1 = quotation.customerName || 'N/A';
  doc.text(value1, leftLabelX + label1Width + 1, leftY); // Small space after colon
  
  leftY += 5.5;
  // ADDRESS - label and value close together
  doc.setFont('helvetica', 'bold');
  const label2 = 'ADDRESS:';
  const label2Width = doc.getTextWidth(label2);
  doc.text(label2, leftLabelX, leftY);
  doc.setFont('helvetica', 'normal');
  const value2 = quotation.customerAddress || 'N/A';
  doc.text(value2, leftLabelX + label2Width + 1, leftY);
  
  leftY += 5.5;
  // MOBILE NO - label and value close together
  doc.setFont('helvetica', 'bold');
  const label3 = 'MOBILE NO:';
  const label3Width = doc.getTextWidth(label3);
  doc.text(label3, leftLabelX, leftY);
  doc.setFont('helvetica', 'normal');
  const value3 = quotation.customerPhone || 'N/A';
  doc.text(value3, leftLabelX + label3Width + 1, leftY);
  
  leftY += 5.5;
  // TRN - label and value close together
  doc.setFont('helvetica', 'bold');
  const label4 = 'TRN:';
  const label4Width = doc.getTextWidth(label4);
  doc.text(label4, leftLabelX, leftY);
  doc.setFont('helvetica', 'normal');
  const value4 = quotation.customerTRN || 'N/A';
  doc.text(value4, leftLabelX + label4Width + 1, leftY);
  
  leftY += 5.5;
  // CONTACT PERSON - label and value close together
  doc.setFont('helvetica', 'bold');
  const label5 = 'CONTACT PERSON:';
  const label5Width = doc.getTextWidth(label5);
  doc.text(label5, leftLabelX, leftY);
  doc.setFont('helvetica', 'normal');
  const value5 = quotation.contactPersonName || 'N/A';
  doc.text(value5, leftLabelX + label5Width + 1, leftY);
  
  // Quote Details Table (Right) - Labels and values close together
  const rightLabelX = 115;
  let rightY = yPos + 5.5;
  
  // Quotation No - label and value close together
  doc.setFont('helvetica', 'bold');
  const rightLabel1 = 'Quotation No:';
  const rightLabel1Width = doc.getTextWidth(rightLabel1);
  doc.text(rightLabel1, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  const rightValue1 = quotation.quoteNumber || 'N/A';
  doc.text(rightValue1, rightLabelX + rightLabel1Width + 1, rightY);
  
  rightY += 5.5;
  // Date - label and value close together
  doc.setFont('helvetica', 'bold');
  const rightLabel2 = 'Date:';
  const rightLabel2Width = doc.getTextWidth(rightLabel2);
  doc.text(rightLabel2, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  const rightValue2 = new Date(quotation.quoteDate).toLocaleDateString('en-GB');
  doc.text(rightValue2, rightLabelX + rightLabel2Width + 1, rightY);
  
  rightY += 5.5;
  // Sales Executive - label and value close together
  doc.setFont('helvetica', 'bold');
  const rightLabel3 = 'Sales Executive:';
  const rightLabel3Width = doc.getTextWidth(rightLabel3);
  doc.text(rightLabel3, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  const rightValue3 = quotation.salesExecutive || 'N/A';
  doc.text(rightValue3, rightLabelX + rightLabel3Width + 1, rightY);
  
  rightY += 5.5;
  // PO No - label and value close together
  doc.setFont('helvetica', 'bold');
  const rightLabel4 = 'PO No:';
  const rightLabel4Width = doc.getTextWidth(rightLabel4);
  doc.text(rightLabel4, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  const rightValue4 = quotation.customerPONumber || 'N/A';
  doc.text(rightValue4, rightLabelX + rightLabel4Width + 1, rightY);
  
  rightY += 5.5;
  // Payment Terms - label and value close together
  doc.setFont('helvetica', 'bold');
  const rightLabel5 = 'PAYMENT TERMS:';
  const rightLabel5Width = doc.getTextWidth(rightLabel5);
  doc.text(rightLabel5, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  const rightValue5 = quotation.paymentTerms || 'Cash/CDC';
  doc.text(rightValue5, rightLabelX + rightLabel5Width + 1, rightY);
  
  yPos += 38; // Spacing after tables
  
  // Subject
  if (quotation.subject) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const subjectLines = doc.splitTextToSize(quotation.subject, pageWidth - 40);
    doc.text(subjectLines, 35, yPos);
    yPos += (subjectLines.length * 4) + 1; // Minimal spacing
  }
  
  yPos += 3; // Minimal spacing before table
  
  // ==================== ITEMS TABLE ====================
  
  // Prepare table data - images will be added inside Description column
  const tableData = quotation.items.map((item, index) => {
    const row = [
      index + 1,
      item.equipmentType + (item.description ? `\n${item.description}` : ''),
      item.weight || '-',
      item.cbm || '-',
      item.quantity,
      item.ratePerUnit.toFixed(2),
      item.taxableAmount?.toFixed(2) || item.subtotal.toFixed(2),
      item.vatPercentage || 5,
      item.vatAmount?.toFixed(2) || (item.subtotal * 0.05).toFixed(2),
      (parseFloat(item.subtotal) + parseFloat(item.vatAmount || (item.subtotal * 0.05))).toFixed(2)
    ];
    
    return row;
  });

  // Calculate totals for totals row
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

  // Totals row data
  const totalsRow = [
    '',
    'TOTAL',
    '',
    '',
    '',
    '',
    subtotalBeforeCharges.toFixed(2),
    '',
    vatAmount.toFixed(2),
    netTotal.toFixed(2)
  ];

  // Financial summary rows to add to table
  const summaryRow1 = [
    '',
    'Total w/o VAT',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    beforeDiscount.toFixed(2)
  ];

  const summaryRow2 = [
    '',
    `VAT (${quotation.vatPercentage || 5}%)`,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    vatAmount.toFixed(2)
  ];

  const summaryRow3 = [
    '',
    'Net Total',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    netTotal.toFixed(2)
  ];

  // Amount in words - will be shown on left side of Net Total row, not as separate row
  // So we don't add summaryRow4 to the table

  // Table alignment - use consistent left margin
  const tableLeftMargin = 15; // Consistent left margin matching other content

  doc.autoTable({
    startY: yPos,
    margin: { left: tableLeftMargin, right: tableLeftMargin },
    head: [[
      'S N',
      'Description of Goods',
      'Wt\n(KG)',
      'CB M',
      'Qty',
      'Rate\n(AED)',
      'Taxable\nAmount',
      'VAT\n%',
      'VAT\nAmount',
      'Amount\n(AED)'
    ]],
    body: [...tableData, totalsRow, summaryRow1, summaryRow2, summaryRow3],
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      minCellHeight: 8
    },
    styles: {
      fontSize: 8,
      cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
      lineColor: [225, 225, 225],
      lineWidth: 0.2,
      textColor: [44, 62, 80], // Professional dark gray
      font: 'helvetica',
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold', textColor: [52, 73, 94] },
      1: { cellWidth: 52, fontStyle: 'bold', textColor: [44, 62, 80], halign: 'left' }, // Description column
      2: { cellWidth: 12, halign: 'center', textColor: [85, 85, 85] },
      3: { cellWidth: 12, halign: 'center', textColor: [85, 85, 85] },
      4: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [44, 62, 80] },
      5: { cellWidth: 16, halign: 'right', textColor: [85, 85, 85] },
      6: { cellWidth: 18, halign: 'right', textColor: [85, 85, 85] },
      7: { cellWidth: 10, halign: 'center', textColor: [85, 85, 85] },
      8: { cellWidth: 16, halign: 'right', textColor: [85, 85, 85] },
      9: { cellWidth: 18, halign: 'right', fontStyle: 'bold', textColor: [44, 62, 80] }
    },
    footStyles: {
      fillColor: [248, 249, 250], // Professional light gray background
      textColor: [44, 62, 80], // Professional dark gray
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 2.5,
      lineWidth: { top: 1, bottom: 1 },
      lineColor: [200, 200, 200]
    },
    didParseCell: (data) => {
      const totalsRowIndex = tableData.length;
      const summaryRow1Index = totalsRowIndex + 1;
      const summaryRow2Index = totalsRowIndex + 2;
      const summaryRow3Index = totalsRowIndex + 3;
      const summaryRow4Index = totalsRowIndex + 4;
      
      // Style the totals row
      if (data.row.index === totalsRowIndex) {
        // "TOTAL" label - right align in Description column
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
          data.cell.styles.fontStyle = 'bold';
        }
        // Empty columns
        if (data.column.index === 0 || data.column.index === 2 || data.column.index === 3 || 
            data.column.index === 4 || data.column.index === 5 || data.column.index === 7) {
          data.cell.styles.fontStyle = 'normal';
        }
        // Amounts in totals row - right aligned
        if (data.column.index === 6 || data.column.index === 8 || data.column.index === 9) {
          data.cell.styles.halign = 'right';
        }
        // Net total - blue color in Amount column
        if (data.column.index === 9) {
          data.cell.styles.textColor = [0, 102, 204];
          data.cell.styles.fontStyle = 'bold';
        }
        // Don't show images in totals row
        if (data.column.index === 1) {
          data.cell.styles.minCellHeight = 0;
        }
      }
      
      // Style summary rows
      if (data.row.index === summaryRow1Index || data.row.index === summaryRow2Index) {
        // Total w/o VAT and VAT rows - left align description, right align amounts
        if (data.column.index === 1) {
          data.cell.styles.halign = 'left';
          data.cell.styles.fontStyle = 'normal';
        }
        if (data.column.index === 9) {
          data.cell.styles.halign = 'right';
          data.cell.styles.fontStyle = 'normal';
        }
      }
      
      if (data.row.index === summaryRow3Index) {
        // Net Total row - white background, professional styling
        data.cell.styles.fillColor = [255, 255, 255]; // White background
        data.cell.styles.textColor = [44, 62, 80]; // Professional dark gray
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
        data.cell.styles.minCellHeight = 24; // Taller row to fit amount in words below
        if (data.column.index === 1) {
          data.cell.styles.fontSize = 9;
          data.cell.styles.halign = 'left';
        }
        if (data.column.index === 9) {
          data.cell.styles.halign = 'right';
          data.cell.styles.textColor = [0, 102, 204]; // Blue for total amount
          data.cell.styles.fontSize = 10;
        }
      }
    },
    didDrawCell: (data) => {
      // Don't draw images in totals row or summary rows
      if (data.row.index >= tableData.length) {
        // Add amount in words on left side of Net Total row
        const summaryRow3Index = tableData.length + 3;
        if (data.row.index === summaryRow3Index && data.column.index === 1) {
          // Draw amount in words below "Net Total" text (professional gray text)
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(102, 102, 102); // Professional gray text
          const amountInWords = numberToWords(Math.floor(netTotal));
          const amountText = `UAE Dirham ${amountInWords}`;
          doc.text(amountText, data.cell.x + 3, data.cell.y + data.cell.height / 2 + 4);
        }
        return;
      }
      
      // Add images inside Description column (column index 1) - ONLY in body rows, not header
      if (data.column.index === 1 && data.section === 'body' && data.row.index >= 0) {
        const itemIndex = data.row.index;
        const item = quotation.items[itemIndex];
        const imageBase64 = imageMap[itemIndex];
        
        if (item && item.itemImage) {
          // Position image on the right side of Description column
          const imgWidth = 10;
          const imgHeight = 8;
          const imgX = data.cell.x + data.cell.width - imgWidth - 2; // Right side
          const imgY = data.cell.y + (data.cell.height - imgHeight) / 2; // Centered vertically
          
          if (imageBase64) {
            try {
              // Add the loaded image
              doc.addImage(imageBase64, 'JPEG', imgX, imgY, imgWidth, imgHeight);
            } catch (err) {
              // Fallback to placeholder box
              doc.setDrawColor(200, 200, 200);
              doc.setFillColor(249, 249, 249);
              doc.rect(imgX, imgY, imgWidth, imgHeight, 'FD');
            }
          } else {
            // No image loaded - show placeholder box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(249, 249, 249);
            doc.rect(imgX, imgY, imgWidth, imgHeight, 'FD');
          }
        }
      }
    },
    didDrawPage: (data) => {
      yPos = data.cursor.y;
    }
  });

  // ==================== FOOTER ====================
  
  // Position footer at bottom
  const footerY = pageHeight - 25;
  
  // Gray background bar
  doc.setFillColor(240, 240, 240);
  doc.rect(0, footerY - 5, pageWidth, 30, 'F');
  
  // Services line
  doc.setFontSize(7);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  
  const footerText = 'Sale & Hire of Single & Double Width Mobile Towers • Ladders • Steel Cup Lock Scaffolding • Couplers';
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Contact details - properly aligned and centered
  doc.setFontSize(8);
  const contactY = footerY + 5;
  doc.setFont('helvetica', 'normal');
  
  const contactLine = 'Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Web: www.alcoascaffolding.com';
  doc.text(contactLine, pageWidth / 2, contactY, { align: 'center' });
  
  // Address
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Musaffah, Abu Dhabi, UAE', pageWidth / 2, contactY + 5, { align: 'center' });
  
  return doc;
};

/**
 * Convert number to words (simplified)
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
 * Download quotation as PDF
 */
export const downloadProfessionalPDF = async (quotation) => {
  const doc = await generateProfessionalQuotationPDF(quotation);
  doc.save(`Quotation_${quotation.quoteNumber}.pdf`);
};

/**
 * Share quotation via WhatsApp
 */
export const shareQuotationViaWhatsApp = (quotation) => {
  const phone = quotation.customerPhone?.replace(/\D/g, '') || '';
  
  if (!phone) {
    throw new Error('Customer phone number not available');
  }

  const message = `Hello ${quotation.customerName},

Thank you for your interest in Alcoa Aluminium Scaffolding!

We have prepared a quotation for you:

📋 *Quotation No:* ${quotation.quoteNumber}
📅 *Date:* ${new Date(quotation.quoteDate).toLocaleDateString()}
💰 *Total Amount:* AED ${quotation.totalAmount.toLocaleString()}
⏰ *Valid Until:* ${new Date(quotation.validUntil).toLocaleDateString()}

*Project:* ${quotation.subject || 'Scaffolding Equipment'}

*Items:* ${quotation.items.length} item(s)
${quotation.items.slice(0, 3).map((item, i) => `${i + 1}. ${item.equipmentType} - Qty: ${item.quantity}`).join('\n')}
${quotation.items.length > 3 ? `... and ${quotation.items.length - 3} more items` : ''}

Please download the PDF quotation from our admin panel or request it via email.

We would be happy to discuss any questions you may have.

*Best regards,*
*Alcoa Scaffolding Team*
📞 +971 58 137 5601
🌐 alcoascaffolding.com`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default { generateProfessionalQuotationPDF, downloadProfessionalPDF, shareQuotationViaWhatsApp };

