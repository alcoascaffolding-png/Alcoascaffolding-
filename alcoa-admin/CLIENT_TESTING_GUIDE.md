# Alcoa Admin Panel — Client Manual Testing Guide

**Product:** Alcoa Aluminium Scaffolding — Administration Portal  
**Version:** July 2026  
**Purpose:** Complete feature list and step-by-step checklist for your team to manually test every module before go-live.

---

## 1. How to access

### Production (live) environment

| Item | Details |
|------|---------|
| **Admin panel** | [https://admin-dev-seven.vercel.app/](https://admin-dev-seven.vercel.app/) |
| **Sign in** | [https://admin-dev-seven.vercel.app/login](https://admin-dev-seven.vercel.app/login) |
| **Email** | `admin@alcoascaffolding.ae` |
| **Password** | `Admin@1234` |

> **Primary login for UAT:** use the credentials above (Super Admin — full access to all modules).

| Item | Details |
|------|---------|
| **Local testing** | `http://localhost:3000/login` (if running dev server) |
| **Browser** | Chrome, Edge, or Firefox (latest version recommended) |
| **Screen** | Desktop recommended; mobile sidebar menu also supported |

### Additional test accounts (if seeded on the server)

| Role | Email | Password | What they can test |
|------|-------|----------|-------------------|
| **Super Admin** | `admin@alcoascaffolding.ae` | `Admin@1234` | Full access — all modules, users, audit log |
| **Sales Manager** | `sales@alcoascaffolding.ae` | `Sales@1234` | Sales, customers, leads (manager-level write) |
| **Sales Executive** | `salexec@alcoascaffolding.ae` | `SalExec@1234` | Sales documents only |
| **Accounts Officer** | `accounts@alcoascaffolding.ae` | `Accounts@1234` | Invoices, receipts, payments, bank accounts |
| **Inventory Officer** | `inventory@alcoascaffolding.ae` | `Inventory@1234` | Products, stock, purchase orders, vendors |

> Use **Super Admin** for the first full pass. Then log in as other roles to confirm access restrictions.

---

## 2. General UI features (test once)

These apply across the whole admin panel.

| # | Feature | How to test | Expected result |
|---|---------|-------------|-----------------|
| 1 | **Login** | Enter email + password on `/login` | Redirect to Dashboard |
| 2 | **Wrong password** | Use incorrect password | Error shown; no access |
| 3 | **Logout** | Profile menu → Sign out | Returns to login page |
| 4 | **Sidebar navigation** | Click each menu group and item | Correct page opens; active item highlighted |
| 5 | **Collapse sidebar** | Click hamburger (☰) on desktop | Sidebar shrinks to icons only |
| 6 | **Mobile menu** | Resize to mobile or use phone | Sidebar opens as overlay; close button works |
| 7 | **Global search** | Click search bar or press **Ctrl+K** (Mac: **⌘K**) | Command palette opens |
| 8 | **Command palette — navigation** | Type a page name (e.g. "Vendors") | Jump to that page |
| 9 | **Command palette — quick actions** | Type "New quotation" | Opens create quotation page |
| 10 | **Command palette — record search** | Type 2+ characters of a customer/product name | Matching records listed; click opens record |
| 11 | **Notifications** | Click bell icon in top bar | Shows alerts (low stock, overdue invoices, etc.) |
| 12 | **Theme toggle** | Click sun/moon icon | Switches light / dark mode |
| 13 | **ALCOA branding** | Check login page + sidebar logo | Company logo displayed |
| 14 | **Protected routes** | Open any admin URL while logged out | Redirected to login |

---

## 3. Menu structure

Use the **left sidebar** to navigate between modules. There are no cross-page "Back to…" buttons on list pages — use the menu to move between related sections.

| Section | Pages (in order) |
|---------|------------------|
| **Overview** | Dashboard |
| **Leads** | Contact Messages, Customers |
| **Sales** | Quotations, Sales Orders, Tax Invoices, Delivery Notes |
| **Purchases** | Vendor Categories, Vendors, Purchase Orders, Purchase Invoices |
| **Inventory** | Product Categories, Products, Stock Adjustments |
| **Accounts** | Bank Accounts, Receipts, Payments |
| **Settings** *(admin only)* | Users, Audit Log |

---

## 4. Module-by-module testing

For each module below: open the page from the sidebar, verify the list loads, and complete the checklist.

---

### 4.1 Dashboard (`/`)

**What it does:** Business overview with live stats, charts, and recent activity.

**Features:**
- Stat cards: customers, quotations, new messages, monthly revenue
- Alerts: low stock, out of stock, overdue invoices
- Inventory summary: total products, inventory value, rental units, recent adjustments
- Revenue chart (last 6 months)
- Invoice collection overview (paid / overdue / collection rate)
- Recent inquiries, quotations, and sales orders
- Clickable cards that link to filtered lists (e.g. overdue invoices)

**Checklist:**
- [ ] Dashboard loads without errors
- [ ] All stat numbers look reasonable (not blank or NaN)
- [ ] Low-stock alert appears when products are below minimum
- [ ] Click "Overdue Invoices" card → opens filtered tax invoice list
- [ ] Click "Low Stock Products" → opens products with stock filter
- [ ] Revenue chart displays if invoices exist
- [ ] Recent activity lists show latest records
- [ ] "Create PO from low stock" link works

---

### 4.2 Contact Messages (`/contact-messages`)

**What it does:** Manage website inquiries and quote requests from leads.

**Features:**
- List with search, status filter, type filter (contact / quote)
- Stat cards: total, new, in progress, urgent
- View message detail in dialog
- Update status: new → read → in progress → responded → closed
- Set priority: low, medium, high, urgent
- Add internal notes
- Delete message
- **Import** from Excel/CSV template
- **Export** to Excel

**Checklist:**
- [ ] List loads with stat cards
- [ ] Search filters messages
- [ ] Status and type filters work
- [ ] Open a message → full details visible
- [ ] Change status and save → updates in list
- [ ] Delete message (with confirmation)
- [ ] Export downloads `.xlsx` file
- [ ] Import template downloads and upload works (optional)

---

### 4.3 Customers (`/customers`)

**What it does:** Customer relationship management (CRM).

**Features:**
- List with search, status filter, pagination
- Stat cards: total, active, prospects, revenue
- Customer detail page with profile, contacts, addresses
- **Sales history tab** on detail: quotations, sales orders, tax invoices
- Create customer (`/customers/new`)
- Edit customer
- Delete customer
- Row actions: view, edit, email, WhatsApp shortcuts
- **Import** customers from Excel/CSV
- **Export** to Excel

**Checklist:**
- [ ] Customer list loads
- [ ] Create new customer with company, contact, address, VAT/TRN
- [ ] Open customer detail → all tabs load
- [ ] Sales history tab shows linked quotes/orders/invoices
- [ ] Edit and save customer
- [ ] Status filter works (active, prospect, inactive, blocked)
- [ ] Export downloads file with customer data
- [ ] Delete customer (admin only; confirm blocked if linked records exist)

---

### 4.4 Quotations (`/quotations`)

**What it does:** Create and manage sales quotations for rental and sale items.

**Features:**
- List with search, status filter, export
- Create / edit quotation (full-page form)
- Line items with **product picker**
- Rental fields: rental duration per line, pickup charges
- Surcharges: delivery, installation
- Discount: percentage or fixed amount
- VAT 5% calculation
- Status workflow: draft → sent → approved → converted (and others)
- **Convert to Sales Order** when approved/converted
- PDF download (branded ALCOA layout)
- Send email with PDF attachment
- Send WhatsApp with PDF (if Twilio configured)
- Linked sales order shown on converted quote detail
- Safe delete (blocked if sales order exists)

**Checklist:**
- [ ] Create quotation with 2+ line items via product picker
- [ ] Totals correct: subtotal + surcharges − discount + 5% VAT
- [ ] Save as draft, then edit
- [ ] Change status to Approved, then Converted
- [ ] Sales order auto-created; link visible on quote detail
- [ ] Download PDF — opens with logo and correct amounts
- [ ] Send email (if SMTP configured) — success message
- [ ] Export quotations list to Excel
- [ ] Try delete converted quote — should be blocked or warned

---

### 4.5 Sales Orders (`/sales-orders`)

**What it does:** Manage confirmed customer orders after quotation conversion.

**Features:**
- List with search, status filter, export
- Create / edit sales order (manual or from quotation)
- Product picker on lines
- Status: draft → confirmed → in_progress → delivered → invoiced → completed
- **Credit limit check** when confirming (if customer has limit)
- Delivery fulfillment columns: Ordered | Delivered | Pending | Returned | Remaining
- Fulfillment badge (fully delivered / qty remaining)
- Create Delivery Note button (prefills from SO)
- Auto-create tax invoice when status → invoiced
- Linked tax invoice card on detail
- PDF, email, WhatsApp
- Excel export

**Checklist:**
- [ ] Open SO created from quotation — totals match quote
- [ ] Confirm order (test credit limit if customer has limit set)
- [ ] Fulfillment table shows correct qty per line
- [ ] Create delivery note from SO — prefilled lines
- [ ] Set status to Invoiced — tax invoice created/linked
- [ ] Download SO PDF
- [ ] Export sales orders Excel

---

### 4.6 Tax Invoices (`/sales-invoices`)

**What it does:** Customer billing and payment tracking (UAE VAT tax invoices).

**Features:**
- List with search, payment status filter, export
- Stat cards: total, paid, overdue, outstanding
- Create / edit tax invoice
- Payment status: unpaid, partially_paid, paid, overdue
- Auto-overdue marking based on due date
- **Record Receipt** shortcut from invoice detail
- Product lines (optional)
- PDF, email, WhatsApp
- Filter overdue: `/sales-invoices?paymentStatus=overdue`
- Excel export

**Checklist:**
- [ ] List loads with stat cards
- [ ] Open invoice from SO — amounts match
- [ ] Overdue filter shows past-due invoices
- [ ] Record Receipt from detail → receipt form opens
- [ ] After receipt saved → invoice payment status updates (paid / partial)
- [ ] Download tax invoice PDF
- [ ] Export to Excel

---

### 4.7 Delivery Notes (`/delivery-notes`)

**What it does:** Track outbound deliveries and inbound returns (off-hire).

**Features:**
- List with search, export
- Note type: **delivery** (outbound) or **return** (inbound)
- Create from sales order with **remaining qty only** (partial delivery)
- Blocks over-delivery (qty cannot exceed remaining)
- Product picker on lines
- Status: draft → ready → dispatched → in_transit → delivered → cancelled
- **Stock impact:** outbound delivered decreases stock; return delivered increases stock
- SO status sync when DN marked delivered
- PDF, email, WhatsApp
- Excel export

**Checklist:**
- [ ] Create DN from SO — lines prefilled with remaining qty
- [ ] Partial delivery: deliver 4 of 10 → SO shows Delivered=4, Remaining=6
- [ ] Second DN prefills remaining 6 only
- [ ] Try qty greater than remaining — blocked with error
- [ ] Mark DN delivered → product stock updates
- [ ] Create return DN → stock increases on delivery
- [ ] Download DN PDF

---

### 4.8 Vendor Categories (`/vendors/categories`)

**What it does:** Manage categories used when classifying vendors (Supplier, Manufacturer, etc.).

**Features:**
- List with search, sort by order
- Stat cards: total, active, inactive
- **Add Category** button
- Edit / delete category
- Fields: name, sort order, active/inactive, description
- Inactive categories hidden from vendor dropdowns

**Checklist:**
- [ ] List loads with default categories (Supplier, Manufacturer, etc.)
- [ ] Add new category — appears in list
- [ ] Edit category name and sort order
- [ ] Deactivate category — hidden on vendor form dropdown
- [ ] Delete unused category works; delete in-use category blocked

---

### 4.9 Vendors (`/vendors`)

**What it does:** Supplier / vendor master data for purchases.

**Features:**
- List with search
- **Add Vendor** button
- Auto-generated vendor code
- Category dropdown (from Vendor Categories)
- Inline "Add category" on vendor form
- Fields: company, contact, VAT/TRN, trade license, emirate, payment terms, credit limit, status
- Edit / delete vendor
- **Import** from Excel/CSV

**Checklist:**
- [ ] Add new vendor with all key fields
- [ ] Vendor code auto-assigned on save
- [ ] Category dropdown shows active categories
- [ ] Edit vendor and save
- [ ] Import vendors from template (optional)
- [ ] Delete vendor (if not linked to POs)

---

### 4.10 Purchase Orders (`/purchase-orders`)

**What it does:** Order stock/materials from vendors.

**Features:**
- List with search
- Create / edit purchase order
- Product lines with qty and pricing
- Status workflow including **Received**
- **Received** status increases product stock
- Detail page with PDF download
- Email PO to vendor (if configured)
- Link from Products page: "Create PO from low stock"

**Checklist:**
- [ ] Create PO with vendor and product lines
- [ ] Note product stock before receiving
- [ ] Set PO status to Received → stock increases
- [ ] Download PO PDF
- [ ] Email to vendor (if SMTP configured)
- [ ] Create PO from low-stock products link on Products page

---

### 4.11 Purchase Invoices (`/purchase-invoices`)

**What it does:** Vendor bills linked to purchase orders.

**Features:**
- List with search
- Create / edit purchase invoice
- Link to purchase order
- Detail page with PDF
- Email to vendor
- **Record Payment** from detail → Payments module
- Payment status sync

**Checklist:**
- [ ] Create PI from or linked to PO — totals match
- [ ] Download PI PDF
- [ ] Record Payment from detail
- [ ] Payment status updates after saving payment

---

### 4.12 Product Categories (`/products/categories`)

**What it does:** Categories for inventory products (e.g. Aluminium Scaffolding, Formwork).

**Features:** Same as Vendor Categories (add, edit, delete, sort order, active/inactive).

**Checklist:**
- [ ] Add new product category
- [ ] Edit and deactivate category
- [ ] Category appears on product form dropdown

---

### 4.13 Products (`/products`)

**What it does:** Equipment and materials catalogue with stock tracking.

**Features:**
- List with search, stock filter (all / low / out / critical)
- Stat cards: total, low stock, out of stock, inventory value
- Row highlighting for low/out-of-stock rows
- **Add Product** button
- Fields: item code, name, category, unit, selling price, rental price/day, purchase price, min/max stock, reorder level
- Product detail page with stock history
- Stock filter via URL: `/products?stock=low`
- **Import** from Excel/CSV
- **Export** to Excel
- "Create PO from low stock" shortcut

**Checklist:**
- [ ] Add product with prices and stock levels
- [ ] Low stock filter shows correct items
- [ ] Click product row → detail page with history
- [ ] Edit product and save
- [ ] Export products Excel
- [ ] Import products from template
- [ ] Low-stock stat card links to filtered list

---

### 4.14 Stock Adjustments (`/stock-adjustments`)

**What it does:** Manual stock corrections (damage, count differences, write-offs).

**Features:**
- List of past adjustments
- Create new adjustment (product, qty +/- , reason)
- Updates product `currentStock` on save
- View-only list (no edit of past adjustments)

**Checklist:**
- [ ] Note product stock before adjustment
- [ ] Create positive adjustment (+10) → stock increases
- [ ] Create negative adjustment (−5) → stock decreases
- [ ] Adjustment appears in list with correct values

---

### 4.15 Bank Accounts (`/bank-accounts`)

**What it does:** Company bank account register for receipts and payments.

**Features:**
- List with CRUD
- Fields: account name, bank, account number, IBAN, SWIFT, branch, currency, opening balance, primary flag
- **Import** from Excel/CSV

**Checklist:**
- [ ] Add bank account
- [ ] Mark one account as primary
- [ ] Edit account details
- [ ] Import bank accounts (optional)

---

### 4.16 Receipts (`/receipts`)

**What it does:** Record customer payments against tax invoices.

**Features:**
- List of receipts
- Create receipt: customer, amount, date, bank account, link to invoice(s)
- Auto-updates linked tax invoice payment status
- View-only after creation (no edit)

**Checklist:**
- [ ] Create receipt against unpaid invoice
- [ ] Invoice status changes to paid or partially_paid
- [ ] Receipt appears in list with correct amount

---

### 4.17 Payments (`/payments`)

**What it does:** Record vendor payments against purchase invoices.

**Features:**
- List of payments
- Create payment: vendor, amount, date, bank account, link to purchase invoice(s)
- Auto-updates purchase invoice payment status
- View-only after creation

**Checklist:**
- [ ] Create payment against purchase invoice
- [ ] Purchase invoice payment status updates
- [ ] Payment appears in list

---

### 4.18 Users (`/users`) — Admin only

**What it does:** Manage admin panel user accounts and permissions.

**Features:**
- List users with role and permission mode
- Add user with name, email, password, role, department
- Roles: Super Admin, Admin, Manager, Accountant, Sales, Inventory, Viewer
- Custom permissions per module (read / write / delete)
- Activate / deactivate user
- Edit user (password optional on edit)

**Checklist:**
- [ ] List shows all users
- [ ] Create new user with Sales role
- [ ] Log in as new user → sees only allowed menu items
- [ ] Edit user role → menu access changes after re-login
- [ ] Deactivate user → cannot log in

---

### 4.19 Audit Log (`/audit-log`) — Admin only

**What it does:** Track who created, updated, or deleted records.

**Features:**
- Searchable log of admin actions
- Shows user, action, resource, summary, timestamp

**Checklist:**
- [ ] Log loads after performing create/edit/delete actions
- [ ] Search filters entries
- [ ] Entries match actions you performed in other modules

---

## 5. Recommended end-to-end test flow

Test in this order so each step has data for the next:

```
1.  Login as Super Admin
2.  Product Categories → add a test category
3.  Products → create 2–3 items with stock
4.  Vendor Categories → verify defaults
5.  Vendors → create a supplier
6.  Customers → create a test customer
7.  Quotation → create with products, surcharges, discount → Approve → Convert
8.  Sales Order → confirm → check fulfillment table
9.  Delivery Note → partial qty (e.g. 4 of 10) → mark Delivered → check stock
10. Delivery Note → second DN for remaining qty → Delivered
11. Sales Order → set Invoiced → Tax Invoice created
12. Receipt → record payment → invoice marked paid
13. Purchase Order → create → Received → stock increases
14. Purchase Invoice → create → Payment recorded
15. Stock Adjustment → manual +/- adjustment
16. Return Delivery Note → stock increases
17. Dashboard → verify stats updated
18. Export key lists (quotations, products, customers)
19. Users → create test user → role access test
20. Audit log → verify entries
```

---

## 6. Import & export summary

| Module | Import (Excel/CSV) | Export (Excel) |
|--------|-------------------|----------------|
| Products | Yes | Yes |
| Vendors | Yes | Yes |
| Customers | Yes | Yes |
| Contact Messages | Yes | Yes |
| Bank Accounts | Yes | No |
| Quotations | No | Yes |
| Sales Orders | No | Yes |
| Tax Invoices | No | Yes |
| Delivery Notes | No | Yes |

**How to import:** Open the module list → click **Import** → download template → fill data → upload.

> Product and vendor **categories must exist** before importing products/vendors that reference them.

---

## 7. PDF, email & WhatsApp

| Document | PDF download | Email | WhatsApp |
|----------|-------------|-------|----------|
| Quotation | Yes | Yes* | Yes* |
| Sales Order | Yes | Yes* | Yes* |
| Tax Invoice | Yes | Yes* | Yes* |
| Delivery Note | Yes | Yes* | Yes* |
| Purchase Order | Yes | Yes* | No |
| Purchase Invoice | Yes | Yes* | No |

\* Requires environment configuration (SMTP for email, Twilio for WhatsApp). If not configured, PDF download and in-app CRUD still work.

---

## 8. Role-based access (quick reference)

| Role | Typical access |
|------|----------------|
| **Super Admin / Admin** | Everything including Users and Audit Log |
| **Manager** | Dashboard, leads, sales, products (broad write) |
| **Sales** | Quotations, sales orders, invoices, delivery notes, customers |
| **Accountant** | Invoices, receipts, payments, bank accounts, vendors, purchase invoices |
| **Inventory** | Products, stock, purchase orders, vendors, delivery notes |
| **Viewer** | Read-only access to most lists; no create/edit/delete |

Test at least one non-admin role to confirm menu items and buttons match expectations.

---

## 9. Features NOT included (out of scope)

Do **not** expect these in the current release:

- Sales pipeline / kanban board
- Duplicate or revise quotation
- Public customer quote accept/reject link
- Bulk delete/export on quotation list
- Full accounting (journal entries, P&L, balance sheet)
- Credit notes, proforma invoices, GRN
- Barcode scanning, stock movement ledger
- Recurring rental invoicing
- Dispatch calendar / delivery board
- Purchase order WhatsApp

---

## 10. How to report issues

When you find a problem, please include:

1. **Page URL** (e.g. `/sales-invoices`)
2. **Steps** you took before the issue
3. **Expected** vs **actual** result
4. **User role** used (e.g. Super Admin, Sales)
5. **Screenshot** if possible
6. **Browser** (Chrome / Edge / Firefox) and device (desktop / mobile)

---

## 11. Master checklist (print-friendly)

```
GENERAL
[ ] Login / logout works
[ ] Sidebar navigation — all sections
[ ] Global search (Ctrl+K / Cmd+K)
[ ] Notifications bell
[ ] Light / dark theme
[ ] Mobile sidebar menu

DASHBOARD
[ ] Stats and charts load
[ ] Low stock / overdue alerts
[ ] Recent activity lists

LEADS
[ ] Contact messages — view, status, export
[ ] Customers — CRUD, detail, sales history, import/export

SALES
[ ] Quotation — create, PDF, convert to SO
[ ] Sales order — confirm, fulfillment, invoiced
[ ] Tax invoice — overdue filter, receipt, PDF
[ ] Delivery note — partial delivery, stock update, return DN

PURCHASES
[ ] Vendor categories — add/edit
[ ] Vendors — add/edit, import
[ ] Purchase order — received → stock up
[ ] Purchase invoice — payment

INVENTORY
[ ] Product categories — add/edit
[ ] Products — CRUD, stock filters, import/export
[ ] Stock adjustment — +/- qty

ACCOUNTS
[ ] Bank accounts — CRUD
[ ] Receipts — linked to invoice
[ ] Payments — linked to purchase invoice

ADMIN
[ ] Users — create role-based user
[ ] Audit log — entries after changes
[ ] Role restriction test (non-admin login)
```

---

*Alcoa Aluminium Scaffolding — Admin Panel · July 2026*
