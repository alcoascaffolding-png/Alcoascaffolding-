# Go-Live QA Checklist

This checklist covers **only the surfaces changed or added in this go-live initiative** —
it is intentionally short and skimmable. For a full walkthrough of the whole app, also run
[`CLIENT_TESTING_GUIDE.md`](./CLIENT_TESTING_GUIDE.md).

Tick each box after confirming the expected result.

---

## 1. Quotations — status & expiry

- [ ] **Change status via dropdown (e.g. to "Sent").** Open a quotation, pick a new status from the dropdown. → It saves and persists after refresh; the new status is shown in the list, detail, and dashboard.
- [ ] **Amber "Expired" badge — list.** Find a quote whose Valid-Until date is in the past and whose status is still Draft/Sent/Viewed. → The list row shows an amber **Expired** badge.
- [ ] **Amber "Expired" badge — detail.** Open that same quote. → The detail view shows the amber **Expired** treatment, but the dropdown still lets you set any status.
- [ ] **Amber "Expired" badge — dashboard recent activity.** Open the dashboard → "Recent Quotations". → The lapsed quote shows an amber **Expired** badge (not its raw stored status).
- [ ] **"Expired" list filter.** In Quotations, filter by **Expired**. → Returns date-lapsed open quotes.
- [ ] **"Pending" count = Draft + Sent only.** → Pending excludes accepted/rejected/converted and excludes date-lapsed quotes.

## 2. Forms — validation feedback

- [ ] **Missing/invalid field shows a toast.** In each of Quotation, Sales Order, Tax Invoice, Delivery Note, Customer forms and the CRUD dialogs, try to Save with a required field blank or invalid (or zero line items where applicable). → A clear toast lists what to fix; no silent/no-op Save.

## 3. Customers — WhatsApp removed

- [ ] **No WhatsApp on detail card.** Open a customer. → No WhatsApp button; **Email** remains.
- [ ] **No WhatsApp on Contacts tab.** → Contact rows have no WhatsApp button; Email remains.
- [ ] **No WhatsApp in list row menu.** → Row actions use the shared menu with no WhatsApp option.
- [ ] **Stats use shared cards.** Customers list stat cards render via the shared card style.

## 4. Exports — .xlsx

- [ ] **Each list exports correctly.** For Customers, Products, Vendors, Purchase Orders, Purchase Invoices, Receipts, and Payments, click Export. → An `.xlsx` downloads with the correct columns for that entity.

## 5. Purchase Orders / Purchase Invoices — row menu & stats

- [ ] **Row menu actions.** In PO and PI lists, open a row menu. → It offers **Download PDF** and **Send Email**.
- [ ] **Stat cards.** → PO/PI stat cards show **Total Value**; PI also shows **Outstanding**.

## 6. Filters

- [ ] **Vendors status filter.** Filter vendors by status. → Only matching rows show.
- [ ] **Users status + role filters.** Filter users by status and by role. → Only matching rows show.

## 7. Sales Orders — line items & credit limit

- [ ] **Edit line items updates totals.** Edit a sales order's line items and save. → Stored subtotal/total update; the list amount and stat cards reflect the new value.
- [ ] **Credit-limit check on confirm.** Confirm an order that would exceed the customer's credit limit. → The check fires and warns/blocks as designed.

## 8. Purchase Invoices — edits persist

- [ ] **Change vendor / linked PO.** Edit a PI's vendor or linked purchase order and save. → Changes persist after refresh.

## 9. Contact Messages

- [ ] **Pagination + server search.** Page through messages and run a search. → Correct results across pages (server-side).
- [ ] **Export downloads.** Export contact messages. → File downloads.
- [ ] **Stat cards refresh.** Edit or delete a message. → Stat cards update to reflect the change.

## 10. Tax Invoices — Outstanding

- [ ] **Cancelled excluded.** Cancel a tax invoice. → The **Outstanding** total excludes cancelled invoices.

## 11. Stock Adjustments

- [ ] **Over-decrement rejected.** Create a negative adjustment larger than current stock. → Rejected with a clear message.
- [ ] **Delivery-note stock still works.** Post a delivery note. → Stock decrements normally as before.

## 12. Bank Accounts — opening balance

- [ ] **Opening balance seeds running balance.** Set an Opening Balance on a bank account. → The running balance starts from it.
- [ ] **Later receipt/payment moves it.** Record a receipt or payment against that account. → The running balance moves correctly.

## 13. Purchase Order detail — Edit button

- [ ] **Edit opens the editor.** Open a PO detail and click **Edit**. → It opens the PO editor (not a dead-end list).

## 14. Audit Log — date + time

- [ ] **Entries show date AND time.** Open the Audit Log. → Each entry displays both the date and the time.

---

_Reminder: this checklist is scoped to the go-live changes only. Run
[`CLIENT_TESTING_GUIDE.md`](./CLIENT_TESTING_GUIDE.md) for full end-to-end coverage._
