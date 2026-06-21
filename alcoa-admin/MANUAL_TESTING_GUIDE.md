# Alcoa Admin — Features Built & Manual Testing Guide

**App:** `alcoa-admin` (Next.js 16 + MongoDB + NextAuth)  
**Last updated:** June 2026  
**Purpose:** List everything implemented in recent development sessions and step-by-step checks for you to test manually.

---

## 1. Testing status (honest summary)

| Test type | Done? | Notes |
|-----------|-------|-------|
| **Production build** (`npm run build`) | Yes | Run multiple times; last run succeeded after latest changes. |
| **Integration script** (`node scripts/test-plan-integration.mjs`) | Partial | Only checks health, a few stats APIs, login, and JS syntax — **not** full business flows. |
| **Manual UI / browser testing** | **No** | Not run end-to-end by the developer agent. **You should use this document to test.** |
| **Partial delivery qty flow** | Build only | Logic is wired; needs your manual test (Section 5.4). |
| **Removed features** | Verified via build | Duplicate, pipeline, bulk actions, share link removed from UI/API. |

**Dev login (default seed):**

- URL: `http://localhost:3000/login`
- Email: `admin@alcoascaffolding.ae`
- Password: `Admin@1234`

**Run dev server:**

```bash
cd alcoa-admin
npm install
npm run dev
```

**Optional automated smoke test (server must be running):**

```bash
node scripts/test-plan-integration.mjs
```

---

## 2. Features removed (out of scope — do NOT expect these)

These were built earlier then **removed** at your request:

| Feature | Status |
|---------|--------|
| Duplicate / Revise quotation | Removed from UI + API |
| Sales Pipeline page | Removed from sidebar + API |
| Bulk export/delete on quotations list | Removed |
| Generate public share link on quotation detail | Removed |

> Note: `/q/[token]` public pages still exist in code but **cannot be generated from admin** anymore.

---

## 3. Full feature list (currently active)

### 3.1 Authentication & security

- [ ] Login with email/password (NextAuth v5)
- [ ] Protected routes via `proxy.js` (middleware)
- [ ] Role-based sidebar (super_admin, admin, manager, sales, accountant, inventory, viewer)
- [ ] API RBAC on major routes (`authorizeApi`)
- [ ] **Users module** — `/users` (admin only): list, create, edit users
- [ ] **Audit log** — `/audit-log` (admin only): view create/update/delete actions
- [ ] Login rate limiting (in-memory fallback)
- [ ] JWT invalidated when user changes password
- [ ] `SETUP_SECRET` required for create-admin in production

### 3.2 Dashboard

- [ ] Stat cards: customers, quotations, messages, revenue, low stock, overdue invoices
- [ ] Revenue chart (6 months)
- [ ] Invoice collection overview
- [ ] Recent inquiries & recent quotations

### 3.3 Leads

- [ ] **Contact Messages** — list, view, status, export
- [ ] **Customers** — CRUD, addresses, contacts, detail page
- [ ] **Customer sales history tab** on customer detail (quotes, orders, invoices)

### 3.4 Sales — Quotations

- [ ] Create / edit / view / delete quotations
- [ ] Line items with product picker
- [ ] Rental fields: `pickupCharges`, per-line `rentalDuration`, **percentage or fixed discount**
- [ ] Status workflow: draft → sent → approved → converted (etc.)
- [ ] Convert to Sales Order on status `converted`
- [ ] PDF download, send email, send WhatsApp (if Twilio configured)
- [ ] Excel export (all quotations)
- [ ] Linked sales order & tax invoice shown on converted quote detail
- [ ] Server-side Zod validation on quotation create/update APIs
- [ ] Safe delete (blocked if linked sales order exists)

### 3.5 Sales — Sales Orders

- [ ] Create / edit / view / delete
- [ ] Product picker on line items
- [ ] Link to quotation; surcharges copied on conversion
- [ ] Status changer (draft → confirmed → in_progress → delivered → invoiced → completed)
- [ ] **Credit limit check** when confirming order (if customer has limit)
- [ ] **Linked tax invoice** card on SO detail
- [ ] **Delivery fulfillment** columns: Ordered | Delivered | Pending | Returned | Remaining
- [ ] Fulfillment badge (fully delivered / qty remaining)
- [ ] Create Delivery Note button (prefill from SO)
- [ ] PDF, email, WhatsApp
- [ ] Excel export

### 3.6 Sales — Tax Invoices (Sales Invoices)

