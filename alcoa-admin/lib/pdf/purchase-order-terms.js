/**
 * Standard Local Purchase Order terms. Printed when a purchase order has no
 * `termsAndConditions` of its own.
 */
export function buildPurchaseOrderTerms({
  companyName = "the Company",
  paymentTerms = "As per vendor agreement",
  deliveryDateText = "",
} = {}) {
  const deliveryLine = deliveryDateText
    ? `Goods must be delivered on or before ${deliveryDateText}. Delays must be notified in writing in advance.`
    : "Goods must be delivered on the agreed delivery date. Delays must be notified in writing in advance.";

  return [
    "This Local Purchase Order (LPO) number must be quoted on all invoices, delivery notes and correspondence.",
    "Prices, quantities and specifications are firm and may not be varied without prior written approval from " +
      `${companyName}.`,
    deliveryLine,
    `Delivery must be made to the address stated on this LPO during working hours, with a signed delivery note. ${companyName} accepts no liability for goods delivered without one.`,
    "Goods are received subject to inspection. Items that are damaged, short-supplied or not to specification will be rejected and returned at the vendor's cost.",
    `Payment terms: ${paymentTerms}. Invoices are processed only after the goods are received and accepted.`,
    "The vendor must be VAT registered where applicable and issue a valid tax invoice showing their TRN.",
    "The vendor warrants the goods are new, free from defects and fit for purpose, and shall replace defective items free of charge.",
    "Title and risk pass to the buyer on acceptance of delivery at the stated location.",
    `${companyName} reserves the right to cancel any undelivered portion of this order if the agreed delivery date is not met.`,
  ]
    .map((line, i) => `${i + 1}. ${line}`)
    .join("\n");
}
