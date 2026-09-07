# GA4 Measurement Checklist

Property ID (site): `G-ZP0M0V7FRC` (loaded in `index.html`)

## After deploy

1. Open GA4 → Reports → Realtime and visit homepage + one `/ar` page.
2. Confirm SPA navigations fire `page_view` (AnalyticsRouteTracker).
3. Mark as conversions (Admin → Events):
   - `generate_lead`
   - `form_submit`
   - `whatsapp_click`
   - `phone_click`
4. Create an exploration filtered by `page_path` contains `/ar`.
5. Annotate the SEO deploy date in GA4 notes / your spreadsheet.
6. Link GA4 ↔ Google Search Console (GA4 Admin → Product links → Search Console).

## Weekly

- Organic landing pages for money URLs
- Conversion rate on `/contact-us` and WhatsApp
- Compare EN vs AR traffic share
