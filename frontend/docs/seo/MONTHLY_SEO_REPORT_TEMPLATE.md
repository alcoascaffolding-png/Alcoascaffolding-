# Monthly SEO / GBP / AI Visibility Report — Template

Copy this file per month (e.g. `reports/2026-12.md`). Compare to the previous month and the baseline. Record only numbers taken from the tools. Don't estimate.

## Baseline — 1 Oct to 6 Nov 2026 (from supplied screenshots / CSVs)

| Source | Metric | Baseline |
|---|---|---|
| GSC | Clicks | 194 |
| GSC | Impressions | 15.3K |
| GSC | CTR | 1.3% |
| GSC | Average position | 14.6 |
| GSC | Indexed / not indexed pages | 102 / 73 |
| GSC | Not indexed: robots (intentional) / discovered / crawled / redirect / alt canonical | 36 / 18 / 6 / 10 / 3 |
| GA4 | Active users | 421 |
| GA4 | New users | 408 |
| GA4 | google / organic users | 195 |
| GA4 | bing / organic | 6 |
| GA4 | chatgpt.com / gemini referrals | 2 / 2 |
| GA4 | Avg engagement time per active user | 19s |
| GA4 | Event count | 3.3K |
| GA4 | Key events (leads) | 0 (events not yet marked as key events) |
| GBP | Rating / reviews | 4.8★ / 4 |
| GBP | Monthly profile views | ~2.4k |

Major site change: **SEO release deployed on ____ (date)**. Add this as a GA4 annotation and remember it when comparing months.

---

## Month: ________

### 1. Google Search Console (Performance → Search results, this month vs last month)

| Metric | This month | Last month | Change |
|---|---|---|---|
| Clicks | | | |
| Impressions | | | |
| CTR | | | |
| Average position | | | |
| Indexed pages (Pages report) | | | |
| "Discovered/Crawled – not indexed" | | | |

**Brief keywords**, from Performance → Queries. Filter each query with "contains".

| Query | Clicks | Impr. | CTR | Pos. | Ranking URL | Target URL | OK? |
|---|---|---|---|---|---|---|---|
| aluminium scaffolding abu dhabi | | | | | | `/` | |
| aluminium scaffolding uae | | | | | | `/scaffolding-rental-uae` | |
| scaffolding company abu dhabi | | | | | | `/about-us` | |
| scaffolding supplier uae | | | | | | `/scaffolding-rental-uae` | |
| scaffolding rental abu dhabi | | | | | | `/scaffolding-rental-abu-dhabi` | |
| mobile scaffolding tower(s) | | | | | | `/services/folding-tower` | |
| aluminium scaffolding supplier abu dhabi | | | | | | `/aluminium-scaffolding-supplier-abu-dhabi` | |
| aluminium ladder supplier | | | | | | `/products/ladders` | |
| cuplock scaffolding | | | | | | `/products/steel-cuplock-scaffolding` | |
| scaffolding installation | | | | | | `/services/installation` | |
| scaffolding dismantling | | | | | | `/services/installation-disassembly` | |
| industrial scaffolding abu dhabi | | | | | | `/construction-scaffolding-uae` | |

**Top 10 landing pages** (Pages tab): page, clicks, impressions, CTR, position.

**Opportunities:** queries at positions 5–20 with ≥ 100 impressions, and queries with CTR below the site average.

### 2. Google Analytics 4

| Metric | This month | Last month | Change |
|---|---|---|---|
| Active users | | | |
| New users | | | |
| Organic search users | | | |
| Avg engagement time | | | |
| Event count | | | |
| `generate_lead` (form) | | | |
| `whatsapp_click` | | | |
| `phone_click` | | | |
| `email_click` | | | |
| Total enquiries (sum of key events) | | | |

Filter by `Hostname = alcoascaffolding.com` (see GA4 checklist, Step 0).

### 3. Google Business Profile (Performance tab)

| Metric | This month | Last month | Change |
|---|---|---|---|
| Profile views: Search | | | |
| Profile views: Maps | | | |
| Searches showing the profile (top terms) | | | |
| Website clicks | | | |
| Calls | | | |
| Direction requests | | | |
| Messages / bookings | | | |
| New reviews / average rating | | | |
| Posts published | | | |
| Photos added | | | |

### 4. AI search visibility

| Check | Result |
|---|---|
| GA4 referrals from chatgpt.com / openai | |
| GA4 referrals from gemini.google.com | |
| GA4 referrals from perplexity.ai | |
| GA4 referrals from copilot.microsoft.com / bing.com | |
| GSC → "Generative AI features" report (if available) | |
| Manual prompt test (see `KEYWORDS_AND_AI_QUESTIONS.txt` Part 3): mentioned Alcoa? correct NAP? linked site? | ChatGPT __ / Gemini __ / Perplexity __ / Copilot __ |

**Limitations to note in every report:**
- AI assistants don't publish ranking or impression data.
- Many AI-sourced visits arrive with no referrer and show up as `(direct)`.
- Manual prompt results vary by user, location, time and model version, so treat them as a signal, not a metric.
- Google AI Overviews impressions are counted inside the normal GSC totals and aren't broken out separately everywhere.

### 5. Technical health

| Check | Result |
|---|---|
| `npm run build` SEO guard passes | |
| Sitemap status in GSC = Success | |
| Soft 404 = 0 | |
| New 404s in GSC | |
| Rich Results Test: homepage, one service, one blog | |
| PageSpeed Insights mobile (homepage, one service page): LCP / CLS / INP | |

### 6. Summary & next month's priorities

- What improved:
- What declined, and the likely reason:
- Top 3 priorities next month:
  1.
  2.
  3.
