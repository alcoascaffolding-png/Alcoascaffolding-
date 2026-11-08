# SEO & AEO Audit and Testing Guide — alcoascaffolding.com

**Audit date:** 9 Nov 2026
**Business:** ALCOA ALUMINIUM SCAFFOLDING L L C, Ar Rahmah 4 St., Musaffah 37, Abu Dhabi, UAE
**Scope:** Google Search SEO, local SEO, AEO/GEO (ChatGPT, Gemini, Perplexity, Copilot, Google AI Overviews), Google Business Profile, measurement.

---

## 0. Executive summary

> **The November SEO, AEO and homepage work is complete in the codebase, but it is not live.** The live site still serves the September build. None of the improvements below will reach Google or ChatGPT until you commit, push and deploy.

| Question | Answer | Evidence |
|---|---|---|
| Is the code complete? | **Yes**, for everything that can be done in code | Local production build passes: 122 pages, 0 SEO-guard errors, 0 invalid JSON-LD (§2) |
| Is it live on alcoascaffolding.com? | **No** | Live fetch on 9 Nov 2026 (§2.1): new URLs return the homepage title and canonical, `og-default.jpg` and the IndexNow key return the homepage, the sitemap still has 127 old URLs |
| Is it committed to git? | **No** | `git status`: 66 changed/new files uncommitted. Last commit `7654f32` is from 14 Sep 2026 |
| Is the site optimised for Google? | **In code: largely yes.** Live: **no**. The live site still has the critical "homepage canonical on ~95 URLs" bug | §2, §3 |
| Is the site optimised for ChatGPT / AI search? | **In code: yes** (static HTML content, quick answers, FAQs, llms.txt, robots). Live: **no**. AI bots currently see a 2,861-byte shell with almost no text on most pages | §2.1 |
| Mobile speed | **Needs work.** Lighthouse mobile performance 52 (LCP 5.8 s) on the new build; desktop 94 | §3.9 |
| Off-site (GBP, reviews, citations, GSC, GA4 admin) | **Not verified.** I have no access to these accounts | §1.3 |

**Your first action:** commit and deploy (§4, P0), then run the post-deploy checks in §4.1.

---

## Evidence legend

| Label | Meaning |
|---|---|
| ✅ **Verified – live** | Checked on https://alcoascaffolding.com on 9 Nov 2026 |
| ✅ **Verified – local build** | Checked in the production build (`npm run build`, `dist/`) or in a browser on `localhost:4173`. **Not live yet** |
| 🟡 **Partially verified** | Some evidence, but incomplete, or it depends on deployment or account access |
| ⬜ **Not verified** | Needs access I don't have (GSC, GA4, GBP, Bing, live Google/ChatGPT results) |
| ❌ **Failed / missing** | Checked and found missing or broken |

---

## 1. Implementation status report

### 1.1 Plan 1 — SEO, GEO/AEO & GBP (Nov 2026)

| # | Planned item | Code status | Live status | Evidence |
|---|---|---|---|---|
| A1 | Per-route static HTML for every sitemap URL (unique title, canonical, H1, body content for non-JS bots) | ✅ Completed | ❌ Not deployed | Local: 122 pages generated. Static body has 444–590 words on money pages (home 510, mobile tower 458, rental AD 547, cuplock 444, blog 590). Live: `/products/steel-cuplock-scaffolding`, `/scaffolding-rental-kizad` and new blogs return the homepage title and canonical |
| A2 | `routeMeta.js` single source for static-page meta | ✅ Completed | ❌ Not deployed | `src/data/routeMeta.js`, used by pages and prerender |
| A3 | No duplicate head tags after React loads | ✅ Completed (local) | ❌ Not deployed | Browser check on localhost: exactly 1 canonical, 1 title, 1 description per page |
| A4 | Real 404 for unknown URLs | 🟡 Code done | ❌ Live returns 200 | Local: `dist/404.html` with noindex. Live: `/this-page-does-not-exist-xyz` → 200 homepage shell. **Verify after deploy** |
| A5 | Build guards (routes, keywords, lengths, links, redirects, AEO) | ✅ Completed | n/a | Build output: "Prerendered 122 pages + 404.html + sitemap.xml (0 warnings)" |
| B1 | Keyword map applied (title / H1 / meta) to all mapped pages | ✅ Completed | ❌ Not deployed | 39 pages have a primary keyword enforced by the build guard. See `KEYWORD_MAP.md` |
| B2 | Cannibalisation fixes (7 alias URLs → 301) | ✅ Code done | ❌ Live serves aliases as 200 | `vercel.json` has the redirects. Live: `/services/steel-cup-lock-scaffolding` and `/services/folding-mobile-towers` → 200 |
| B3 | Sitemap cleanup + lastmod | ✅ Completed | ❌ Live sitemap old | Local: 122 URLs, no aliases. Live: 127 URLs, including `steel-cup-lock-scaffolding` |
| B4 | Titles ≤ 60 / descriptions ≤ 160, no duplicates | ✅ Completed | ❌ Not deployed | Local audit: 0 long titles, 0 long descriptions, 0 duplicate titles |
| B5 | Broken links and redirect-hop links fixed | ✅ Completed | ❌ Not deployed | Guard checks every generated link: 0 errors |
| B6 | Location wording (one office, service areas; M-40 → Musaffah 37) | ✅ Completed | ❌ Not deployed | Code reviewed |
| B7 | Images: WebP/resized, LCP image eager, 1200×630 OG image | ✅ Completed | ❌ Not deployed | Local: certificate served as WebP (900px). Live `/og-default.jpg` → homepage HTML (file not deployed) |
| B8 | Hub-and-spoke internal links | ✅ Completed | ❌ Not deployed | Homepage, blog "Related pages", service secondary sections |
| C1 | Single `HomeAndConstructionBusiness` entity + WebPage, Service, BreadcrumbList, BlogPosting, visible-only FAQPage; HowTo removed; no fake Product/rating | ✅ Completed | ❌ Not deployed | Local JSON-LD count: WebPage 117, Service 78, BreadcrumbList 105, FAQPage 99, BlogPosting 16, business entity 3, 0 parse errors. Live pages: **0 JSON-LD in raw HTML** |
| D1 | Quick-answer blocks + AEO question map | ✅ Completed for money pages | ❌ Not deployed | 98 of 123 HTML files contain a quick answer. The 25 without one are Arabic (13), projects (7), blog index, safety, branches, the products hub and the 404 page |
| D2 | 8 brief articles (4 expanded + 4 new) + 2 thin posts expanded | ✅ Completed | ❌ Not deployed | Live `/blog/scaffolding-rental-vs-purchase-uae` → homepage shell |
| D3 | Location-specific FAQs | ✅ Completed | ❌ Not deployed | `locationPages.js` |
| D4 | llms.txt / llms-full.txt refresh | ✅ Completed | ❌ Live is old version | Live llms.txt has no cuplock, installation or dismantling pages |
| E1 | WhatsApp / phone / email click tracking sitewide | ✅ Completed | ❌ Not deployed | `src/utils/analytics.js` delegated listener |
| E2 | IndexNow key + `npm run indexnow` | ✅ Code done | ❌ Key file not live | Live `/3a634f…272f.txt` → homepage HTML. **The script will refuse to run until the key file is live** |
| E3 | robots.txt adds OAI-SearchBot, ChatGPT-User | ✅ Completed | ❌ Live is old version | Live robots.txt lacks both |
| F1 | Docs: audit, keyword map, GBP pack, content plan, social plan, monthly report template | ✅ Completed | n/a | `docs/seo/*` (uncommitted) |
| G1 | Validation (build, HTML spot checks, browser) | ✅ Completed locally | ⬜ Post-deploy checks pending | §4.1 has the commands |

