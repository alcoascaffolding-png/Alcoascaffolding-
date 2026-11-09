# Search Console Performance Analysis — 3 months (8 Aug – 7 Nov 2026)

Source: GSC export (Queries, Pages, Countries, Devices, Chart), Web search.

> **Important:** this period ends **before** the 8–9 Nov 2026 deploy, which fixed about 95 URLs that had been canonicalising to the homepage. Treat these numbers as the **"before" baseline**. Weak positions on pages hit by that bug (products, rental service, contact) are expected to recover over the next 2–6 weeks.

## 1. Headline numbers

| Metric | Value |
|---|---|
| Clicks | 565 |
| Impressions | 39.5K |
| CTR | 1.4% |
| Average position | 16 |
| UAE share | 499 clicks / 35,438 impressions (88% of clicks), position 15.6 |
| Mobile | 218 clicks, position **7.6** |
| Desktop | 346 clicks, position **21.9** |
| Queries visible in export | 98 of 565 clicks (the rest are anonymised by Google) |

Off-target countries (India, US, UK) have about 2,200 impressions and few clicks. Ignore them.

## 2. Pages — what earns traffic

| Page | Clicks | Impr. | CTR | Pos. | Reading |
|---|---|---|---|---|---|
| `/` | 184 | 15,706 | 1.17% | 10.4 | Ranks for most head terms |
| `/blog/scaffolding-rental-cost-abu-dhabi-2026` | 37 | 2,523 | 1.47% | 7.1 | Price-intent traffic |
| `/scaffolding-rental-dubai` | 31 | 5,322 | 0.58% | **31.8** | Biggest impression pool, weak position |
| `/ar` | 23 | 1,173 | 1.96% | 7.0 | Arabic works |
| `/products/ladders` | 21 | 926 | 2.27% | 22.2 | |
| `/ar/scaffolding-rental-abu-dhabi` | 19 | 522 | 3.64% | 5.6 | |
| `/services/prop-jacks` | 19 | 486 | 3.91% | 9.9 | Component pages convert |
| `/blog/industrial-scaffolding-oil-gas-abu-dhabi` | 18 | 614 | 2.93% | 7.4 | |
| `/services/cantilever-scaffolding` | 12 | 831 | 1.44% | 15.9 | |

### Hurt by the old canonical bug (expect recovery after the deploy)

| Page | Impr. | Pos. |
|---|---|---|
| `/services/rental` | 699 | **77.8** |
| `/services/aluminium-scaffolding` (now 308 → product) | 340 | 72.0 |
| `/contact-us` | 368 | 55.2 |
| `/construction-scaffolding-uae` | 169 | 55.0 |
| `/aluminum-scaffolding-abu-dhabi` | 1,685 | 53.9 |
| `/services/installation` | 92 | 52.1 |
| `/products/aluminium-scaffolding` | 1,725 | 41.0 |
| `/services/folding-tower` | 377 | 38.8 |
| `/aluminium-scaffolding-supplier-abu-dhabi` | 421 | 36.8 |
| `/scaffolding-rental-abu-dhabi` | 634 | 32.6 |

## 3. Query themes

| Theme | Queries | Clicks | Impr. | Weighted pos. |
|---|---|---|---|---|
| Rental / hire | 157 | 28 | 3,501 | 22.8 |
| Components (couplers, clamps, jacks, pins, transom…) | 201 | 12 | 2,876 | 18.0 |
| Dubai / Al Quoz / Jebel Ali | 69 | 3 | 2,244 | **32.8** |
| Abu Dhabi | 22 | 28 | 1,640 | 13.5 |
| Ladders | 108 | 5 | 1,232 | 20.8 |
| Mobile / tower / rolling | 76 | 2 | 1,157 | 29.1 |
| Cuplock | 31 | 1 | 497 | 24.5 |
| Price / cost | 41 | 5 | 437 | 10.6 |
| Arabic | 33 | 7 | 377 | 7.2 |
| Musaffah / Mussafah | 4 | 6 | 262 | **2.8** |
| Brand "alcoa…" | 5 | 0 | 43 | ~5 (shares the name with Alcoa Corp.) |

## 4. Quick wins (positions 1–20 with impressions but few clicks)

### 4.1 Already top 3, but low CTR → rewrite title/meta

| Query | Impr. | Pos. | CTR | Page likely shown | Fix |
|---|---|---|---|---|---|
| scaffolding supplier in abu dhabi | 154 | 3.2 | 0.65% | `/` | Put "Supplier" in the homepage title/meta |
| scaffolding rental mussafah | 92 | 3.2 | 0% | `/scaffolding-rental-musaffah` | Put "Rental" in the Musaffah title; add the "Mussafah" spelling in the copy |
| scaffolding supplier in mussafah | 42 | 2.1 | 2.4% | same | same |

### 4.2 Striking distance (positions 4–20)

