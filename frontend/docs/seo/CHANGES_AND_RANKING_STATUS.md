# All SEO Changes Made + Ranking Status

**Updated:** 14 Sep 2026  
**Site:** https://alcoascaffolding.com

---

## A. What was implemented (code changes)

### Homepage & hero
- Primary keyword shifted to **Aluminium Scaffolding Abu Dhabi**
- New title, meta description, H1, FAQs, LocalBusiness schema
- Internal links to rental, supplier, Musaffah, products

### Keyword cannibalization fixes
- `/services/aluminium-scaffolding` → **301** to `/products/aluminium-scaffolding`
- `/services/safety-inspections` → **301** to `/services/inspections`
- Rental intents split across `/services/rental`, `/scaffolding-rental-abu-dhabi`, `/scaffolding-rental-uae`
- Mobile/stairway SKU titles demoted; hubs kept as primary
- **Products hub** retargeted away from homepage keyword (fix 14 Sep 2026):  
  `/aluminum-scaffolding-abu-dhabi` → “Scaffolding Products UAE” (was competing with homepage)

### New English pages
- `/aluminium-scaffolding-supplier-abu-dhabi`
- `/aluminium-scaffolding-manufacturer-uae`

### Money-page on-page SEO
Titles/H1/meta updated for: rental, Musaffah, UAE, folding-tower, ladders, rolling platform, stairway, cantilever, about, for-sale, aluminium product category

### Arabic SEO
- Upgraded `/ar` hubs
- Added Arabic mirrors for rental AD, Musaffah, UAE, rental service, aluminium products, mobile tower, supplier, manufacturer, ladders
- Hreflang pairs for EN↔AR money pages
- Footer link: العربية

### Technical / GEO-AEO
- Sitemap routes expanded (EN + AR + new pages + blogs)
- Prerender meta injection expanded
- Vercel redirects for consolidations
- GA4 SPA `page_view` + `generate_lead` events
- FAQPage schema on FAQ-enabled pages
- `llms.txt` / `llms-full.txt` cleaned (removed unverified AED prices / #1 claims)
- Docs: SEO report, GSC checklist, GA4 checklist, GEO testing checklist

### Blog
- Added: complete guide aluminium scaffolding Abu Dhabi
- Added: how to choose aluminium scaffold tower

---

## B. Live check (14 Sep 2026)

| Check | Result |
|---|---|
| Homepage live title | `Aluminium Scaffolding Abu Dhabi \| Alcoa UAE` ✅ |
| Supplier page live | 200 OK ✅ |
| Manufacturer page live | Indexed / crawlable ✅ |
| `site:alcoascaffolding.com aluminium scaffolding Abu Dhabi` | Alcoa pages appear ✅ |
| Organic keyword `aluminium scaffolding Abu Dhabi` | Competitive — ACE, Al Faris, directories also rank; Alcoa Musaffah page can appear ✅ |
| Instant homepage #1 for all money keywords | **Not guaranteed / not expected yet** ❌ |

**Conclusion:** SEO is deployed and Google *does* know Alcoa pages. Not ranking #1 for every competitive keyword yet is normal.

---

## C. Why Google may still “not show” you for a keyword

1. **Competitive SERP** — ACE, Al Faris, Shahid, directories compete for the same terms  
2. **Time** — title/content changes need weeks to fully re-rank  
3. **Authority** — reviews, GBP, citations, backlinks matter as much as on-page SEO  
4. **Wrong test method** — must use full Google search (incognito), not only GSC “URL Inspection”  
5. **Self-competition** — products hub was fighting homepage (now fixed — **redeploy required**)

---

## D. What you must do next (ops — not more code)

1. **Redeploy** latest fixes (products hub + llms cleanup + homepage content block for aluminium scaffolding Abu Dhabi)
2. GSC → refetch sitemap  
3. Request indexing once for:
   - `https://alcoascaffolding.com/`
   - `https://alcoascaffolding.com/aluminum-scaffolding-abu-dhabi`
   - supplier + manufacturer URLs  
4. Grow **Google reviews** and keep GBP active weekly  
5. Complete directories (Bing Places, Apple, Yellow Pages) with same NAP — ACE ranks partly because of directory + brand strength  
6. Test with checklist: `docs/seo/SEO_GEO_TESTING_CHECKLIST.md`  
7. Track impressions in GSC Performance (not only “am I #1 today”)

### Reality check for `Aluminium Scaffolding Abu Dhabi`
Incognito top results (ACE, Yellow Pages, Mac24, Mazoon) are stronger/older competitors. On-page SEO is live; **page-1 ranking is not a same-week code fix**. Alcoa pages do appear for Musaffah/supplier/`site:` queries. Keep reviews + citations + wait 4–8 weeks after redeploy.

---

## E. How to verify correctly

Search in Incognito:

1. `site:alcoascaffolding.com` → should list many pages  
2. `Alcoa scaffolding Abu Dhabi` → brand should show  
3. `aluminium scaffolding Musaffah` → Alcoa Musaffah page often appears  
4. `aluminium scaffolding Abu Dhabi` → check if any Alcoa URL is on page 1–5  
5. ChatGPT: `Who supplies aluminium scaffolding in Abu Dhabi?`

If brand + site: work, SEO foundation is live. Money-keyword positions take longer.