### 1.2 Plan 2 — Homepage simplification (Nov 2026)

| Item | Code status | Live status | Evidence |
|---|---|---|---|
| 12 sections → 8 (Hero, Who we are, Products, Services, Service areas, Testimonials, FAQ, Contact) | ✅ Completed | ❌ Not deployed | Browser: 8 `<section>` elements. Content ends about 4,600 px (was much longer) |
| 49-card product grid → 4 category cards (also on location pages) | ✅ Completed | ❌ Not deployed | 4 cards, all images loaded, titles aligned. KIZAD page now about 4,900 px |
| Hero: working CTAs, one trust line, H1 first on mobile | ✅ Completed | ❌ Not deployed | Mobile 390px: H1 at 155px, illustration hidden |
| FAQ 10 → 6 (schema = visible) | ✅ Completed | ❌ Not deployed | FAQPage schema 6 = visible `<details>` 6 |
| Testimonials compact, AED fix | ✅ Completed | ❌ Not deployed | Code reviewed |
| ContactCTA simplified | ✅ Completed | ❌ Not deployed | Code reviewed |
| Certification moved to About page | ✅ Completed | ❌ Not deployed | Certificate WebP loads (900px) on `/about-us` |
| Unused components removed | ✅ Completed | n/a | 5 files deleted, no remaining imports |

### 1.3 Off-site / account tasks (owner actions — I cannot verify these)

| Task | Status | How to verify |
|---|---|---|
| GSC: sitemap resubmitted after deploy | ⬜ Not verified | GSC → Sitemaps → "Last read" date after deploy |
| GSC: Product/Merchant "Validate fix" (Sep issue) | ⬜ Not verified | GSC → Enhancements |
| GSC: Performance export (Queries + Pages CSV) sent for analysis | ❌ Still missing | Only the Page Indexing CSVs were provided |
| GA4: "RIVer Live Browser" hostname cleanup | ⬜ Not verified | `GA4_MEASUREMENT_CHECKLIST.md` Step 0 |
| GA4: key events marked (`generate_lead`, `whatsapp_click`, `phone_click`) | ⬜ Not verified (baseline showed 0 key events) | GA4 → Admin → Key events |
| GA4 ↔ GSC link | ⬜ Not verified | GA4 → Admin → Product links |
| Bing Webmaster Tools import + IndexNow | ⬜ Not done (needs the key file live) | bing.com/webmasters |
| GBP: categories, description, services, products, Q&A, photos, posts | ⬜ Not verified | `GBP_CHECKLIST.md` |
| GBP: review growth (baseline 4 reviews, 4.8★) | ⬜ Not verified | GBP dashboard |
| Citations: Bing Places, Apple Business Connect, UAE directories | ⬜ Not verified | `DIRECTORY_NAP_PACK.md` |
| LinkedIn company URL for `sameAs` | ❌ Missing (URL not supplied) | Send the URL |
| Friday hours confirmation | ❌ Open (`VERIFIED_FACTS.md`) | Confirm with ops |

---

## 2. Evidence: live site vs local build

### 2.1 Live site checks (9 Nov 2026, GPTBot user agent)

| URL | HTTP | Title served | Canonical served | Verdict |
|---|---|---|---|---|
| `/` | 200 | Aluminium Scaffolding Abu Dhabi \| Alcoa UAE | https://alcoascaffolding.com | OK, but no JSON-LD and no quick answer in HTML |
| `/services/folding-tower` | 200 | Mobile Scaffolding Tower Abu Dhabi \| Alcoa (old title) | self | Old version |
| `/products/steel-cuplock-scaffolding` | 200 | **homepage title** | **homepage** | ❌ Critical bug still live |
| `/blog/scaffolding-rental-vs-purchase-uae` | 200 | **homepage title** | **homepage** | ❌ New article not live |
| `/scaffolding-rental-kizad` | 200 | **homepage title** | **homepage** | ❌ Critical bug still live |
| `/ar/scaffolding-rental-musaffah` | 200 | Arabic title | self | Old version, no JSON-LD |
| `/this-page-does-not-exist-xyz` | **200** | homepage | homepage | ❌ Soft-404 risk |
| `/services/steel-cup-lock-scaffolding` | **200** | homepage shell | — | ❌ 301 not live |
| `/og-default.jpg` | 200 (HTML) | — | — | ❌ File not deployed |
| `/sitemap.xml` | 200 | — | — | ❌ 127 old URLs, including redirect aliases |
| `/robots.txt` | 200 | — | — | 🟡 Old: no OAI-SearchBot / ChatGPT-User |
| `/llms.txt` | 200 | — | — | 🟡 Old version |