| Query | Impr. | Pos. | Target page | Fix |
|---|---|---|---|---|
| scaffolding | 2,536 | 10.0 | `/` | Generic; no action beyond authority |
| aluminium scaffolding | 590 | 9.2 | `/`, `/products/aluminium-scaffolding` | Recovery after deploy + internal links (done) |
| cantilever scaffolding | 422 | 8.3 | `/services/cantilever-scaffolding` | Add a "What is cantilever scaffolding?" answer; better meta |
| scaffolding rental abu dhabi | 375 | 18.8 | `/scaffolding-rental-abu-dhabi` | Recovery + reviews / GBP |
| aluminium scaffolding suppliers in uae (+ "…uae", "…in uae", "…companies in uae") | 520 total | 8.7–19 | `/scaffolding-rental-uae` (only 24 impressions — the homepage ranks instead) | Recovery; maybe add "suppliers / companies" phrasing |
| transom scaffolding | 212 | 7.5 | `/services/intermediate-transom` (416 impr, 0 clicks) | Title/meta: "Transom Scaffolding" first |
| single coupler | 208 | 10.0 | `/services/putlog-coupler` | Title: "Putlog (Single) Coupler" |
| mobile scaffolding | 191 | 17.0 | `/services/folding-tower` | Recovery after deploy |
| ladder clamp scaffolding / scaffolding ladder clamp | 221 | 8.0–8.7 | `/services/ladder-clamp` (402 impr) | Component title/meta template |
| scaffolding price in uae / aluminium scaffolding price in uae / rental price dubai | 249 | 8–10 | rental cost blog | Title with "Price"; clearer price-factor table (no invented AED) |
| supply of certified scaffolders / scaffolding manpower supply in abu dhabi | 230 | 8.5–18 | `/scaffolding-manpower-supply` | Add "scaffolders" wording to title/meta |
| scaffolding parts | 120 | 7.5 | products hub / couplers | Add "Scaffolding parts" phrasing to hub meta |
| shuttering clamp, toe board clamp, spigot pin, u head jack, board retaining coupler, universal clamp, lattice beam uae | 50–104 each | 5–15 | component pages | Component title/meta template (see §5) |
| scaffolding rental in al quoz / al quoz | 106 | 8.5–9.3 | `/scaffolding-rental-dubai` | Add an Al Quoz section / FAQ |
| سقاله المونيوم / سقالة المنيوم / سقالات | 177 | 6–7.6 | `/ar` | Add spelling variants (المنيوم) naturally |
| scaffolding erection | 43 | 6.3 | `/services/installation` | Add "erection" in title (already present) — recovery |
| aluminium ladder | 52 | 6.2 | `/products/ladders` | — |

### 4.3 Dubai (the largest gap)

`/scaffolding-rental-dubai` has 5,322 impressions at position 31.8, and Dubai queries overall average position 32.8. Dubai is highly competitive and Alcoa has no Dubai address. Realistic actions:
- Add concrete Dubai delivery content: Al Quoz, Jebel Ali, DIP and DIC, typical delivery windows, and a Dubai-specific FAQ.
- Win Dubai reviews that mention Dubai jobs.
- Don't expect page-1 Dubai rankings without Dubai links and reviews.

## 5. Code changes — applied locally on 9 Nov 2026, NOT deployed yet

All 8 items below are in the codebase and pass the build guard. They are waiting for your deploy. All price figures were also removed from the site, per the owner's decision. Final wording differs slightly from the proposals:
- homepage title `Aluminium Scaffolding Abu Dhabi | Supplier & Rental | Alcoa`
- blog title `Scaffolding Price in UAE 2026: Rental Cost Factors`
- component titles `{Scaffolding} {Component} | Sale & Rent UAE | Alcoa`
- Dubai section covers Al Quoz and Jebel Ali only (DIP was not confirmed as a service area)

1. **Homepage title:** `Aluminium Scaffolding Abu Dhabi | Supplier & Rental | Alcoa` (keeps the primary keyword; adds "Supplier").
2. **Musaffah title:** `Aluminium Scaffolding Musaffah | Rental & Warehouse | Alcoa`, plus "Mussafah" in the copy.
3. **Component page template** for about 40 `/services/*` components:
   - Title pattern: `{Component} for Sale & Rent UAE | Alcoa`.
   - Description: what it is + use + "rent or buy from Musaffah 37".
   - Common alias names in the title where needed (Single Coupler, Transom).
4. **Cantilever page:** short definition answer + FAQ "What is cantilever scaffolding?".
5. **Rental cost blog:** title `Scaffolding Price UAE 2026 | Rental & Purchase Cost Guide`, plus a price-factor table (no invented AED figures).
6. **Manpower page:** title/meta mention "scaffolders".
7. **Dubai page:** Al Quoz, Jebel Ali and DIP section + FAQs.
8. **Arabic home:** add spelling variants (سقالات المنيوم) in the copy and FAQ.

## 6. How to measure the effect

- **When:** compare **28 days after 9 Nov 2026** with the 28 days before (GSC → Performance → Compare).
- **Watch these pages:** `/services/rental`, `/products/aluminium-scaffolding`, `/aluminum-scaffolding-abu-dhabi`, `/scaffolding-rental-abu-dhabi` and `/contact-us` should move from positions 30–78 towards 10–20.
- **Re-export:** the same CSVs in early December and compare with this file.
