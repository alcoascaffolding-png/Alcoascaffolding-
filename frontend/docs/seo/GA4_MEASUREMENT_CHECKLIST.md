# Google Analytics 4 — What To Do Next

Property already on site: **G-ZP0M0V7FRC** (`index.html`)

Website already sends:
- `page_view` on every route (including `/ar`)
- `generate_lead` / `form_submit` / `quote_request` (contact form)
- `whatsapp_click` — floating button **and** every WhatsApp link on the site (delegated listener, Nov 2026)
- `phone_click` — every `tel:` link sitewide
- `email_click` — every `mailto:` link sitewide

Baseline (1 Oct – 6 Nov 2026, from your screenshots): 421 active users, 408 new, 195 google/organic, 6 bing, 2 chatgpt.com, 2 gemini, 19s average engagement, **0 key events**. Zero key events means events were not marked yet — not that nobody called.

---

## Step 0 — Clean the data (do first)

The Pages report shows a page title **"RIVer Live Browser"** (30 views). That is not an Alcoa page — another site or app is sending hits with your Measurement ID.

1. GA4 → Reports → Engagement → Pages and screens → add a secondary dimension **Hostname**.
2. Note every hostname that is not `alcoascaffolding.com` / `www.alcoascaffolding.com`.
3. Admin → Data streams → your web stream → **Configure tag settings → List unwanted referrals** → add those hostnames.
4. Admin → **Data filters** → create an *Internal / developer traffic* filter for your office IP (Admin → Data streams → Configure tag settings → Define internal traffic) and set it to **Active**.
5. For reports, add a comparison/filter `Hostname exactly matches alcoascaffolding.com` until the bad hits stop.

GA4 cannot delete hits that already arrived; these steps stop future noise.

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

## Step 6 — Track AI assistant referrals

GA4 → Reports → Acquisition → Traffic acquisition → dimension **Session source / medium**. Watch for `chatgpt.com`, `gemini.google.com`, `perplexity.ai`, `copilot.microsoft.com`, `bing.com`. Create a saved comparison "AI referrals" with source matching regex `chatgpt|openai|gemini|perplexity|copilot|claude`.

Limitation: AI tools often do not pass a referrer, so some AI-driven visits appear as `(direct)`.

---

## Bing Webmaster Tools + IndexNow (Bing / Copilot / ChatGPT Search)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters) → **Import from Google Search Console** (fastest; verifies automatically).
2. Sitemaps → confirm `https://alcoascaffolding.com/sitemap.xml`.
3. After each production deploy run from `frontend/`: `npm run indexnow` — submits every sitemap URL to IndexNow using the key file `public/3a634fd95cfd98fc57410673e6c4272f.txt`.
4. Bing Webmaster → **IndexNow** report should show submitted URLs within a day.

---

## What GA does NOT do

- Does not make you rank on Google  
- Does not fix GSC Product snippet errors  
- Only measures traffic and leads after people visit  

Use **GSC for ranking/indexing**, **GA4 for traffic + leads**, **GBP for local calls/maps**.