### 2.2 Local build checks (new code, `dist/`)

| Check | Result |
|---|---|
| Pages generated | 122 + `404.html` |
| Sitemap URLs | 122 (matches pages; no aliases) |
| JSON-LD blocks that fail to parse | 0 |
| Pages without canonical (excluding 404) | 0 |
| Pages without exactly one H1 | 0 |
| Pages missing a meta description | 0 |
| Titles over 60 / descriptions over 160 / duplicate titles | 0 / 0 / 0 |
| Static words on money pages (crawler-visible without JS) | 444–590 |
| Arabic home static words | 169 (thin) |
| Browser after hydration | 1 canonical, 1 title, 1 description, 0 broken images, no horizontal overflow |

---

## 3. SEO & AEO audit checklist

Status refers to the **code / local build**. Every ✅ item also needs a post-deploy re-check (§4.1).

### 3.1 On-page SEO

| Check | Status | Notes |
|---|---|---|
| Unique title per page, ≤ 60 chars | ✅ Verified – local build | Enforced by build guard |
| Primary keyword in title, H1 and meta | ✅ Verified – local build | 39 mapped pages |
| Meta descriptions ≤ 160, unique | ✅ Verified – local build | 0 duplicate-description warnings |
| One H1 per page | ✅ Verified – local build | Static HTML and browser |
| Heading order | 🟡 Partial | Lighthouse: footer uses `<h4>` after `<h2>` (heading-order warning). Low impact |
| Descriptive link text | ❌ Lighthouse flags 4 "Learn more" links | ServiceHighlights cards. Fix in §4 (P2) |
| Image alt text | ✅ Verified – local build | Product, certificate and category images have descriptive alts |
| Thin content | 🟡 Partial | Money pages 444–590 words in static HTML (more after JS). Arabic pages about 170 words; project pages contain sample-style text |
| Claims you chose to keep (15+ yrs, 500+, 4.9/5) | 🟡 Risk accepted | Not in schema. 4.9/5 on site ≠ GBP 4.8 (4 reviews) |

### 3.2 Technical SEO

| Check | Status | Notes |
|---|---|---|
| Canonicals self-referencing | ✅ local / ❌ live | Live still canonicalises about 95 URLs to the homepage |
| XML sitemap complete + lastmod | ✅ local / ❌ live | |
| robots.txt | ✅ local / 🟡 live (old but not harmful) | Query-string URLs blocked on purpose |
| 301 redirects for consolidated URLs | ✅ local / ❌ live | |
| Real 404 status | 🟡 Code done, ❌ live 200 | Depends on Vercel `404.html` handling. Verify after deploy |
| hreflang EN ↔ AR + x-default | ✅ Verified – local build | Arabic pages `lang="ar" dir="rtl"` |
| HTTPS | ✅ Verified – live | |
| Crawlable HTML without JS (AI bots) | ✅ local / ❌ live | Live pages are a 2.6–2.9 KB shell |
| Soft 404s (GSC baseline) | ⬜ Baseline 0 | Re-check after deploy |
| "Discovered/Crawled – not indexed" (baseline 18 + 6) | ⬜ Expected to fall after deploy | GSC Pages report, 2–6 weeks |

### 3.3 Structured data

| Type | Status | Where |
|---|---|---|
| HomeAndConstructionBusiness (LocalBusiness) | ✅ Verified – local build | `/`, `/about-us`, `/contact-us`; one `@id` |
| Organization, WebSite | ✅ Verified – local build | `/` |
| WebPage / AboutPage / ContactPage / CollectionPage | ✅ Verified – local build | All pages |
| BreadcrumbList | ✅ Verified – local build | 105 pages |
| Service | ✅ Verified – local build | Services, products, locations, landings |
| BlogPosting | ✅ Verified – local build | 16 posts |
| FAQPage (visible FAQs only) | ✅ Verified – local build | 99 pages. Google shows FAQ rich results only for authoritative gov/health sites, but the markup still helps parsing |
| Product / Offer / AggregateRating | ✅ Intentionally absent | No verified prices or review data |
| Google Rich Results Test | ⬜ Not verified | Run after deploy (§7.5) |

### 3.4 Internal linking

| Check | Status |
|---|---|
| Homepage → every primary money page | ✅ Verified – local build (cards, chips, Who-we-are links) |
| Blog → 2–3 money pages each | ✅ Verified – local build |
| No broken or redirect-hop links in generated content | ✅ Verified – build guard |
| Navbar / footer use final URLs | ✅ Verified – code |

### 3.5 Local SEO

| Check | Status |
|---|---|
| NAP identical across site, schema, llms.txt | ✅ Verified – local build |
| Location pages with unique FAQs (Abu Dhabi, Musaffah, KIZAD, Yas, Dubai, near-me, UAE) | ✅ Verified – local build |
| No fake branches | ✅ Verified – code (wording fixed) |
| GBP optimisation | ⬜ Not verified (owner) |
| Reviews | ⬜ Not verified (baseline 4) |
| Citations | ⬜ Not verified |

### 3.6 AEO / AI search

| Check | Status |
|---|---|
| Quick answers on money pages and blogs | ✅ Verified – local build (98 pages) |
| Question-style FAQs matching AI prompts | ✅ Verified – local build (`KEYWORD_MAP.md` §4) |
| Content readable without JS | ✅ local / ❌ live |
| robots allows GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended | ✅ local / 🟡 live (OAI-SearchBot, ChatGPT-User missing live) |
| llms.txt / llms-full.txt | ✅ local / 🟡 live old |
| Bing indexing (feeds ChatGPT Search and Copilot) | ⬜ Not verified; IndexNow pending deploy |
| Arabic pages with quick answers | ❌ Missing (13 Arabic pages) |
| AI assistant mentions | ⬜ Not verified (manual tests, §8) |

### 3.7 Social / Open Graph

