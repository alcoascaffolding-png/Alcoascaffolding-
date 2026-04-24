# Alcoa Scaffolding — Admin Panel (Next.js)

Modern admin panel for Alcoa Aluminium Scaffolding, built with Next.js 16 App Router, shadcn/ui, TanStack Query, NextAuth v5, and MongoDB.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **NextAuth v5** — session-based authentication (Credentials provider, bcrypt)
- **MongoDB + Mongoose** — 15+ models ported from the original Express backend
- **TanStack Query v5** — server state management and data fetching
- **TanStack Table v8** — feature-rich data tables
- **shadcn/ui** — component system (Radix primitives + Tailwind CSS v4)
- **Tailwind CSS v4** — utility-first styling with CSS variable theming
- **next-themes** — light/dark mode with system preference and no FOUC
- **React Hook Form + Zod** — form handling and validation
- **Resend** — transactional email (contact forms + quotation emails with PDF attachment)
- **Twilio** — WhatsApp quotation delivery
- **Playwright Core + @sparticuz/chromium-min** — server-side PDF generation (Vercel-compatible)
- **Vercel Blob** — PDF storage for WhatsApp media URLs
- **Upstash Redis + Ratelimit** — serverless rate limiting on public API endpoints
- **ExcelJS** — server-side Excel export (replaces client-side `xlsx` bundle)

## Pages / Routes

| Route | Feature |
|-------|---------|
| `/login` | Auth (NextAuth Credentials) |
| `/` | Dashboard with Recharts charts and live stats |
| `/contact-messages` | Lead management with status tracking |
| `/customers` | Customer CRM with nested contacts/addresses |
| `/quotations` | Quotation lifecycle (PDF, email, WhatsApp) |
| `/sales-orders` | Sales order management |
| `/sales-invoices` | Invoice tracking |
| `/vendors` | Supplier management |
| `/purchase-orders` | Purchase order management |
| `/purchase-invoices` | Vendor invoice tracking |
| `/products` | Product/equipment catalogue |
| `/stock-adjustments` | Inventory adjustments |
| `/bank-accounts` | Company bank accounts |
| `/receipts` | Customer payment receipts |
| `/payments` | Vendor payment records |

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `/api/auth/[...nextauth]` | NextAuth handlers |
| `/api/dashboard/*` | Dashboard stats and charts data |
| `/api/customers/*` | Customer CRUD + nested contacts/addresses |
| `/api/quotations/*` | Quotation CRUD + PDF + email + WhatsApp |
| `/api/contact-messages/*` | Lead management |
| `/api/email/send-contact` | Public — contact form (rate-limited) |
| `/api/email/send-quote` | Public — quote request (rate-limited) |
| `/api/[resource]/*` | Generic CRUD for all other resources |
| `/api/[resource]/export` | Server-side Excel download |
| `/api/setup/create-admin` | One-time admin seeding (guarded by `SETUP_SECRET`) |
| `/api/health` | Liveness check |

## Getting Started

```bash
# 1. Copy env template
cp .env.local.example .env.local
# 2. Fill in MONGODB_URI and NEXTAUTH_SECRET at minimum for local dev

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Install Playwright Chromium for local PDF generation
npx playwright install chromium

# 5. Seed the first admin user
curl -X POST http://localhost:3000/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: your-setup-secret" \
  -d '{"name":"Admin","email":"admin@alcoascaffolding.com","password":"Admin@1234"}'

# 6. Start dev server
npm run dev
```

## Environment Variables

See `.env.local.example` for a full list. Minimum required for local dev:

```
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

## Deployment (Vercel)

This app lives in a **monorepo**. Vercel must use **`alcoa-admin`** as the project root (not the repo root, not `backend`, not `frontend`).

1. **Vercel → Add New → Project** → import this Git repository.
2. On **Configure Project**, set **Root Directory** to `alcoa-admin` (use “Edit” next to the root path if the wizard hides it; you can type `alcoa-admin`). Framework should detect **Next.js**.
3. If you already have a Vercel project wired to the same repo with the wrong root, open **Settings → General → Root Directory** and change it to `alcoa-admin`, then redeploy.
4. Copy every variable from **`.env.local.example`** into **Vercel → Settings → Environment Variables** (Production and Preview as needed). Set **`NEXTAUTH_URL`** to your real Vercel URL (for example `https://your-app.vercel.app`).
5. Optional for PDFs on Vercel: set `CHROMIUM_TAR_URL` to the `@sparticuz/chromium-min` release tarball URL; install that package if the build expects it.
6. Optional: `BLOB_READ_WRITE_TOKEN` (Vercel Blob), `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (Upstash) for rate limits.

The legacy marketing **Vite** site uses **`frontend/vercel.json`** when that folder is deployed with Root Directory **`frontend`**.

## Migration from the Vite Admin Panel

The `admin-panel/` directory (Vite + React 18 + Redux) has been superseded by this app.
- All API routes from the Express backend are now in `app/api/`
- Redux has been replaced by TanStack Query
- `localStorage` JWT auth has been replaced by NextAuth session cookies
- Client-side PDF (jsPDF) has been replaced by server-side Playwright
- Client-side Excel (xlsx) has been replaced by server-side ExcelJS
