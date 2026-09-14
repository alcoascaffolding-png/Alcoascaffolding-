# Google Analytics 4 — What To Do Next

Property already on site: **G-ZP0M0V7FRC** (`index.html`)

Website already sends:
- `page_view` on every route (including `/ar`)
- `generate_lead` / `form_submit` (contact form)
- `whatsapp_click`
- `phone_click` / `email_click`

---

## Step 1 — Confirm data is flowing (5 min)

1. Open [Google Analytics](https://analytics.google.com) → property for Alcoa
2. Go to **Reports → Realtime**
3. Open your site in another tab: homepage, then `/products/aluminium-scaffolding`, then `/ar`
4. Confirm you see active users + page views

If Realtime is empty: wrong GA property, ad-blocker, or tag not on live deploy.

---

## Step 2 — Mark conversions (important)

1. GA4 → **Admin** (gear) → **Data display** → **Events**  
   (or Admin → Events)
2. Find these events (after they fire at least once). Toggle **Mark as key event / conversion**:
   - `generate_lead`
   - `form_submit`
   - `whatsapp_click`
   - `phone_click`
3. Optional: also mark `quote_request`

Test by submitting contact form / clicking WhatsApp once, then refresh Events.

---

## Step 3 — Link Search Console

1. GA4 → **Admin** → **Product links** → **Search Console links**
2. Link property `alcoascaffolding.com`
3. After linking, you can see organic queries inside GA4 (Reports → Acquisition → Search Console, if available)

---

## Step 4 — Reports to check weekly

| Report | Path | What to look for |
|---|---|---|
| Realtime | Reports → Realtime | Tracking works |
| Traffic acquisition | Reports → Acquisition → Traffic acquisition | Organic Search growth |
| Landing page | Reports → Engagement → Landing page | Money URLs getting sessions |
| Events | Reports → Engagement → Events | Leads / WhatsApp / calls |
| Key events | Reports → Engagement → Conversions | Quote conversions |

Filter landing pages containing:
- `/products/aluminium-scaffolding`
- `/scaffolding-rental-abu-dhabi`
- `/scaffolding-rental-musaffah`
- `/aluminium-scaffolding-supplier-abu-dhabi`
- `/ar`

---

## Step 5 — Optional useful setup

1. **Annotation:** note deploy date when SEO went live  
2. **Compare periods:** last 28 days vs previous 28 days for Organic Search  
3. **Create a simple exploration:** free-form → dimension `Landing page` + metric `Key events`

---

## What GA does NOT do

- Does not make you rank on Google  
- Does not fix GSC Product snippet errors  
- Only measures traffic and leads after people visit  

Use **GSC for ranking/indexing**, **GA4 for traffic + leads**, **GBP for local calls/maps**.