| Check | Status |
|---|---|
| Unique og:title, og:description, og:url per page | ✅ Verified – local build |
| 1200×630 og:image | ✅ local / ❌ live (file not deployed) |
| `sameAs` Facebook + Instagram | ✅ Verified – code |
| LinkedIn in `sameAs` | ❌ Missing |

### 3.8 Mobile responsiveness

| Check | Status |
|---|---|
| No horizontal overflow at 390px | ✅ Verified – local browser |
| H1 and CTA first on mobile | ✅ Verified – local browser |
| Touch target size | ❌ Lighthouse: testimonial dots (12×12px) too small |
| Mobile homepage length | 🟡 About 9,700 px (cards stack one per row). Acceptable |

### 3.9 Page speed (Lighthouse, local production build, 9 Nov 2026)

| Metric | Mobile | Desktop | Target |
|---|---|---|---|
| Performance score | **52** | 94 | ≥ 80 mobile |
| LCP | **5.8 s** | 1.5 s | ≤ 2.5 s |
| CLS | 0 | 0.003 | ≤ 0.1 ✅ |
| TBT | **740 ms** | 40 ms | ≤ 200 ms |
| FCP | 3.0 s | 0.9 s | ≤ 1.8 s |
| SEO score | 92 | 92 | 100 (link-text) |
| Accessibility | 90 | 90 | ≥ 95 |
| Best practices | 100 | 100 | ✅ |

The main mobile cost is JavaScript execution:
- main bundle about 566 ms
- gtag about 442 ms
- framer-motion about 237 ms
- about 127 KiB of unused JS

Google's PageSpeed API was rate-limited (HTTP 429), so **live field data (CrUX / Core Web Vitals) is not verified**. Check GSC → Core Web Vitals after deploy.

---

## 4. Pending tasks & prioritised roadmap

| Priority | Task | Why it matters | How |
|---|---|---|---|
| **P0 — today** | **Commit, push and deploy** the 66 changed files | Nothing in §1 helps rankings or AI visibility until it is live. The live site still points about 95 URLs' canonical at the homepage | From `frontend/`: `git add -A && git commit -m "SEO/AEO overhaul + homepage redesign" && git push`. Confirm the Vercel deployment succeeds (build runs the SEO guard) |
| **P0** | Run the post-deploy checks (§4.1) | Proves the fix is live: 404 status, redirects, canonicals | Script below |
| **P1 — deploy day** | GSC: resubmit sitemap; inspect and request indexing for about 15 money URLs | Speeds up re-crawl of the corrected canonicals | §5.2 – §5.3 |
| **P1** | `npm run indexnow` + Bing Webmaster import | Bing feeds ChatGPT Search and Copilot | `GA4_MEASUREMENT_CHECKLIST.md` |
| **P1** | GA4: hostname cleanup + mark key events | Baseline shows 0 key events, so leads are unmeasured | `GA4_MEASUREMENT_CHECKLIST.md` Steps 0 and 2 |
| **P1** | Export GSC Performance (Queries + Pages, 3 months) | Needed for position 5–20 and low-CTR optimisation | §5.5 |
| **P2 — this week** | Improve mobile performance (52 → 80+) | Core Web Vitals are a ranking signal; most UAE searches are on mobile | (1) Lazy-load framer-motion or replace hero animations with CSS. (2) Load gtag after interaction or idle (`requestIdleCallback`). (3) Code-split Navbar dropdown data. (4) Add `<link rel="preconnect">` for googletagmanager (already present) and fonts. (5) Re-run Lighthouse |
| **P2** | Replace "Learn more" with descriptive link text (e.g. "Scaffolding rental details") | Lighthouse SEO 92 → 100; clearer anchor text | `ServiceHighlights.jsx` |
| **P2** | Accessibility: WhatsApp button contrast (use `bg-green-600`), testimonial dots ≥ 24px, footer headings `h2`/`h3` | Lighthouse a11y 90 → ~98 | `ContactCTA.jsx`, `Testimonials.jsx`, `Footer.jsx` |
| **P2** | GBP pack applied + weekly posts + review requests | Map Pack visibility depends mainly on GBP and reviews | `GBP_CHECKLIST.md` |
| **P3 — this month** | Arabic pages: add quick answers + more content (currently about 170 words) | AEO for Arabic queries; thin-content risk | `arabicContent.js` + `ArabicPage.jsx` |
| **P3** | Replace sample project pages with real projects (or noindex them) | Current copy ("Opera House", awards) is not credible for E-E-A-T | `ProjectDetails.jsx` |
| **P3** | Citations: Bing Places, Apple Business Connect, Yellow Pages UAE | Entity consistency for Google and AI | `DIRECTORY_NAP_PACK.md` |
| **P3** | Send LinkedIn URL → add to `sameAs` | Entity signals | `businessFacts.js` |
| **P4 — ongoing** | Monthly content refresh, real photos, earned backlinks | Long-term authority | `CONTENT_PLAN_3_MONTHS.md` |

### 4.1 Post-deploy verification script (PowerShell)

Run this after the Vercel deployment finishes. Every line should match the "Expected" comment.

```powershell
$ua=@{ 'User-Agent'='Mozilla/5.0 (compatible; GPTBot/1.2)' }
function Check($u){ try { $r=Invoke-WebRequest $u -UseBasicParsing -Headers $ua -MaximumRedirection 0 -ErrorAction Stop
  $c=$r.Content; "$($r.StatusCode) $u | " + [regex]::Match($c,'<title[^>]*>([^<]*)').Groups[1].Value + " | " + [regex]::Match($c,'rel="canonical" href="([^"]+)"').Groups[1].Value + " | quickAnswer=" + ($c -match 'Quick answer') }
  catch { "$($_.Exception.Response.StatusCode.value__) $u -> $($_.Exception.Response.Headers['Location'])" } }
Check 'https://alcoascaffolding.com/products/steel-cuplock-scaffolding'  # Expected: 200 | Steel Cuplock Scaffolding UAE ... | self canonical | quickAnswer=True
Check 'https://alcoascaffolding.com/scaffolding-rental-kizad'             # Expected: 200 | Scaffolding Rental KIZAD ... | self
Check 'https://alcoascaffolding.com/blog/scaffolding-rental-vs-purchase-uae' # Expected: 200 | Scaffolding Rental vs Purchase ...
Check 'https://alcoascaffolding.com/services/steel-cup-lock-scaffolding' # Expected: 308/301 -> /products/steel-cuplock-scaffolding
Check 'https://alcoascaffolding.com/this-page-does-not-exist-xyz'        # Expected: 404
Check 'https://alcoascaffolding.com/og-default.jpg'                      # Expected: 200 (image)
(Invoke-WebRequest https://alcoascaffolding.com/sitemap.xml -UseBasicParsing).Content -split '<loc>' | Measure-Object | % { "sitemap URLs: $($_.Count - 1)" }  # Expected: 122
```

