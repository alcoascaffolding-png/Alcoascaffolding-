# Verified Business Facts — Alcoa Aluminium Scaffolding

Source of truth in code: `frontend/src/data/businessFacts.js`

## Verified (safe to publish)

| Field | Value | Evidence |
|---|---|---|
| Legal name | ALCOA ALUMINIUM SCAFFOLDING - L.L.C - S.P.C | ISO certificate (`src/assets/certificate.jpg`) |
| Brand | Alcoa Aluminium Scaffolding | Site-wide |
| Street | Ar Rahmah 4 St., Musaffah 37, Al Mantaqah As Sinai'yah 1 Street - Office number 11, 1st Floor | ISO certificate |
| City / Region | Musaffah / Abu Dhabi, AE | Certificate + quotation |
| Phone (primary / WhatsApp) | +971 58 137 5601 | Quotation artwork + site |
| Phone (secondary) | +971 50 926 8038 | Quotation artwork + site |
| Email | sales@alcoascaffolding.com, info@alcoascaffolding.com | Site + quotation |
| Website | https://alcoascaffolding.com | Live site |
| ISO | 9001:2015 #14143790 (QA Certification), Full, expires 26 Apr 2029 | Certificate |
| Scope | Manufacturing, supply, erection, dismantling, rental and maintenance of aluminium/steel scaffolding and ladders | Certificate |
| Instagram | https://www.instagram.com/alcoa_aluminium_scaffolding | Footer |
| Facebook | https://www.facebook.com/share/1BM1JAj1mr/ | Footer |
| Hours (UI) | Mon–Sat 8am–6pm | Consistent UI copy (ops should confirm Friday) |

## Unconfirmed — do not publish as schema facts

Confirm with operations before enabling in schema or hard CTR claims:

- [ ] Exact Google Business Profile lat/long pin
- [ ] Friday reduced hours (previous conflict: 08:00–12:00 vs full day)
- [ ] AED daily/weekly/monthly price tables (AED 35/day etc.)
- [ ] Same-day delivery SLA and cutoff time
- [ ] Aggregate Google rating + review count for `aggregateRating`
- [ ] Founding year (site claims 2008)
- [ ] Staff count, warehouse size, project counts
- [ ] LinkedIn / X official company URLs
- [ ] Approval for “best/top scaffolding company” comparison content

## Policy applied in this implementation

1. Schema **omits** `aggregateRating` and invented `priceRange` / AggregateOffer low–high prices.
2. FAQs and landing copy use **quote-request** language for pricing until a price list is confirmed.
3. “Same-day delivery” softened to delivery from Musaffah 37 / fast dispatch where not confirmed.
4. “Best company” FAQ reframed to capability + ISO certification facts.
5. NAP must stay identical across website, GBP, Bing, Apple Maps, and directories.
