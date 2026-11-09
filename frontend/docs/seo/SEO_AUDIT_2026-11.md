# SEO, GEO/AEO & GBP Audit and Implementation Report — November 2026

**Site:** https://alcoascaffolding.com · **Business:** ALCOA ALUMINIUM SCAFFOLDING L L C, Musaffah 37, Abu Dhabi
**Data used:** live site fetch (GPTBot user agent), codebase, GSC Page-Indexing CSVs (Critical_issues, Chart, Metadata), GSC Performance and GA4 screenshots (1 Oct – 6 Nov 2026).
**Not available:** GSC Performance query and page CSV exports, and GBP / GA4 / GSC account access. Nothing was changed on Google accounts.

## 1. Baseline

GSC: 194 clicks · 15.3K impressions · 1.3% CTR · position 14.6 · 102 indexed / 73 not indexed.
GA4: 421 active users · 195 google/organic · 6 bing · 2 chatgpt.com · 2 gemini · 19s engagement · 0 key events.
GBP: 4.8★ from 4 reviews · about 2.4k monthly views.

## 2. Findings and status

| # | Priority | Finding | Status |
|---|---|---|---|
| 1 | Critical | About 95 of 127 sitemap URLs served the homepage title and a homepage canonical to crawlers. AI bots saw almost no content. Unknown URLs returned 200. | **Fixed.** All 122 indexable URLs now get static HTML (unique head, JSON-LD, H1, quick answer, sections, FAQ, links). Real `404.html`. Build fails if any route is missing or has a homepage canonical. |
| 2 | Critical | React 19 + react-helmet-async v3 never removes static head tags, so pages had duplicate canonicals and descriptions. | **Fixed.** Prerendered tags are marked `data-prerender` and removed in `main.jsx`. Verified in browser: 1 canonical, 1 title, 1 description. |
| 3 | High | Sitemap listed redirecting URLs and had no lastmod. | **Fixed.** Sitemap is generated from the same page registry (122 URLs, lastmod). |
| 4 | High | 13 pages redefined LocalBusiness `#business` with different names. HowTo was in use. Product pages had FAQ schema with no visible FAQ. Blogs used Article. | **Fixed.** One `HomeAndConstructionBusiness` entity (home, about, contact); other pages reference it by `@id`. WebPage + BreadcrumbList everywhere. Service schema on service, product and location pages. FAQPage only where the FAQ is visible (FAQ added visibly to product pages). BlogPosting. HowTo removed. No Product, Offer or rating schema. |
| 5 | High | Cannibalization: 3 cuplock URLs, 5 mobile-tower alias pairs; Branches and Contact H1s competed with the rental and near-me pages. | **Fixed.** 7 alias URLs 301 to a single page. `cuplock-standard` demoted to a specs page. Branches and Contact H1s rewritten. |
| 6 | High | No pages targeting installation, dismantling, industrial or the brief's UAE keywords. | **Fixed** by retitling existing pages. See `KEYWORD_MAP.md`. |
| 7 | High | Broken links (`/projects/:id`, `/services/installation-setup`) and links that went through redirects. | **Fixed.** The build now fails on broken or redirecting internal links in generated content. |
| 8 | High | Only the floating button tracked WhatsApp clicks. | **Fixed.** A delegated listener tracks every WhatsApp link. `tel:`/`mailto:` were already tracked. |
| 9 | High | Location wording implied branches outside Musaffah ("offices in major cities", "nearest branch"). Blog said "Musaffah M-40". | **Fixed.** Wording changed to one location plus service areas; M-40 changed to Musaffah 37. |
| 10 | Medium | Titles over 60 characters, descriptions over 160. | **Fixed.** The brand suffix is only added when it fits; the build fails on overlength titles or descriptions. |
| 11 | Medium | Thin blog posts (about 140–450 words); 4 brief topics missing. | **Fixed.** 4 articles expanded and 4 new, plus 2 thin posts expanded. Quick answers on every post. |
| 12 | Medium | Location FAQs were templated with the city name swapped. | **Fixed.** Abu Dhabi, Musaffah, KIZAD, Yas Island and near-me each have their own FAQs. |
| 13 | Medium | Large images (certificate 665 KB, clamp 952 KB, service photos up to 1.7 MB source); LCP image lazy-loaded; OG image only 541×321. | **Fixed.** Images now WebP and resized to 900px, with width and height set. Service hero image loads eagerly with `fetchpriority=high`. New 1200×630 OG image built from the real logo. |
| 14 | Medium | Bing / Copilot / ChatGPT Search not addressed. | **Done.** IndexNow key file and `npm run indexnow`; Bing Webmaster steps in `GA4_MEASUREMENT_CHECKLIST.md`. robots.txt allows OAI-SearchBot and ChatGPT-User. |
| 15 | Medium | GA4 receiving foreign hits ("RIVer Live Browser"). | **Documented.** Hostname and unwanted-referral steps added. Requires your GA4 admin. |
| 16 | Low | `sameAs` lists only Facebook and Instagram. | **Open.** Send the confirmed LinkedIn URL. |
| 17 | Kept, per your decision | UI stats (15+ years, 500+ projects, 4.9/5, testimonials). | Unchanged in the UI and **not** added to schema. The 4.9/5 on the site differs from GBP's 4.8 from 4 reviews. **Prices removed (9 Nov 2026):** USD rates on the services hub, AED project values in testimonials and cuplock AED rate bands in the blog are gone; the site shows no price figures. |
| 18 | Note | Project detail pages contain sample-style copy (awards, Opera House reference). | Not changed (out of scope). Recommend replacing with real projects. |