If the 404 check still returns 200, tell me. Vercel may need an explicit `404.html` route.

---

## 5. Google Search Console setup & monitoring guide

### 5.1 Property verification

1. https://search.google.com/search-console → **Add property**.
2. Recommended: a **Domain property** (`alcoascaffolding.com`). It covers http, https, www and non-www. Verify by adding the TXT record GSC gives you at your DNS provider.
3. Your site already has a URL-prefix verification meta tag (`google-site-verification` in `index.html`). Keep it.
4. Add users: Settings → Users and permissions (give owner access to a second company account).

### 5.2 XML sitemap submission

1. GSC → **Sitemaps** → enter `sitemap.xml` → Submit (resubmit after every major deploy).
2. Expected after deploy: Status **Success**, discovered URLs **122**.
3. If it shows "Couldn't fetch", open https://alcoascaffolding.com/sitemap.xml in a browser. It must be XML, not the homepage.

### 5.3 URL inspection & indexing requests

1. Paste a URL into the top search bar of GSC.
2. **Test live URL**, then **View tested page**:
   - **HTML tab:** confirm the correct `<title>` and `<link rel="canonical">`.
   - **Screenshot:** confirm the page renders.
3. Check that "User-declared canonical" = "Google-selected canonical" = the URL itself.
4. **Request indexing**. The daily quota is about 10–12, so use it once per URL, not daily. Priority URLs after deploy:
   - `/` · `/scaffolding-rental-abu-dhabi` · `/services/rental` · `/aluminium-scaffolding-supplier-abu-dhabi`
   - `/scaffolding-rental-uae` · `/services/folding-tower` · `/products/aluminium-scaffolding` · `/products/steel-cuplock-scaffolding`
   - `/products/ladders` · `/services/installation` · `/services/installation-disassembly` · `/construction-scaffolding-uae`
   - `/scaffolding-rental-musaffah` · `/about-us` · `/scaffolding-rental-dubai`

### 5.4 Page indexing (coverage) report

GSC → **Indexing → Pages**. Baseline (6 Nov 2026): **102 indexed / 73 not indexed**.

| Reason | Baseline | Expected after deploy | Action |
|---|---|---|---|
| Blocked by robots.txt | 36 | Same (intentional `?service=` URLs) | None |
| Discovered – currently not indexed | 18 | Falls over 2–6 weeks | Internal links + sitemap (done); wait |
| Crawled – currently not indexed | 6 | Falls | Content now unique per URL |
| Page with redirect | 10 | Rises temporarily (+7 aliases) | Normal |
| Alternate page with proper canonical | 3 | Falls | Canonical bug fixed |
| Not found (404) | 0 | May appear for old junk URLs | Normal if they are not real pages |
| Soft 404 | 0 | 0 | Investigate if it appears |

Click each reason → **Validate fix** after deploy for "Discovered", "Crawled" and "Alternate canonical".

### 5.5 Search performance

GSC → **Performance → Search results**.

- **Metrics:** turn on all four (Clicks, Impressions, CTR, Position).
- **Date:** compare "Last 28 days" with the previous period. Annotate the deploy date.
- **Queries tab:** track the brief keywords (§6). Filter with *Query contains*.
- **Pages tab:** money URLs should gain impressions.
- **Country:** United Arab Emirates. **Device:** Mobile vs Desktop.
- **Opportunities:**
  - Queries at position 5–20 with ≥ 100 impressions: strengthen the page.
  - CTR below site average (baseline 1.3%): rewrite title and meta.
- **Export:** top-right **Export → CSV** (Queries + Pages), then send it to me.

Baseline (1 Oct – 6 Nov 2026): **194 clicks · 15.3K impressions · 1.3% CTR · position 14.6**.

### 5.6 Core Web Vitals & mobile usability

