# Sales Flow Fix Manual Testing

Use this checklist after deploying or running `npm run dev`.

## 1. Quotation to Sales Order

1. Open a quotation detail page.
2. Click **Convert to Sales Order**.
3. Expected:
   - A Sales Order is created with an `SO...` number.
   - Customer details, line items, VAT, subtotal, total, notes, payment terms, and delivery terms are copied.
   - Quotation status becomes **Converted to Sales Order**.
   - The button becomes disabled / says **Sales Order Created**.
   - Clicking again does not create a duplicate.

## 2. Quotation to Invoice

1. Open a quotation detail page.
2. Click **Convert to Invoice**.
3. Expected:
   - A Tax Invoice is created with an `SI...` number.
   - It does not show the quotation number as the invoice number.
   - Customer details, line items, VAT, subtotal, total, notes, payment terms, and delivery terms are copied.
   - Quotation status becomes **Converted to Invoice**.
   - The button becomes disabled / says **Invoice Created**.
   - Clicking again does not create a duplicate.

## 3. Existing Wrong Numbers Repair

1. Open an old Sales Order that still shows a `QT...` number.
2. Expected: it repairs to an `SO...` number.
3. Open an old Tax Invoice that still shows a `QT...` or `SO...` number.
4. Expected: it repairs to an `SI...` number.

## 4. Invoice Totals and Balance

1. Open a Tax Invoice with line items.
2. Expected:
   - Subtotal is the sum of taxable line amounts.
   - VAT is correct.
   - Total is correct.
   - Paid is shown.
   - Balance equals `Total - Paid`.
3. Record a receipt against the invoice.
4. Expected:
   - Paid amount increases.
   - Balance decreases.
   - Payment status becomes `partially_paid` or `paid`.

## 5. Sales Order to Invoice

1. Open a Sales Order.
2. Change status to **Invoiced**.
3. Expected:
   - A Tax Invoice is created with an `SI...` number.
   - It links back to the Sales Order.
   - It also links to the original quotation if the Sales Order came from a quotation.
   - Repeating the action does not create a duplicate invoice.

## 6. Full Flow

1. Create Quotation.
2. Convert to Sales Order.
3. Create Delivery Note from Sales Order.
4. Convert Sales Order to Invoice.
5. Record Receipt.
6. Expected:
   - All documents are linked.
   - Numbers use correct prefixes: `QT...`, `SO...`, `DN...`, `SI...`.
   - Totals, VAT, paid, and balance remain consistent.
