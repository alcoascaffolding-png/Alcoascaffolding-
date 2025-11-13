/**
 * Professional Quotation PDF Generator
 * Matches Alcoa Scaffolding invoice format
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateProfessionalQuotationPDF = (quotation) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryBlue = [0, 102, 204];
  const darkGray = [60, 60, 60];
  const lightGray = [240, 240, 240];

  let yPos = 15;

  // ==================== HEADER ====================
  
  // Company Name (English)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryBlue);
  doc.text('ALCOA ALUMINIUM SCAFFOLDING', pageWidth / 2, yPos, { align: 'center' });
  
  // Tagline
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  doc.text('Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding', pageWidth / 2, yPos, { align: 'center' });
  
  // Services line
  yPos += 4;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Sale | Hire | Installation | Maintenance | Safety Inspections | Training', pageWidth / 2, yPos, { align: 'center' });
  
  // Horizontal line
  yPos += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  // Document Title - QUOTATION
  yPos += 8;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69); // Red
  doc.text('QUOTATION', pageWidth / 2, yPos, { align: 'center' });
  
  // TRN
  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.text('TRN: 100123456700003', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // ==================== CUSTOMER & QUOTE INFO ====================
  
  // Customer Details Box (Left)
  doc.setFillColor(...lightGray);
  doc.rect(15, yPos, 95, 40, 'F');
  
  const labelX = 18;
  let leftY = yPos + 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  // CUSTOMER NAME (inline - same line)
  const label1 = 'CUSTOMER NAME: ';
  doc.text(label1, labelX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName || 'N/A', labelX + doc.getTextWidth(label1), leftY);
  
  leftY += 6;
  // ADDRESS (inline - same line)
  doc.setFont('helvetica', 'bold');
  const label2 = 'ADDRESS: ';
  doc.text(label2, labelX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerAddress || 'N/A', labelX + doc.getTextWidth(label2), leftY);
  
  leftY += 6;
  // MOBILE NO (inline - same line)
  doc.setFont('helvetica', 'bold');
  const label3 = 'MOBILE NO: ';
  doc.text(label3, labelX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerPhone || 'N/A', labelX + doc.getTextWidth(label3), leftY);
  
  leftY += 6;
  // TRN (inline - same line)
  doc.setFont('helvetica', 'bold');
  const label4 = 'TRN: ';
  doc.text(label4, labelX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerTRN || 'N/A', labelX + doc.getTextWidth(label4), leftY);
  
  leftY += 6;
  // CONTACT PERSON (inline - same line)
  doc.setFont('helvetica', 'bold');
  const label5 = 'CONTACT PERSON: ';
  doc.text(label5, labelX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.contactPersonName || 'N/A', labelX + doc.getTextWidth(label5), leftY);
  
  // Quote Details Box (Right)
  doc.setFillColor(...lightGray);
  doc.rect(115, yPos, 80, 40, 'F');
  
  const rightLabelX = 118;
  let rightY = yPos + 6;
  
  // Quotation No (inline - same line)
  doc.setFont('helvetica', 'bold');
  const rightLabel1 = 'Quotation No: ';
  doc.text(rightLabel1, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quoteNumber, rightLabelX + doc.getTextWidth(rightLabel1), rightY);
  
  rightY += 6;
  // Date (inline - same line)
  doc.setFont('helvetica', 'bold');
  const rightLabel2 = 'Date: ';
  doc.text(rightLabel2, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quotation.quoteDate).toLocaleDateString('en-GB'), rightLabelX + doc.getTextWidth(rightLabel2), rightY);
  
  rightY += 6;
  // Sales Executive (inline - same line)
  doc.setFont('helvetica', 'bold');
  const rightLabel3 = 'Sales Executive: ';
  doc.text(rightLabel3, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.salesExecutive || 'N/A', rightLabelX + doc.getTextWidth(rightLabel3), rightY);
  
  rightY += 6;
  // PO No (inline - same line)
  doc.setFont('helvetica', 'bold');
  const rightLabel4 = 'PO No: ';
  doc.text(rightLabel4, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerPONumber || 'N/A', rightLabelX + doc.getTextWidth(rightLabel4), rightY);
  
  rightY += 6;
  // Payment Terms (inline - same line)
  doc.setFont('helvetica', 'bold');
  const rightLabel5 = 'Payment Terms: ';
  doc.text(rightLabel5, rightLabelX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.paymentTerms || 'Cash/CDC', rightLabelX + doc.getTextWidth(rightLabel5), rightY);
  
  yPos += 45;
  
  // Subject
  if (quotation.subject) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Subject:', 15, yPos);
    doc.setFont('helvetica', 'normal');
    const subjectLines = doc.splitTextToSize(quotation.subject, pageWidth - 40);
    doc.text(subjectLines, 35, yPos);
    yPos += (subjectLines.length * 4) + 3;
  }
  
  yPos += 5;
  
  // ==================== ITEMS TABLE ====================
  
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

  doc.autoTable({
    startY: yPos,
    head: [[
      'SN',
      'Description of Goods',
      'Wt\n(KG)',
      'CBM',
      'Qty',
      'Rate\n(AED)',
      'Taxable\nAmount',
      'VAT\n%',
      'VAT\nAmount',
      'Amount\n(AED)'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryBlue,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 10, halign: 'center' },
      8: { cellWidth: 18, halign: 'right' },
      9: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      yPos = data.cursor.y;
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // ==================== FINANCIAL SUMMARY ====================
  
  const summaryX = pageWidth - 75;
  const summaryWidth = 60;
  
  doc.setFontSize(9);
  let summaryY = yPos;
  
  // Subtotal
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', summaryX, summaryY);
  doc.text(`AED ${quotation.subtotal.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  
  // Additional charges
  if (quotation.deliveryCharges > 0) {
    summaryY += 5;
    doc.text('Delivery:', summaryX, summaryY);
    doc.text(`AED ${quotation.deliveryCharges.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  }
  
  if (quotation.installationCharges > 0) {
    summaryY += 5;
    doc.text('Installation:', summaryX, summaryY);
    doc.text(`AED ${quotation.installationCharges.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  }
  
  if (quotation.pickupCharges > 0) {
    summaryY += 5;
    doc.text('Pickup:', summaryX, summaryY);
    doc.text(`AED ${quotation.pickupCharges.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  }
  
  if (quotation.discount > 0) {
    summaryY += 5;
    doc.setTextColor(0, 128, 0);
    doc.text('Discount:', summaryX, summaryY);
    doc.text(`-AED ${quotation.discount.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  // VAT
  summaryY += 5;
  doc.text(`VAT (${quotation.vatPercentage}%):`, summaryX, summaryY);
  doc.text(`AED ${quotation.vatAmount.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  
  // Total
  summaryY += 7;
  doc.setFillColor(...primaryBlue);
  doc.rect(summaryX - 2, summaryY - 5, summaryWidth + 4, 8, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NET TOTAL:', summaryX, summaryY);
  doc.text(`AED ${quotation.totalAmount.toLocaleString()}`, summaryX + summaryWidth, summaryY, { align: 'right' });
  
  // Amount in words - aligned with summary
  summaryY += 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const amountInWords = numberToWords(quotation.totalAmount);
  doc.text(`(${amountInWords} Dirhams Only)`, summaryX + summaryWidth, summaryY, { align: 'right' });
  
  yPos = summaryY + 10;
  
  // ==================== TERMS & CONDITIONS ====================
  // Fixed position at bottom left above footer
  
  const termsYPosition = pageHeight - 90;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TERMS & CONDITIONS:', 15, termsYPosition);
  
  let termsY = termsYPosition + 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const terms = [
    `Delivery: ${quotation.deliveryTerms || '7-10 days from date of order'}`,
    `Payment: ${quotation.paymentTerms || 'Cash/CDC'}`,
    'Our products are made of high grade Alloy 6082',
    'Manufactured as per BS EN 1004 Standard',
    '5 Years welding warranty on all products',
    'All equipment is safety certified and compliant with UAE regulations'
  ];
  
  terms.forEach((term, index) => {
    doc.text(`• ${term}`, 18, termsY);
    termsY += 4;
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
export const downloadProfessionalPDF = (quotation) => {
  const doc = generateProfessionalQuotationPDF(quotation);
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