1. GSC → **Experience → Core Web Vitals**. Mobile and Desktop are reported separately. Data needs enough Chrome traffic; low-traffic sites may show "Not enough data".
2. Fix "Poor" URL groups first. Expected mobile issue: **LCP** (Lighthouse shows 5.8 s; see P2).
3. Use **PageSpeed Insights** (https://pagespeed.web.dev) on the homepage and one service page monthly.
4. GSC's standalone Mobile Usability report was retired. Use Lighthouse/PSI mobile results and the CWV report.

### 5.7 Enhancements / rich results

GSC → **Enhancements**. After deploy expect **Breadcrumbs**. FAQ, Product and Merchant reports may stop showing (no Product markup now; FAQ rich results are limited).

- Old Product/Merchant errors from September: open the report → **Validate fix**. Items should clear as pages are recrawled.

### 5.8 Fixing indexing / crawling issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Google-selected canonical = homepage | Old build still cached / not recrawled | Inspect URL → Request indexing; confirm the live HTML has a self canonical |
| "Crawled – not indexed" persists | Thin or duplicate content | Add unique content and internal links |
| Server error (5xx) | Vercel outage or build failure | Check Vercel deployments |
| Redirect error | Redirect loop | Check `vercel.json` |
| Sitemap URL returns 404 | Route removed | Rebuild; the guard prevents this |
| Pages drop out after deploy | robots or noindex mistake | Inspect URL → check the robots meta and `robots.txt` |

### 5.9 Weekly GSC routine (10 minutes)

- [ ] Performance: clicks / impressions trend vs last week
- [ ] Pages report: new errors?
- [ ] Sitemaps: Success
- [ ] Inspect 1–2 new or changed URLs
- [ ] Note the top 5 queries in the tracker

---

## 6. Keyword research & ranking verification list

There are no invented search volumes here. Use GSC impressions as the real demand signal.

### 6.1 Primary (brief) keywords → target page

| Keyword | Intent | Target page |
|---|---|---|
| aluminium scaffolding Abu Dhabi | Commercial | `/` |
| aluminium scaffolding UAE | Commercial | `/scaffolding-rental-uae` |
| scaffolding company Abu Dhabi | Commercial / brand | `/about-us` |
| scaffolding supplier UAE | Commercial | `/scaffolding-rental-uae` |
| scaffolding rental Abu Dhabi | Transactional | `/scaffolding-rental-abu-dhabi` |
| mobile scaffolding towers UAE | Commercial | `/services/folding-tower` |
| aluminium scaffolding supplier Abu Dhabi | Commercial | `/aluminium-scaffolding-supplier-abu-dhabi` |

### 6.2 Secondary keywords

| Keyword | Target page |
|---|---|
| aluminium ladder supplier UAE | `/products/ladders` |
| steel cuplock scaffolding UAE | `/products/steel-cuplock-scaffolding` |
| scaffolding installation Abu Dhabi | `/services/installation` |
| scaffolding dismantling UAE | `/services/installation-disassembly` |
| industrial scaffolding Abu Dhabi | `/construction-scaffolding-uae` |
| mobile scaffolding rental UAE | `/services/folding-tower` |

### 6.3 Supporting / long-tail

| Keyword | Target page |
|---|---|
| aluminium scaffolding rental Abu Dhabi | `/services/rental` |
| aluminium scaffold tower Abu Dhabi | `/products/aluminium-scaffolding` |
| aluminium scaffolding Musaffah / scaffolding rental Musaffah | `/scaffolding-rental-musaffah` |
| aluminium scaffolding manufacturer UAE | `/aluminium-scaffolding-manufacturer-uae` |
| scaffolding rental Dubai | `/scaffolding-rental-dubai` |
| scaffolding rental KIZAD | `/scaffolding-rental-kizad` |
| scaffolding hire Yas Island | `/scaffolding-hire-yas-island` |
| scaffolding near me Abu Dhabi | `/scaffolding-near-me-uae` + GBP |
| scaffolding for sale UAE | `/scaffolding-for-sale` |
| scaffolding inspection Abu Dhabi | `/scaffolding-inspection-uae` |
| scaffolding manpower supply Abu Dhabi | `/scaffolding-manpower-supply` |
| stairway / cantilever scaffolding Abu Dhabi | `/services/stairway-scaffolding`, `/services/cantilever-scaffolding` |
| aluminium rolling platform Abu Dhabi | `/services/aluminium-rolling-platform` |
| aluminium vs steel scaffolding | `/blog/aluminium-vs-steel-scaffolding-uae` |
| scaffolding rental vs purchase UAE | `/blog/scaffolding-rental-vs-purchase-uae` |
| types of scaffolding UAE | `/blog/types-of-scaffolding-uae-construction` |
| scaffolding safety guidelines UAE | `/blog/uae-scaffolding-safety-regulations` |
| scaffolding rental prices UAE | `/blog/scaffolding-rental-cost-abu-dhabi-2026` |

### 6.4 Arabic

سقالات ألومنيوم أبوظبي · تأجير سقالات أبوظبي · سقالات المصفح · مورد سقالات أبوظبي · مصنع سقالات ألومنيوم الإمارات · سقالات ألومنيوم الإمارات · برج سقالات متحرك أبوظبي · سلالم ألومنيوم أبوظبي

---

## 7. Testing checklist (step by step)

**Test conditions (always the same, so weekly results are comparable):**
- Chrome Incognito / private window, logged out of Google.
- Location: ideally in the UAE. Otherwise use `google.ae` and note that results vary by location.
- Record: date, query, position (organic), URL shown, whether the Map Pack shows Alcoa.
- Note that personal rank checks are snapshots. GSC average position is the reliable trend.

### 7.1 Indexing check (do first after deploy)

1. Search `site:alcoascaffolding.com` and note the result count.
2. Search `site:alcoascaffolding.com/blog` to confirm the new articles are indexed (allow 1–3 weeks).
3. For each URL in §5.3, run GSC URL Inspection. It should show **"URL is on Google"**.

### 7.2 Branded searches (should rank #1 quickly)

| Query | Expected |
|---|---|
| `Alcoa scaffolding` | Homepage #1 + GBP knowledge panel |
| `Alcoa Aluminium Scaffolding Abu Dhabi` | Homepage / About |
| `Alcoa scaffolding Musaffah` | Homepage or Musaffah page + GBP |
| `alcoascaffolding.com` | Homepage |
| `Alcoa scaffolding contact number` | Contact page / GBP showing +971 58 137 5601 |

If branded queries don't rank #1, check GBP and the indexing status first.

### 7.3 Non-branded searches (the real goal)

Search each keyword in §6.1–6.3 and record organic position (pages 1–5), Map Pack presence and the URL shown.

**Correct URL check:** if Google shows a *different* Alcoa page than the target, note it. That's a cannibalisation signal.

### 7.4 Featured snippets / AI Overviews

Search question-style queries such as:
- `how much does scaffolding rental cost in Abu Dhabi`
- `aluminium vs steel scaffolding`
- `rent or buy scaffolding UAE`
- `types of scaffolding used in UAE`
- `who supplies aluminium scaffolding in Abu Dhabi`

Note whether a **featured snippet** or **AI Overview** appears, and whether it cites alcoascaffolding.com. The quick-answer blocks are written to be quotable, but citation is not guaranteed.

### 7.5 Rich results

1. https://search.google.com/test/rich-results → enter `https://alcoascaffolding.com/`.
   - **Expected:** LocalBusiness (HomeAndConstructionBusiness), Organization, Breadcrumb/FAQ detected, **0 errors**.
2. Repeat for `/services/folding-tower` and `/blog/scaffolding-rental-vs-purchase-uae`.
3. https://validator.schema.org on the same URLs → 0 errors. Warnings about optional fields are fine.
4. In Google results, look for **breadcrumb trails** under Alcoa URLs instead of the raw URL.

### 7.6 Local / Maps

1. Search `scaffolding rental Abu Dhabi`, `scaffolding Musaffah` and `scaffolding near me` (from or near Musaffah if possible).
2. Record the Map Pack position (1–3 or not shown).
3. Open Google Maps and search `scaffolding` near Musaffah 37 → note the position.

### 7.7 AI search visibility

1. Use **ChatGPT** (with search enabled), **Gemini**, **Perplexity** and **Microsoft Copilot**.
2. Start a **new chat** each time and **do not mention Alcoa** in discovery questions.
3. Ask the questions in §9. For each, record:
   - Alcoa mentioned (Y/N)?
   - Correct phone and address (Y/N)?
   - alcoascaffolding.com linked or cited (Y/N)?
   - Competitors named.
4. Repeat monthly. Expect weeks to months after deploy before changes show. Bing indexing (IndexNow) helps ChatGPT and Copilot.
5. **Limitations:**
   - Answers vary by user, location, time and model.
   - There is no official ranking data.
   - Many AI visits show as `(direct)` in GA4.

---

## 8. Ready-to-use Google search queries

Copy-paste into Google (Incognito).

```text
site:alcoascaffolding.com
site:alcoascaffolding.com/blog
site:alcoascaffolding.com scaffolding rental
Alcoa scaffolding
Alcoa Aluminium Scaffolding Abu Dhabi
Alcoa scaffolding Musaffah
aluminium scaffolding Abu Dhabi
aluminium scaffolding UAE
scaffolding company Abu Dhabi
scaffolding supplier UAE
scaffolding rental Abu Dhabi
mobile scaffolding towers UAE
mobile scaffolding tower Abu Dhabi
aluminium scaffolding supplier Abu Dhabi
aluminium ladder supplier UAE
steel cuplock scaffolding UAE
cuplock scaffolding Abu Dhabi
scaffolding installation Abu Dhabi
scaffolding dismantling UAE
industrial scaffolding Abu Dhabi
mobile scaffolding rental UAE
aluminium scaffolding rental Abu Dhabi
aluminium scaffold tower Abu Dhabi
aluminium scaffolding Musaffah
scaffolding rental Musaffah
aluminium scaffolding manufacturer UAE
scaffolding rental Dubai
scaffolding rental KIZAD
scaffolding hire Yas Island
scaffolding near me Abu Dhabi
scaffolding for sale UAE
scaffolding inspection Abu Dhabi
scaffolding manpower supply Abu Dhabi
how much does scaffolding rental cost in Abu Dhabi
aluminium vs steel scaffolding
should I rent or buy scaffolding UAE
types of scaffolding used in UAE construction
scaffolding safety guidelines UAE
سقالات ألومنيوم أبوظبي
تأجير سقالات أبوظبي
سقالات المصفح
مورد سقالات أبوظبي
```

---

## 9. Ready-to-use ChatGPT / AI questions

### 9.1 Discovery (don't mention Alcoa)

```text
Who supplies aluminium scaffolding in Abu Dhabi?
Where can I rent aluminium scaffolding in Abu Dhabi?
Which companies rent mobile scaffolding towers in the UAE?
Who is a good scaffolding supplier in Musaffah, Abu Dhabi?
Who supplies steel cuplock scaffolding in the UAE?
Who installs and dismantles scaffolding in Abu Dhabi?
Industrial scaffolding company in Abu Dhabi for plant maintenance?
Who sells aluminium ladders in Abu Dhabi or the UAE?
Is there an aluminium scaffolding manufacturer in the UAE?
Scaffolding rental in Dubai delivered from Abu Dhabi — which companies?
Scaffolding rental near KIZAD Abu Dhabi?
List scaffolding rental companies in Abu Dhabi with a warehouse in Musaffah.
```

### 9.2 Informational (AI answer / citation check)

```text
How much does scaffolding rental cost in Abu Dhabi?
Aluminium vs steel scaffolding — which is better for a UAE project?
Should I rent or buy scaffolding in the UAE?
What are the types of scaffolding used in UAE construction?
What are the scaffolding safety rules on Abu Dhabi construction sites?
What are the benefits of mobile scaffolding towers?
What are the components of cuplock scaffolding?
```

### 9.3 Brand / fact check (AI should get NAP right)

```text
What is Alcoa Aluminium Scaffolding in Abu Dhabi?
What is the address and phone number of Alcoa Aluminium Scaffolding?
Does Alcoa Aluminium Scaffolding have branches in Dubai?
Is Alcoa Aluminium Scaffolding ISO certified?
What is the official website of Alcoa Aluminium Scaffolding UAE?
```

**Correct answers:** Ar Rahmah 4 St., Musaffah 37, Office 11, 1st Floor, Abu Dhabi · +971 58 137 5601 · https://alcoascaffolding.com · ISO 9001:2015 (14143790) · one location (no Dubai branch; delivers UAE-wide).

### 9.4 Arabic

```text
من يورّد سقالات الألومنيوم في أبوظبي؟
أين يمكنني استئجار سقالات في أبوظبي؟
ما عنوان ورقم هاتف شركة ألكوا للسقالات في أبوظبي؟
```

### 9.5 One-message audit prompt (ChatGPT with web search)

```text
Using live web search, check the local search and AI visibility of this UAE business:
ALCOA Aluminium Scaffolding — https://alcoascaffolding.com — Musaffah 37, Abu Dhabi — +971 58 137 5601.
1) For each query, say whether alcoascaffolding.com appears in web results, which URL, and the top 3 competitors:
   aluminium scaffolding Abu Dhabi; scaffolding rental Abu Dhabi; mobile scaffolding towers UAE;
   steel cuplock scaffolding UAE; scaffolding installation Abu Dhabi; aluminium ladder supplier UAE.
2) Answer as a buyer: "Who supplies aluminium scaffolding in Abu Dhabi?" Cite sources.
3) Confirm Alcoa's address, phone and website from public sources and flag any inconsistencies.
4) List 5 actions to improve its Google and AI visibility.
```

---

## 10. Monthly SEO & AEO tracking checklist

**Week 1 (report week)**
- [ ] GSC Performance: clicks, impressions, CTR, position vs last month (§11)
- [ ] GSC Pages: indexed count, "not indexed" reasons
- [ ] GSC Core Web Vitals: any "Poor" URLs?
- [ ] GA4: organic users, key events (form, WhatsApp, phone), AI referrals
- [ ] GBP Performance: views, calls, direction requests, website clicks
- [ ] Manual rank checks (§7.2–7.6) for the 13 brief keywords
- [ ] AI tests (§9.1 + §9.3) in ChatGPT, Gemini, Perplexity, Copilot
- [ ] Fill in the report template (§11.2)

**Every week**
- [ ] 1 GBP post with a real photo
- [ ] Reply to all reviews within 48 h; request reviews from completed jobs
- [ ] GSC quick check (§5.9)

**Every month**
- [ ] Refresh or publish 1–2 articles (`CONTENT_PLAN_3_MONTHS.md`)
- [ ] 3–5 new genuine photos on GBP and the website
- [ ] `npm run build` passes (SEO guard) before each deploy
- [ ] `npm run indexnow` after each deploy
- [ ] Lighthouse mobile on the homepage + 1 service page
- [ ] Rich Results Test on 3 URLs
- [ ] Check citations for NAP consistency (quarterly)

---

## 11. Success metrics & reporting template

### 11.1 Targets (3 and 6 months after deploy)

These are directional goals, not guarantees. Results depend on competition, reviews and time.

| Metric | Baseline (Oct–Nov 2026) | 3-month target | 6-month target |
|---|---|---|---|
| GSC clicks / month | ~160 (194 in 37 days) | +30% | +75% |
| GSC impressions / month | ~12.4K (15.3K in 37 days) | +30% | +60% |
| GSC CTR | 1.3% | ≥ 2.0% | ≥ 2.5% |
| GSC average position | 14.6 | ≤ 12 | ≤ 10 |
| Indexed pages | 102 | ≥ 115 of 122 | ≥ 118 |
| Brief keywords on page 1 (manual) | Not measured | Record baseline after deploy | +5 keywords |
| Branded queries #1 | Not measured | 100% | 100% |
| GA4 key events / month (leads) | 0 recorded | Tracked and > 0 | +50% vs month 3 |
| GBP reviews | 4 (4.8★) | 12+ | 25+ |
| GBP calls + direction requests | Not supplied | Record baseline | +30% |
| AI tools mentioning Alcoa (of 4) for "who supplies aluminium scaffolding in Abu Dhabi" | Not measured | ≥ 1 | ≥ 2 |
| AI referral sessions (GA4) | 4 (chatgpt 2, gemini 2) | ≥ 10 / month | ≥ 25 / month |
| Lighthouse mobile performance | 52 (new build) | ≥ 80 | ≥ 85 |

### 11.2 Monthly report template (copy per month)

```markdown
# SEO/AEO Report — <Month YYYY>
Deploy / major changes this month: <date + what>

## Google Search Console
| Metric | This month | Last month | Change |
|---|---|---|---|
| Clicks | | | |
| Impressions | | | |
| CTR | | | |
| Avg position | | | |
| Indexed pages | | | |
| Not indexed (discovered / crawled) | | | |
| Core Web Vitals poor URLs (mobile) | | | |

Top 5 queries: 1. … 2. … 3. … 4. … 5. …
Top 5 pages: 1. … 2. … 3. … 4. … 5. …

## Keyword spot checks (incognito, google.ae)
| Keyword | Position | URL shown | Map Pack? | Last month |
|---|---|---|---|---|
| aluminium scaffolding Abu Dhabi | | | | |
| scaffolding rental Abu Dhabi | | | | |
| mobile scaffolding towers UAE | | | | |
| steel cuplock scaffolding UAE | | | | |
| scaffolding installation Abu Dhabi | | | | |
| (others from §6) | | | | |

## Google Analytics 4 (hostname = alcoascaffolding.com)
| Metric | This month | Last month |
|---|---|---|
| Active users | | |
| Organic search users | | |
| generate_lead | | |
| whatsapp_click | | |
| phone_click | | |
| AI referrals (chatgpt/gemini/perplexity/copilot) | | |

## Google Business Profile
| Metric | This month | Last month |
|---|---|---|
| Profile views (Search / Maps) | | |
| Website clicks | | |
| Calls | | |
| Direction requests | | |
| New reviews / rating | | |
| Posts / photos added | | |

## AI visibility (new chat, Alcoa not mentioned)
| Question | ChatGPT | Gemini | Perplexity | Copilot |
|---|---|---|---|---|
| Who supplies aluminium scaffolding in Abu Dhabi? | Y/N + cited? | | | |
| Where can I rent scaffolding in Abu Dhabi? | | | | |
| NAP correct when asked about Alcoa? | | | | |

## Technical
- Build SEO guard: pass/fail
- Lighthouse mobile (home / service): __ / __
- Rich Results Test errors: __

## Summary
- Improved:
- Declined (and likely cause):
- Next month's top 3 priorities:
```

---

## 12. Reference files

| File | Use |
|---|---|
| `SEO_AUDIT_2026-11.md` | Detailed November audit and implementation log |
| `KEYWORD_MAP.md` | Every page's primary keyword, title, H1, FAQ count; AEO question map |
| `KEYWORDS_AND_AI_QUESTIONS.txt` | Weekly checklist with your notes |
| `GBP_CHECKLIST.md` | GBP copy, services, products, 12-week posts, reviews |
| `GA4_MEASUREMENT_CHECKLIST.md` | GA4 cleanup, key events, Bing, IndexNow |
| `CONTENT_PLAN_3_MONTHS.md` | Article specs and calendar |
| `MONTHLY_SEO_REPORT_TEMPLATE.md` | Longer report template with baseline |
| `DIRECTORY_NAP_PACK.md` | Citation NAP block |
| `VERIFIED_FACTS.md` | What is safe to publish |
