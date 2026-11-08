# Social Media & Brand Visibility Plan — ALCOA

## 1. Consistency rules (all platforms)

| Item | Use exactly |
|---|---|
| Name | Same as Google Business Profile (licence name) |
| Short bio | ISO 9001:2015 aluminium scaffolding supplier in Musaffah 37, Abu Dhabi — mobile towers, cuplock, ladders, rental, installation & dismantling across the UAE. |
| Phone / WhatsApp | +971 58 137 5601 |
| Website | https://alcoascaffolding.com (add `?utm_source=instagram&utm_medium=social` etc. to measure in GA4) |
| Address | Ar Rahmah 4 St., Musaffah 37, Abu Dhabi, UAE |
| Logo / profile image | Same square logo everywhere |
| Cover image | Real warehouse or on-site photo |

Profiles currently linked from the website and schema (`sameAs`): Facebook, Instagram. **LinkedIn:** create or claim the company page, then send me the URL to add it to `SOCIAL` in `src/data/businessFacts.js`. It isn't added yet because the URL is unconfirmed.

## 2. Open Graph / sharing (implemented)

- Every page has a unique `og:title`, `og:description` and `og:url`, both in the static HTML and after React loads.
- Default share image: `public/og-default.jpg` (1200×630), built from the real logo by `scripts/generate-og-image.mjs`.
- Blog posts use `og:type=article`.
- Test before posting: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

## 3. Cadence

| Platform | Frequency | Best content |
|---|---|---|
| Google Business Profile | 1 post / week | See `GBP_CHECKLIST.md` §7 |
| Instagram | 2–3 posts + stories / week | Real site photos, tower assembly reels, warehouse stock |
| Facebook | 2 posts / week | Same as Instagram + blog links |
| LinkedIn | 1–2 posts / week | Project updates, safety tips, ISO/quality, blog articles for contractors & facility managers |

## 4. Content pillars (rotate)

1. **Projects (real only):** site photo + what was supplied, area, scaffold type. Get client permission; no invented values.
2. **Products:** one product per post — towers, cuplock, ladders, rolling platforms.
3. **Safety tips:** short, accurate tips from the safety guide (never move a tower with people on it; fiberglass ladders near electricity).
4. **Behind the scenes:** warehouse, loading, crew at work in PPE.
5. **Education:** carousel versions of the blog articles with a link to the full guide.
6. **Company:** ISO certification, holiday hours, team.

## 5. Post templates

**Instagram project post**
> [Scaffold type] on site in [area] 🏗️ Supplied from our Musaffah 37 warehouse [+ installed by our crew]. Need scaffolding in Abu Dhabi, Dubai or anywhere in the UAE? WhatsApp +971 58 137 5601.
> #AluminiumScaffolding #AbuDhabi #Musaffah #ScaffoldingUAE #MobileScaffoldTower #Cuplock

**LinkedIn article share**
> Renting or buying scaffolding — which costs less? We've written a practical guide for UAE contractors and facility teams: utilisation, hidden ownership costs and a simple comparison method. [link]

## 6. Photo & video guidance

- Use genuine Alcoa photos and videos only. No stock photos presented as Alcoa projects, and no AI-generated "project" images.
- Get client permission before showing identifiable sites or logos.
- Show PPE and correct practice (guardrails fitted, castors locked). Unsafe photos damage trust and can be reported.
- Use landscape for GBP and Facebook, 4:5 for Instagram feed, 9:16 for reels and stories.

## 7. Measurement

GA4: Acquisition → Traffic acquisition → filter source `instagram`, `facebook`, `linkedin`, `l.instagram.com`, `lm.facebook.com`. Record monthly in `MONTHLY_SEO_REPORT_TEMPLATE.md`.
