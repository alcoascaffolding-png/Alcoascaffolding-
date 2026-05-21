export function formatCustomerAddressFromRecord(customer) {
  if (!customer?.addresses?.length) return "";
  const addr = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
  if (!addr) return "";
  return [addr.addressLine1, addr.addressLine2, addr.area, addr.city, addr.emirate]
    .filter(Boolean)
    .join(", ");
}

/**
 * Maps a sales order into the quotation PDF layout shape (same table, header, footer).
 */
export function mapSalesOrderForQuotationPdf(order) {
  const subtotal = Number(order.subtotal || 0);
  const vatAmount = Number(order.vatAmount || 0);
  const vatPct = resolveVatPct(order);
  const items = mapLineItemsForPdf(order, vatPct);

  const cust = order.customer && typeof order.customer === "object" ? order.customer : null;
  const customerAddress = order.customerAddress || formatCustomerAddressFromRecord(cust);

  return {
    quoteNumber: order.orderNumber,
    customerName: order.customerName,
    customerAddress,
    customerEmail: order.customerEmail || cust?.primaryEmail,
    customerPhone: order.customerPhone || cust?.primaryPhone,
    customerTRN: order.customerTRN || cust?.vatRegistrationNumber || "",
    contactPersonName: "",
    subject: `Sales Order ${order.orderNumber}`,
    salesExecutive: "",
    preparedBy: "",
    paymentTerms: "Cash/CDC",
    deliveryTerms: order.deliveryDate ? "Per delivery date below" : "As per agreement",
    status: order.status,
    items,
    subtotal,
    deliveryCharges: 0,
    installationCharges: 0,
    pickupCharges: 0,
    discount: 0,
    discountType: "fixed",
    vatPercentage: vatPct,
    vatAmount,
    totalAmount: Number(order.total || 0),
    currency: order.currency || "AED",
    notes: order.notes || "",
    termsAndConditions: "",
    quoteDate: order.orderDate,
    validUntil: order.deliveryDate || order.orderDate,
  };
}

function mapLineItemsForPdf(doc, vatPct) {
  return (doc.items || []).map((it) => {
    const lineTotal = Number(it.total ?? Number(it.quantity || 0) * Number(it.unitPrice || 0));
    const lineVat = (lineTotal * vatPct) / 100;
    return {
      equipmentType: it.description || "",
      description: "",
      weight: 0,
      cbm: 0,
      quantity: it.quantity,
      unit: it.unit || "Nos",
      ratePerUnit: it.unitPrice,
      taxableAmount: lineTotal,
      vatAmount: lineVat,
      subtotal: lineTotal,
      vatPercentage: vatPct,
    };
  });
}

function mapLineItemsForDisplay(doc, vatPct) {
  return (doc.items || []).map((it) => {
    const lineTotal = Number(it.total ?? Number(it.quantity || 0) * Number(it.unitPrice || 0));
    const lineVat = (lineTotal * vatPct) / 100;
    return {
      ...it,
      equipmentType: it.description,
      ratePerUnit: it.unitPrice,
      taxableAmount: lineTotal,
      vatAmount: lineVat,
      vatPercentage: vatPct,
      lineTotalWithVat: lineTotal + lineVat,
    };
  });
}

function resolveVatPct(doc) {
  const subtotal = Number(doc.subtotal || 0);
  const vatAmount = Number(doc.vatAmount || 0);
  return subtotal > 0 ? Math.round((vatAmount / subtotal) * 10000) / 100 : 5;
}

/**
 * Maps a sales invoice into the quotation PDF layout shape.
 */
export function mapSalesInvoiceForQuotationPdf(invoice) {
  const subtotal = Number(invoice.subtotal || 0);
  const vatAmount = Number(invoice.vatAmount || 0);
  const vatPct = resolveVatPct(invoice);
  const items = mapLineItemsForPdf(invoice, vatPct);
  const cust = invoice.customer && typeof invoice.customer === "object" ? invoice.customer : null;
  const customerAddress = invoice.customerAddress || formatCustomerAddressFromRecord(cust);
  const total = Number(invoice.total || 0);
  const paid = Number(invoice.paidAmount || 0);
  const balance =
    invoice.balance != null ? Number(invoice.balance) : Math.max(0, total - paid);

  return {
    quoteNumber: invoice.invoiceNumber,
    customerName: invoice.customerName,
    customerAddress,
    customerEmail: invoice.customerEmail || cust?.primaryEmail,
    customerPhone: invoice.customerPhone || cust?.primaryPhone,
    customerTRN: invoice.customerTRN || cust?.vatRegistrationNumber || "",
    contactPersonName: "",
    subject: `Sales Invoice ${invoice.invoiceNumber}`,
    salesExecutive: "",
    preparedBy: "",
    paymentTerms: "Cash/CDC",
    deliveryTerms: "As per invoice due date",
    status: invoice.paymentStatus,
    paymentStatus: invoice.paymentStatus,
    paidAmount: paid,
    balance,
    items,
    subtotal,
    deliveryCharges: 0,
    installationCharges: 0,
    pickupCharges: 0,
    discount: 0,
    discountType: "fixed",
    vatPercentage: vatPct,
    vatAmount,
    totalAmount: total,
    currency: invoice.currency || "AED",
    notes: invoice.notes || "",
    termsAndConditions: "",
    quoteDate: invoice.invoiceDate,
    validUntil: invoice.dueDate || invoice.invoiceDate,
  };
}

/** Maps sales invoice line items for the admin detail table (PDF-style columns). */
export function mapSalesInvoiceItemsForDisplay(invoice) {
  const vatPct = resolveVatPct(invoice);
  return mapLineItemsForDisplay(invoice, vatPct);
}

/** Maps sales order line items for the admin detail table (PDF-style columns). */
export function mapSalesOrderItemsForDisplay(order) {
  return mapLineItemsForDisplay(order, resolveVatPct(order));
}
