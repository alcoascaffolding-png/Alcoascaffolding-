/**
 * Export Utilities
 * PDF and Excel export functions
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

/**
 * Export data to PDF
 */
export const exportToPDF = (data, columns, title = 'Export') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);
  
  // Prepare table data
  const tableColumn = columns.map(col => col.header);
  const tableRows = data.map(row => 
    columns.map(col => {
      if (col.render && typeof col.render === 'function') {
        // For rendered columns, try to extract text value
        const value = row[col.accessor];
        return value?.toString() || '';
      }
      return row[col.accessor]?.toString() || '';
    })
  );
  
  // Add table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [14, 165, 233], // Primary blue
      textColor: 255,
      fontStyle: 'bold',
    },
  });
  
  // Save PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Export data to Excel
 */
export const exportToExcel = (data, columns, title = 'Export') => {
  // Prepare data
  const excelData = data.map(row => {
    const rowData = {};
    columns.forEach(col => {
      if (col.render && typeof col.render === 'function') {
        const value = row[col.accessor];
        rowData[col.header] = value?.toString() || '';
      } else {
        rowData[col.header] = row[col.accessor];
      }
    });
    return rowData;
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = columns.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet name max 31 chars
  
  // Save file
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

/**
 * Export invoice to PDF
 */
export const exportInvoiceToPDF = (invoice) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Alcoa Aluminium Scaffolding', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Dubai, United Arab Emirates', 14, 27);
  doc.text('TRN: XXXXXXXXX', 14, 32);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.invoiceNumber || 'INVOICE', 14, 45);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}`, 14, 52);
  doc.text(`Due Date: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}`, 14, 57);
  
  // Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, 67);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName || '', 14, 72);
  if (invoice.billingAddress) {
    const address = invoice.billingAddress;
    doc.text(`${address.street || ''}`, 14, 77);
    doc.text(`${address.city || ''}, ${address.country || ''}`, 14, 82);
  }
  
  // Items Table
  const tableColumn = ['Item', 'Quantity', 'Rate', 'Discount', 'Tax', 'Amount'];
  const tableRows = invoice.items?.map(item => [
    item.itemName,
    `${item.quantity} ${item.unit || ''}`,
    `AED ${item.rate?.toFixed(2)}`,
    `${item.discount || 0}${item.discountType === 'percentage' ? '%' : ' AED'}`,
    `${item.taxRate || 0}%`,
    `AED ${item.amount?.toFixed(2)}`,
  ]) || [];
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 92,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 165, 233],
    },
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: AED ${invoice.subtotal?.toFixed(2) || '0.00'}`, 130, finalY);
  doc.text(`Tax: AED ${invoice.totalTax?.toFixed(2) || '0.00'}`, 130, finalY + 5);
  doc.text(`Shipping: AED ${invoice.shippingCharges?.toFixed(2) || '0.00'}`, 130, finalY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total: AED ${invoice.total?.toFixed(2) || '0.00'}`, 130, finalY + 18);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', 14, doc.internal.pageSize.height - 10);
  
  // Save
  doc.save(`Invoice_${invoice.invoiceNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'AED') => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  return format(new Date(date), formatStr);
};

