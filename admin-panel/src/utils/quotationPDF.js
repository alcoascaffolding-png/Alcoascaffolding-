/**
 * Quotation PDF Generator
 * Creates professional PDF quotations matching Alcoa format
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotationPDF = (quotation, companyInfo = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Company Information (defaults)
  const company = {
    name: companyInfo.name || 'ALCOA ALUMINIUM SCAFFOLDING',
    subtitle: companyInfo.subtitle || 'Manufacturers of Aluminium Scaffolding, Ladders, Steel Cuplock Scaffolding',
    address: companyInfo.address || 'UAE',
    phone: companyInfo.phone || '+971 58 137 5601',
    email: companyInfo.email || 'info@alcoascaffolding.com',
    trn: companyInfo.trn || '100123456700003',
    ...companyInfo
  };

  // Colors
  const primaryColor = [0, 102, 204]; // Blue
  const headerBg = [240, 248, 255];

  // Header Section
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company Name (English)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(company.name, 15, 15);

  // Company Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(company.subtitle, 15, 23);
  
  // Services line
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text('Sale | Hire | Installation | Maintenance | Safety Inspections | Training', 15, 29);

  // Document Type
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 53, 69); // Red
  doc.text('QUOTATION', pageWidth - 15, 20, { align: 'right' });

  // TRN
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`TRN: ${company.trn}`, pageWidth - 15, 27, { align: 'right' });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  // Quote Info Box
  let yPos = 50;
  doc.setFont('helvetica', 'normal');
  
  // Left side - Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 15, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName || 'N/A', 15, yPos + 6);
  if (quotation.customerEmail) doc.text(`Email: ${quotation.customerEmail}`, 15, yPos + 12);
  if (quotation.customerPhone) doc.text(`Phone: ${quotation.customerPhone}`, 15, yPos + 18);

  // Right side - Quote Details
  const rightX = pageWidth - 70;
  doc.setFont('helvetica', 'bold');
  doc.text('Quote No:', rightX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quoteNumber, rightX + 25, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX, yPos + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quotation.quoteDate).toLocaleDateString(), rightX + 25, yPos + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', rightX, yPos + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quotation.validUntil).toLocaleDateString(), rightX + 25, yPos + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Type:', rightX, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.quoteType.toUpperCase(), rightX + 25, yPos + 18);

  // Items Table
  yPos += 30;

  const tableData = quotation.items.map((item, index) => {
    const row = [
      index + 1,
      item.equipmentType,
      item.quantity,
      item.ratePerUnit.toFixed(2),
      item.subtotal.toFixed(2)
    ];

    // Add duration column for rentals
    if (quotation.quoteType === 'rental' && item.rentalDuration) {
      row.splice(3, 0, `${item.rentalDuration.value} ${item.rentalDuration.unit}(s)`);
    }

    return row;
  });

  const headers = quotation.quoteType === 'rental'
    ? [['SN', 'Description', 'Qty', 'Duration', 'Rate (AED)', 'Amount (AED)']]
    : [['SN', 'Description', 'Qty', 'Rate (AED)', 'Amount (AED)']];

  doc.autoTable({
    startY: yPos,
    head: headers,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: quotation.quoteType === 'rental' ? 60 : 90 },
      2: { cellWidth: 20, halign: 'center' },
      [quotation.quoteType === 'rental' ? 5 : 4]: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Financial Summary
  yPos = doc.lastAutoTable.finalY + 10;

  // Summary box on the right
  const summaryX = pageWidth - 80;
  const summaryWidth = 65;

  // Background for summary
  doc.setFillColor(245, 245, 245);
  doc.rect(summaryX, yPos, summaryWidth, 40, 'F');

  doc.setFontSize(9);
  let summaryY = yPos + 7;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX + 5, summaryY);
  doc.text(`AED ${quotation.subtotal.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });

  // Additional charges
  if (quotation.deliveryCharges > 0) {
    summaryY += 6;
    doc.text('Delivery:', summaryX + 5, summaryY);
    doc.text(`AED ${quotation.deliveryCharges.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
  }

  if (quotation.installationCharges > 0) {
    summaryY += 6;
    doc.text('Installation:', summaryX + 5, summaryY);
    doc.text(`AED ${quotation.installationCharges.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
  }

  if (quotation.pickupCharges > 0) {
    summaryY += 6;
    doc.text('Pickup:', summaryX + 5, summaryY);
    doc.text(`AED ${quotation.pickupCharges.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
  }

  if (quotation.discount > 0) {
    summaryY += 6;
    doc.setTextColor(0, 128, 0);
    doc.text('Discount:', summaryX + 5, summaryY);
    doc.text(`-AED ${quotation.discount.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // VAT
  summaryY += 6;
  doc.text(`VAT (${quotation.vatPercentage}%):`, summaryX + 5, summaryY);
  doc.text(`AED ${quotation.vatAmount.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });

  // Total - highlighted
  summaryY += 8;
  doc.setFillColor(...primaryColor);
  doc.rect(summaryX, summaryY - 5, summaryWidth, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL:', summaryX + 5, summaryY);
  doc.text(`AED ${quotation.totalAmount.toLocaleString()}`, summaryX + summaryWidth - 5, summaryY, { align: 'right' });

  // Reset
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  // Notes section
  if (quotation.notes) {
    yPos = summaryY + 15;
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notes:', 15, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quotation.notes, pageWidth - 30);
    doc.text(splitNotes, 15, yPos + 6);
    yPos += splitNotes.length * 5 + 10;
  }

  // Terms and Conditions
  if (quotation.termsAndConditions) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', 15, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const splitTerms = doc.splitTextToSize(quotation.termsAndConditions, pageWidth - 30);
    doc.text(splitTerms, 15, yPos + 6);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Tel: +971 58 137 5601 | +971 50 926 8038  |  Email: Sales@alcoascaffolding.com  |  Musaffah, Abu Dhabi, UAE',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  return doc;
};

/**
 * Download quotation as PDF
 */
export const downloadQuotationPDF = (quotation, companyInfo) => {
  const doc = generateQuotationPDF(quotation, companyInfo);
  doc.save(`Quotation_${quotation.quoteNumber}.pdf`);
};

/**
 * Get PDF as blob for email attachment or WhatsApp
 */
export const getQuotationPDFBlob = (quotation, companyInfo) => {
  const doc = generateQuotationPDF(quotation, companyInfo);
  return doc.output('blob');
};

/**
 * Generate WhatsApp share link with quotation
 */
export const shareQuotationViaWhatsApp = (quotation) => {
  const phone = quotation.customerPhone?.replace(/\D/g, '') || '';
  const message = `Hello ${quotation.customerName},

Thank you for your interest in Alcoa Aluminium Scaffolding!

We have prepared a quotation for you:
📋 Quote No: ${quotation.quoteNumber}
💰 Total Amount: AED ${quotation.totalAmount.toLocaleString()}
📅 Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}

Please find the detailed quotation attached. We would be happy to discuss any questions you may have.

Best regards,
Alcoa Scaffolding Team
📞 +971 58 137 5601
🌐 alcoascaffolding.com`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