## 3. Implementation summary (code)

- `src/seo/pageRegistry.js`: one registry of every indexable URL, using the same data as the React pages.
- `scripts/inject-prerender-meta.mjs`: writes static HTML, `404.html` and `sitemap.xml`, then runs the route, keyword, AEO, link and redirect guards.
- `src/data/routeMeta.js`, `src/seo/serviceSeo.js`, `src/seo/productSeo.js`: titles, H1s, primary keywords, quick answers and FAQs.
- `src/utils/schemaBuilders.js`: business entity, WebPage, Service, BlogPosting, Breadcrumb and FAQ, plus `buildPageSchemas` shared by `SEOHead` and the prerender.
- `src/components/common/QuickAnswer.jsx`: visible answer block on money pages and posts.
- `src/seo/redirects.js` + `vercel.json`: 301 consolidations; catch-all rewrite removed so unknown URLs return a real 404.
- `src/data/blogPosts.js`: 16 posts, each with an SEO title, description, quick answer and related links.
- `public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, `public/og-default.jpg`, IndexNow key.

## 4. Validation performed

- `npm run build` passes: 122 pages prerendered, 0 guard errors, 0 warnings.
- Static HTML spot-checked (service, blog, Arabic, location, homepage, 404): unique title, self canonical, hreflang on paired pages, `lang="ar" dir="rtl"` on Arabic pages, expected JSON-LD types.
- Browser check after React load (`vite preview`): exactly 1 canonical, 1 title and 1 description; no leftover static shell; JSON-LD types WebPage, Service, BreadcrumbList and FAQPage on the service page.
- Still needed after deploy (manual): Rich Results Test and Schema.org validator on `/`, `/services/folding-tower`, `/blog/scaffolding-rental-vs-purchase-uae`; check that an unknown URL returns HTTP 404 on Vercel; refetch with a GPTBot user agent.

## 5. After deploy — your actions

1. Deploy, then in GSC: Sitemaps → resubmit `sitemap.xml`. URL Inspection → request indexing for the roughly 15 money URLs in `KEYWORD_MAP.md` §1.
2. Run `npm run indexnow` from `frontend/`, and import the site into Bing Webmaster Tools.
3. GA4: complete Step 0 (hostname cleanup), then mark `generate_lead`, `whatsapp_click` and `phone_click` as key events.
4. GBP: apply `GBP_CHECKLIST.md` (categories, description, services, products, posts, photos, review requests).
5. Export GSC Performance (Queries + Pages, 3 months) and send it for the position 5–20 and low-CTR analysis.
6. Fill in `MONTHLY_SEO_REPORT_TEMPLATE.md` in early December.

Ranking and AI-citation outcomes can't be guaranteed. These changes remove the technical blockers and make every page and answer clear; reviews, citations, backlinks and time do the rest.