- [ ] Create / edit / view / delete
- [ ] Auto-create from SO when status → `invoiced`
- [ ] Product picker on lines (optional)
- [ ] Payment status: unpaid, partially_paid, paid, overdue
- [ ] **Record Receipt** from invoice detail (deep-link to receipts)
- [ ] **Overdue** auto-marking (based on due date)
- [ ] `paidAmount` validation (cannot mark paid with zero)
- [ ] PDF, email, WhatsApp
- [ ] Excel export

### 3.7 Sales — Delivery Notes

- [ ] Create / edit / view / delete
- [ ] **Note type:** `delivery` (outbound) or `return` / off-hire (inbound)
- [ ] Prefill from sales order with **remaining qty only** (partial delivery)
- [ ] Per-line **remaining qty** hint on form; blocks over-delivery via API
- [ ] Product picker on lines (stock matching)
- [ ] Status: draft → ready → dispatched → in_transit → **delivered** → cancelled
- [ ] **Stock:** outbound `delivered` decreases stock; return `delivered` increases stock
- [ ] **SO status sync** when DN marked delivered
- [ ] PDF, email, WhatsApp
- [ ] Excel export

### 3.8 Partial delivery qty tracking (recent — test carefully)

- [ ] SO detail shows fulfillment per line
- [ ] Second DN from same SO prefills only remaining qty
- [ ] API rejects DN qty greater than remaining
- [ ] Open DN (draft/ready/dispatched/in_transit) counts as **pending** reserved qty
- [ ] Return DN `delivered` reduces net delivered qty

**API endpoints:**

- `GET /api/sales-orders/[id]` — includes `deliveryFulfillment`
- `GET /api/sales-orders/[id]/delivery-fulfillment?excludeDeliveryNote=...`

### 3.9 Purchases

- [ ] **Vendors** — list + CRUD
- [ ] **Purchase Orders** — list, create/edit, detail page, PDF, email to vendor
- [ ] **Purchase Invoices** — list, create/edit, detail page, PDF, email to vendor
- [ ] PO **received** → increases product stock
- [ ] **Record Payment** from purchase invoice detail

### 3.10 Inventory

- [ ] **Products** — CRUD, rental + sale price, min/max stock, purchase price
- [ ] Low-stock awareness on dashboard / product stats
- [ ] **Stock Adjustments** — create adjustments; updates `currentStock`

### 3.11 Accounts

- [ ] **Bank Accounts** — CRUD
- [ ] **Receipts** — record customer payments; link to tax invoice(s); syncs invoice payment status
- [ ] **Payments** — record vendor payments; link to purchase invoice(s)

### 3.12 Exports (Excel)

- [ ] Quotations, Sales Orders, Tax Invoices, Delivery Notes, Products, Customers, Contact Messages

---

## 4. Recommended test order

Test in this order so each step has data for the next:

1. Login & dashboard  
2. Products (create 2–3 scaffolding items with stock)  
3. Customer (create or use existing)  
4. Quotation → approve → convert to SO  
5. SO → confirm → create DN (partial qty) → mark delivered  
6. Second DN for remaining qty  
7. SO → invoiced → tax invoice → record receipt  
8. Purchase: vendor → PO → received → PI → payment  
9. Stock adjustment + return DN  
10. Users & audit log (admin)  
11. Role test (optional): login as non-admin user  

---

## 5. Detailed manual test cases

