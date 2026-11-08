# SEO & AEO Operations Pack

Website implementation lives in `frontend/src`. These docs cover external platforms (GBP, GSC, GA4, Bing, directories, social) and the keyword/content strategy.

**Start here:** [SEO_AEO_AUDIT_AND_TESTING_GUIDE.md](./SEO_AEO_AUDIT_AND_TESTING_GUIDE.md), the current verified status (live vs code), roadmap, GSC guide, test queries and monthly tracking. The implementation log is in [SEO_AUDIT_2026-11.md](./SEO_AUDIT_2026-11.md).

| File | Purpose |
|---|---|
| [SEO_AUDIT_2026-11.md](./SEO_AUDIT_2026-11.md) | Nov 2026 audit, fixes, validation, next actions |
| [KEYWORD_MAP.md](./KEYWORD_MAP.md) | Keyword → page map (EN + AR), AEO question map, redirects, GSC opportunity table |
| [KEYWORDS_AND_AI_QUESTIONS.txt](./KEYWORDS_AND_AI_QUESTIONS.txt) | Weekly Google + ChatGPT check list and tracker |
| [GBP_CHECKLIST.md](./GBP_CHECKLIST.md) | GBP categories, description, services, products, 12-week posts, photos, reviews, citations |
| [CONTENT_PLAN_3_MONTHS.md](./CONTENT_PLAN_3_MONTHS.md) | 8 brief articles (live) + 3-month promotion/refresh calendar |
| [SOCIAL_MEDIA_PLAN.md](./SOCIAL_MEDIA_PLAN.md) | Instagram / Facebook / LinkedIn cadence, consistency, OG |
| [MONTHLY_SEO_REPORT_TEMPLATE.md](./MONTHLY_SEO_REPORT_TEMPLATE.md) | Monthly GSC / GA4 / GBP / AI report with baseline |
| [GA4_MEASUREMENT_CHECKLIST.md](./GA4_MEASUREMENT_CHECKLIST.md) | GA4 cleanup, key events, AI referrals, Bing + IndexNow |
| [GSC_INDEXING_CHECKLIST.md](./GSC_INDEXING_CHECKLIST.md) | Sitemap + URL inspection after deploy |
| [VERIFIED_FACTS.md](./VERIFIED_FACTS.md) | What is safe to publish vs needs confirmation |
| [DIRECTORY_NAP_PACK.md](./DIRECTORY_NAP_PACK.md) | Identical NAP for Bing, Apple Maps, UAE directories |
| [PRESS_RELEASE_DRAFTS.md](./PRESS_RELEASE_DRAFTS.md) | PR drafts without unverified ratings |
| [MONTHLY_ONGOING_CHECKLIST.md](./MONTHLY_ONGOING_CHECKLIST.md) | Ongoing cadence |

Code sources of truth:

- `src/data/businessFacts.js`: NAP, ISO, social, OG image
- `src/data/routeMeta.js`: static page titles, H1s, quick answers, FAQs
- `src/seo/serviceSeo.js`, `src/seo/productSeo.js`: service and product SEO, FAQs
- `src/data/seoLandingPages.js`, `src/data/locationPages.js`, `src/data/blogPosts.js`, `src/data/arabicContent.js`
- `src/seo/pageRegistry.js`: every indexable URL (feeds prerender + sitemap)
- `src/seo/redirects.js` + `vercel.json`: 301 consolidations
- `src/utils/schemaBuilders.js`: JSON-LD
- `scripts/inject-prerender-meta.mjs`: static HTML, sitemap, 404, SEO guards
- `scripts/indexnow-submit.mjs`: `npm run indexnow` after deploy
