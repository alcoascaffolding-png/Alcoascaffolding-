# GSC Issues Explained + Fixes (Sep 2026)

## What Google showed

| Report | Issue | Action taken |
|---|---|---|
| Product snippets | 48 invalid — Offer missing `price` | **Fixed in code:** removed incomplete `Offer` (no invented AED prices) |
| Merchant listings | 48 invalid — missing `price` / `image` | **Fixed:** service pages use Service schema; Product Offer removed; image set where Product remains |
| Product warnings | missing aggregateRating / review | **Leave:** do not invent ratings/reviews |
| Indexing — Alternate canonical | 14 pages | **Normal** — preferred URL is indexed; no code change |
| Indexing — Page with redirect | 9 pages | **Normal** — 301s (e.g. aluminium service → products) |
| Indexing — Blocked by robots.txt | 18 pages | **Intentional** — `/?location=` `/?service=` query URLs blocked |
| Indexing — Crawled/Discovered not indexed | 21 | Monitor money pages only; request indexing if important |
| Soft 404 | Passed | Already OK |
| Internal links | Info only | Nav pages naturally get more links — not an error |

## Why we did not add fake prices
Alcoa quotes per project. Adding `price: 0` or invented AED amounts would create false Merchant/Product rich results and violate verified-facts rules.

## After you deploy
1. Deploy frontend
2. GSC → Product snippets → **Validate fix**
3. GSC → Merchant listings → **Validate fix**
4. Wait 1–3 weeks for Google to recrawl
5. Do **not** validate “Blocked by robots.txt” unless you want those filter URLs indexed (you should not)

## Expected result
- Invalid Product/Merchant count should drop toward 0
- You may see “Product not eligible for rich results” without price — that is OK for a quote-based rental business
- Organic ranking still depends on GBP/reviews/time, not Product rich results alone