### 5.1 Login & access

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/login`, wrong password | Error message, no access |
| 2 | Login with admin credentials | Redirect to dashboard |
| 3 | Open `/quotations` while logged out | Redirect to login |
| 4 | As **viewer** role (if created), try delete quotation | Delete hidden or API 403 |

### 5.2 End-to-end sales flow

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create quotation: 2 lines, delivery + pickup charges, 10% discount | Totals correct (subtotal + surcharges − discount + 5% VAT) |
| 2 | Add products via picker | Name, unit, rate filled |
| 3 | Set status **Approved** then **Converted** | Sales order auto-created; quote shows linked SO |
| 4 | Open SO — check totals match quotation | Delivery/installation/pickup/discount carried over |
| 5 | Set SO **Confirmed** (customer over credit limit if testing) | Blocked with clear error OR allowed if under limit |
| 6 | Set SO **Invoiced** | Tax invoice created/linked |
| 7 | Open tax invoice — **Record Receipt** | Receipt form opens; after save, invoice `paid` or `partially_paid` |
| 8 | Download PDF / send email on quote, SO, invoice, DN | PDF downloads; email sends (if SMTP configured) |

### 5.3 Delivery & stock

| Step | Action | Expected |
|------|--------|----------|
| 1 | Note product `currentStock` before test | Record number |
| 2 | Create DN from SO, qty 4 of 10, status **Delivered** | Stock decreased by 4 |
| 3 | Open SO detail | Delivered=4, Remaining=6 |
| 4 | Create second DN | Prefill shows qty 6 |
| 5 | Try DN qty 7 on second note | Save rejected with error |
| 6 | Create **Return** DN, qty 2, **Delivered** | Stock increased by 2; SO remaining adjusts |
| 7 | Stock adjustment (+/−) | Product stock updates |

### 5.4 Partial delivery (priority test)

| Step | Action | Expected |
|------|--------|----------|
| 1 | SO line: 10 Nos | — |
| 2 | DN1: 4 Nos, status Delivered | OK |
| 3 | DN2 prefill from SO | Lines show 6 Nos |
| 4 | DN2: 6 Nos, Delivered | SO fully delivered badge |
| 5 | DN3 attempt 1 Nos | API/UI blocks (0 remaining) |
| 6 | DN1 still draft with 3 Nos (not delivered) | Remaining = 10 − 0 delivered − 3 pending = 7 |

### 5.5 Purchases

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create vendor | Saved |
| 2 | Create PO with product lines | Saved |
| 3 | Set PO **Received** | Product stock increased |
| 4 | Create/link purchase invoice | Totals match PO |
| 5 | Download PO/PI PDF | PDF generates |
| 6 | Send email to vendor (if configured) | Success toast |
| 7 | Record payment on PI | PI payment status updates |

### 5.6 Customers

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open customer detail | Profile loads |
| 2 | **Sales history** tab | Lists quotations, SOs, invoices for customer |
| 3 | Export customers Excel | File downloads |

### 5.7 Admin & security

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create new user (sales role) | Can login; sees sales menu only |
| 2 | Create quotation as sales user | Allowed |
| 3 | Try `/users` as sales user | Blocked or hidden |
| 4 | Delete a quotation (admin) | Audit log entry appears |
| 5 | Change user password, login with old password | Old session invalid on next request |

### 5.8 Exports

| Step | Action | Expected |
|------|--------|----------|
| 1 | Quotations list → Export | `.xlsx` downloads |
| 2 | Repeat for SO, Tax Invoices, DNs | Files download with data |

### 5.9 Confirm removed features (should NOT appear)

| Check | Expected |
|-------|----------|
| Quotation detail | No Duplicate, Revise, or Public link badge |
| Sidebar | No Sales Pipeline |
| Quotations list | No row checkboxes, no bulk bar |
| `/sales-pipeline` | 404 or redirect |

---

## 6. Environment & integrations

Features that need `.env.local` configuration:

| Feature | Env variables |
|---------|----------------|
| MongoDB | `MONGODB_URI` |
| Auth | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| Email | SMTP settings (see `.env.local.example`) |
| WhatsApp | `TWILIO_*`, optional `BLOB_READ_WRITE_TOKEN` |
| Production setup | `SETUP_SECRET` for `/api/setup/create-admin` |

If email/WhatsApp are not configured, PDF download and in-app CRUD should still work.

---

## 7. Known limitations (not bugs — out of scope)

- Sales Returns, Proforma, Work Completion, GRN, Credit Notes, Barcode, Stock Movements ledger
- Full accounting (journal entries, P&L, balance sheet)
- Recurring rental invoicing
- Dispatch board / delivery calendar
- Wt/CBM on SO detail (may still show "—")
- Public customer quote accept/reject (share link removed from admin)
- Purchase WhatsApp
- Server-side pagination on all list pages

---

## 8. Quick checklist (print-friendly)

```
[ ] Login works
[ ] Dashboard loads stats
[ ] Product create + stock visible
[ ] Customer create + sales history tab
[ ] Quotation create with product picker + surcharges + % discount
[ ] Quote → Convert → Sales Order (totals match)
[ ] SO credit limit check
[ ] SO → Invoiced → Tax Invoice
[ ] Receipt on invoice → payment status sync
[ ] DN partial delivery (4 + 6 of 10)
[ ] DN over-delivery blocked
[ ] Return DN increases stock
[ ] PO received increases stock
[ ] PI + vendor payment
[ ] PO/PI PDF + email
[ ] Exports (quote, SO, invoice, DN)
[ ] Users + audit log (admin)
[ ] No duplicate/pipeline/bulk/share-link in UI
```

---

## 9. Report issues

When reporting a problem, include:

1. Page URL and action taken  
2. Expected vs actual  
3. Browser console errors (F12)  
4. Network tab response for failed API call  
5. User role used  

---

*This document reflects the `alcoa-admin` codebase as of the latest build. Re-run `npm run build` after pulling changes.*
