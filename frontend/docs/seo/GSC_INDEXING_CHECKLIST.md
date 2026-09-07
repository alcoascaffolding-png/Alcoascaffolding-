# Google Search Console — Indexing Checklist

## After deploy

1. Confirm https://alcoascaffolding.com/robots.txt allows crawling and points to sitemap.
2. Submit / re-fetch https://alcoascaffolding.com/sitemap.xml
3. Remove any non-sitemap URLs incorrectly submitted under Sitemaps (pages are not sitemaps).
4. Request indexing for high-priority URLs (batch over several days):

### English money pages
- `/`
- `/products/aluminium-scaffolding`
- `/services/rental`
- `/scaffolding-rental-abu-dhabi`
- `/scaffolding-rental-musaffah`
- `/scaffolding-rental-uae`
- `/services/folding-tower`
- `/products/ladders`
- `/services/aluminium-rolling-platform`
- `/services/stairway-scaffolding`
- `/services/cantilever-scaffolding`
- `/aluminium-scaffolding-supplier-abu-dhabi`
- `/aluminium-scaffolding-manufacturer-uae`
- `/scaffolding-for-sale`
- `/about-us`
- `/contact-us`

### Arabic money pages
- `/ar`
- `/ar/scaffolding-rental-abu-dhabi`
- `/ar/scaffolding-rental-musaffah`
- `/ar/scaffolding-rental-uae`
- `/ar/services/rental`
- `/ar/products/aluminium-scaffolding`
- `/ar/mobile-scaffolding-tower`
- `/ar/aluminium-scaffolding-supplier-abu-dhabi`
- `/ar/aluminium-scaffolding-manufacturer-uae`
- `/ar/ladders`

### Redirect to verify
- `/services/aluminium-scaffolding` → `/products/aluminium-scaffolding` (301)

## Monitor weekly (first month)

- Soft 404 → target 0
- Crawled / Discovered not indexed on money pages only
- Performance Queries: positions 5–20 for aluminium / rental / Musaffah terms
- Pages report: confirm `/ar/*` impressions over time

## Technical checks

- View source on money URLs: unique title, description, canonical
- Rich Results Test: homepage LocalBusiness; FAQ pages FAQPage
- Link GSC ↔ GA4
