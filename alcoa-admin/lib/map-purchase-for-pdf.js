function mapPurchaseLineItemsForPdf(items, vatPct = 5) {
  return (items || []).map((row) => {
    const qty = Number(row.quantity) || 0;
    const rate = Number(row.unitPrice) || 0;
    const taxable = Number(row.total) || qty * rate;
    const lineVat = (taxable * vatPct) / 100;
    return {
      equipmentType: row.description || "Item",
      description: "",
      specifications: "",
      size: "",
      weight: 0,
      cbm: 0,
      quantity: qty,
      unit: row.unit || "Nos",
      ratePerUnit: rate,
      taxableAmount: taxable,
      subtotal: taxable,
      vatPercentage: vatPct,
      vatAmount: lineVat,
    };
  });
}

function resolveVatPct(doc) {
  const sub = Number(doc.subtotal) || 0;
  const vat = Number(doc.vatAmount) || 0;
  if (sub > 0 && vat > 0) return Math.round((vat / sub) * 10000) / 100;
  return 5;
}

export function mapPurchaseOrderForPdf(po) {
  const vatPct = resolveVatPct(po);
  const items = mapPurchaseLineItemsForPdf(po.items, vatPct);
  return {
    quoteNumber: po.poNumber,
    customerName: po.vendorName,
    customerAddress: "",
    customerEmail: "",
    customerPhone: "",
    customerTRN: "",
    contactPersonName: "",
    subject: `Purchase Order ${po.poNumber}`,
    paymentTerms: "As per vendor agreement",
    deliveryTerms: po.deliveryDate ? "Per delivery date below" : "As agreed",
    status: po.status,
    items,
    subtotal: Number(po.subtotal) || 0,
    deliveryCharges: 0,
    installationCharges: 0,
    pickupCharges: 0,
    discount: 0,
    discountType: "fixed",
    vatPercentage: vatPct,
    vatAmount: Number(po.vatAmount) || 0,
    totalAmount: Number(po.total) || 0,
    currency: po.currency || "AED",
    notes: po.notes || "",
    quoteDate: po.orderDate,
    validUntil: po.deliveryDate || po.orderDate,
  };
}

export function mapPurchaseInvoiceForPdf(inv) {
  const vatPct = resolveVatPct(inv);
  const items = mapPurchaseLineItemsForPdf(inv.items, vatPct);
  const balance =
    inv.balance != null ? Number(inv.balance) : Math.max(0, (inv.total || 0) - (inv.paidAmount || 0));
  return {
    quoteNumber: inv.invoiceNumber,
    customerName: inv.vendorName,
    customerAddress: "",
    customerEmail: "",
    customerPhone: "",
    customerTRN: "",
    contactPersonName: "",
    subject: `Purchase Invoice ${inv.invoiceNumber}`,
    paymentTerms: "As per vendor agreement",
    status: inv.paymentStatus,
    paymentStatus: inv.paymentStatus,
    paidAmount: Number(inv.paidAmount) || 0,
    balance,
    items,
    subtotal: Number(inv.subtotal) || 0,
    deliveryCharges: 0,
    installationCharges: 0,
    pickupCharges: 0,
    discount: 0,
    discountType: "fixed",
    vatPercentage: vatPct,
    vatAmount: Number(inv.vatAmount) || 0,
    totalAmount: Number(inv.total) || 0,
    currency: inv.currency || "AED",
    notes: inv.notes || "",
    quoteDate: inv.invoiceDate,
    validUntil: inv.dueDate || inv.invoiceDate,
  };
}
