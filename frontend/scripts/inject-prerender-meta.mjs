/**
 * Post-build: write a static HTML file for every indexable URL so crawlers and AI bots
 * that do not run JavaScript get the real title, canonical, hreflang, JSON-LD and page
 * content. Also writes sitemap.xml and a noindex 404.html, then runs SEO guards that
 * fail the build on missing routes, homepage canonicals, keyword gaps or broken links.
 *
 * Head tags carry `data-prerender`; src/main.jsx removes them before React mounts so
 * react-helmet-async (React 19 native hoisting) never produces duplicates.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const indexPath = path.join(distDir, 'index.html')

const MAX_TITLE = 60
const MAX_DESCRIPTION = 160

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html missing — run vite build first')
  process.exit(1)
}

const server = await createServer({
  root: rootDir,
  configFile: path.join(rootDir, 'vite.config.js'),
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
})

let models
let facts
let redirects
try {
  ;({ getAllPageModels: models } = await server.ssrLoadModule('/src/seo/pageRegistry.js'))
  models = models()
  facts = await server.ssrLoadModule('/src/data/businessFacts.js')
  ;({ SERVICE_REDIRECTS: redirects } = await server.ssrLoadModule('/src/seo/redirects.js'))
} finally {
  await server.close()
}

const { SITE_URL, SITE_NAME, LEGAL_NAME, PHONE_PRIMARY, PHONE_PRIMARY_E164, EMAIL_SALES, FULL_ADDRESS, OPENING_HOURS_SUMMARY, ISO_CERT, DEFAULT_OG_IMAGE } = facts

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const jsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c')

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Aluminium scaffold towers', path: '/products/aluminium-scaffolding' },
  { label: 'Mobile scaffolding towers', path: '/services/folding-tower' },
  { label: 'Steel cuplock scaffolding', path: '/products/steel-cuplock-scaffolding' },
  { label: 'Aluminium ladders', path: '/products/ladders' },
  { label: 'Scaffolding rental Abu Dhabi', path: '/scaffolding-rental-abu-dhabi' },
  { label: 'Installation & dismantling', path: '/services/installation' },
  { label: 'About', path: '/about-us' },
  { label: 'Blog', path: '/blog' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact-us' },
  { label: 'العربية', path: '/ar' },
]

const SHELL_CSS = `.prerender-shell{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;line-height:1.6;max-width:960px;margin:0 auto;padding:1rem}.prerender-shell a{color:#1d4ed8}.prerender-shell nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.5rem 1rem;font-size:.9rem}.prerender-shell .qa{border-left:4px solid #2563eb;background:#eff6ff;padding:.75rem 1rem;margin:1rem 0}.prerender-shell footer{border-top:1px solid #e5e7eb;margin-top:2rem;padding-top:1rem;font-size:.9rem}`

const renderLinks = (links = []) =>
  links.length
    ? `<ul>${links.map((l) => `<li><a href="${esc(l.path)}">${esc(l.label)}</a></li>`).join('')}</ul>`
    : ''

const renderSection = (s) =>
  [
    s.h2 ? `<h2>${esc(s.h2)}</h2>` : '',
    ...(s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`),
    s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '',
    renderLinks(s.links),
  ].join('')

const renderBody = (m) => {
  const isAr = m.lang === 'ar'
  const crumbs = m.breadcrumbs?.length
    ? `<nav aria-label="Breadcrumb"><ol>${m.breadcrumbs
        .map((c) => `<li><a href="${esc(c.path)}">${esc(c.name)}</a></li>`)
        .join('')}</ol></nav>`
    : ''
  const faq = m.faq?.length
    ? `<section><h2>${isAr ? 'أسئلة شائعة' : 'Frequently asked questions'}</h2>${m.faq
        .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
        .join('')}</section>`
    : ''
  return `<div class="prerender-shell"${isAr ? ' dir="rtl"' : ''}>
<header><a href="/"><strong>${esc(SITE_NAME)}</strong></a><nav aria-label="Main">${renderLinks(NAV_LINKS)}</nav></header>
<main>${crumbs}
<h1>${esc(m.h1)}</h1>
${m.quickAnswer ? `<p class="qa"><strong>${isAr ? 'إجابة سريعة:' : 'Quick answer:'}</strong> ${esc(m.quickAnswer)}</p>` : ''}
${(m.intro || []).map((p) => `<p>${esc(p)}</p>`).join('')}
${(m.sections || []).map(renderSection).join('\n')}
${faq}
${m.links?.length ? `<section><h2>${isAr ? 'روابط' : 'Related pages'}</h2>${renderLinks(m.links)}</section>` : ''}
<p><a href="/contact-us">Get a free quote</a> · <a href="tel:${esc(PHONE_PRIMARY_E164)}">${esc(PHONE_PRIMARY)}</a></p>
</main>
<footer><p><strong>${esc(LEGAL_NAME)}</strong><br>${esc(FULL_ADDRESS)}<br>Phone / WhatsApp: <a href="tel:${esc(PHONE_PRIMARY_E164)}">${esc(PHONE_PRIMARY)}</a> · Email: <a href="mailto:${esc(EMAIL_SALES)}">${esc(EMAIL_SALES)}</a><br>Hours: ${esc(OPENING_HOURS_SUMMARY)} · ${esc(ISO_CERT.standard)} certified (${esc(ISO_CERT.number)})</p></footer>
</div>`
}

const renderHead = (m, { noindex = false } = {}) => {
  const tags = [
    `<title data-prerender>${esc(m.title)}</title>`,
    `<meta data-prerender name="description" content="${esc(m.description)}" />`,
    noindex ? '' : `<link data-prerender rel="canonical" href="${esc(m.canonicalUrl)}" />`,
    ...(m.alternates || []).map(
      (a) => `<link data-prerender rel="alternate" hreflang="${esc(a.hrefLang)}" href="${esc(a.href)}" />`
    ),
    `<meta data-prerender name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}" />`,
    `<meta data-prerender property="og:type" content="${esc(m.ogType || 'website')}" />`,
    noindex ? '' : `<meta data-prerender property="og:url" content="${esc(m.canonicalUrl)}" />`,
    `<meta data-prerender property="og:title" content="${esc(m.title)}" />`,
    `<meta data-prerender property="og:description" content="${esc(m.description)}" />`,
    `<meta data-prerender property="og:image" content="${esc(DEFAULT_OG_IMAGE)}" />`,
    `<meta data-prerender property="og:image:width" content="1200" />`,
    `<meta data-prerender property="og:image:height" content="630" />`,
    `<meta data-prerender property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta data-prerender property="og:locale" content="${m.lang === 'ar' ? 'ar_AE' : 'en_AE'}" />`,
    `<meta data-prerender name="twitter:card" content="summary_large_image" />`,
    `<meta data-prerender name="twitter:title" content="${esc(m.title)}" />`,
    `<meta data-prerender name="twitter:description" content="${esc(m.description)}" />`,
    `<meta data-prerender name="twitter:image" content="${esc(DEFAULT_OG_IMAGE)}" />`,
    ...(m.schemas || []).map((s) => `<script data-prerender type="application/ld+json">${jsonLd(s)}</script>`),
    // JS browsers get the identical content from React; hiding the static copy avoids a layout shift on swap.
    `<script data-prerender>document.documentElement.classList.add('js')</script>`,
    `<style data-prerender-shell>${SHELL_CSS}.js .prerender-shell{display:none}</style>`,
  ]
  return tags.filter(Boolean).join('\n    ')
}

const baseHtml = fs.readFileSync(indexPath, 'utf8')

const renderPage = (m, opts) =>
  baseHtml
    .replace(/<html[^>]*>/i, `<html lang="${m.lang === 'ar' ? 'ar' : 'en'}" dir="${m.lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace('</head>', `    ${renderHead(m, opts)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${renderBody(m)}</div>`)

// ---------- guards ----------
const errors = []
const warnings = []
const normalize = (s = '') => s.toLowerCase().replace(/aluminum/g, 'aluminium').replace(/\s+/g, ' ')
const modelPaths = new Set(models.map((m) => m.path))
const redirectSources = new Set([
  ...Object.keys(redirects).map((k) => `/services/${k}`),
  '/products',
  '/services',
  '/aluminum-scaffolding-dubai',
  '/alcoa-scaffolding',
  '/blog/scaffolding-rental-cost-dubai-2026',
])

const seen = { title: new Map(), description: new Map(), keyword: new Map() }
for (const m of models) {
  if (!m.title) errors.push(`${m.path}: missing title`)
  if (!m.h1) errors.push(`${m.path}: missing H1`)
  if (!m.description) errors.push(`${m.path}: missing description`)
  if (m.title.length > MAX_TITLE) errors.push(`${m.path}: title ${m.title.length} chars > ${MAX_TITLE} — "${m.title}"`)
  if (m.description.length > MAX_DESCRIPTION)
    errors.push(`${m.path}: description ${m.description.length} chars > ${MAX_DESCRIPTION}`)
  if (m.path !== '/' && m.canonicalUrl === SITE_URL) errors.push(`${m.path}: canonical points to homepage`)

  if (seen.title.has(m.title)) errors.push(`duplicate title "${m.title}" on ${seen.title.get(m.title)} and ${m.path}`)
  seen.title.set(m.title, m.path)
  if (seen.description.has(m.description)) warnings.push(`duplicate description on ${seen.description.get(m.description)} and ${m.path}`)
  seen.description.set(m.description, m.path)

  if (m.primaryKeyword) {
    const kw = normalize(m.primaryKeyword)
    for (const [field, value] of [['title', m.title], ['H1', m.h1], ['description', m.description]]) {
      if (!normalize(value).includes(kw)) errors.push(`${m.path}: primary keyword "${m.primaryKeyword}" missing from ${field}`)
    }
    if (seen.keyword.has(kw)) errors.push(`primary keyword "${m.primaryKeyword}" used by ${seen.keyword.get(kw)} and ${m.path}`)
    seen.keyword.set(kw, m.path)
  }

  if (m.money && (!m.quickAnswer || !m.faq?.length)) errors.push(`${m.path}: money page needs a quick answer and a visible FAQ`)

  const links = [
    ...(m.links || []),
    ...(m.sections || []).flatMap((s) => s.links || []),
    ...(m.breadcrumbs || []).map((c) => ({ path: c.path })),
  ]
  for (const link of links) {
    const target = link.path.split(/[?#]/)[0]
    if (!target.startsWith('/')) continue
    if (redirectSources.has(target)) errors.push(`${m.path}: links to redirecting URL ${target}`)
    else if (!modelPaths.has(target)) errors.push(`${m.path}: broken internal link ${target}`)
  }
}

for (const m of models.filter((x) => x.money && x.primaryKeyword)) {
  const kw = normalize(m.primaryKeyword)
  for (const other of models) {
    if (other.path !== m.path && other.kind !== 'blog' && normalize(other.h1).startsWith(kw)) {
      warnings.push(`H1 of ${other.path} starts with "${m.primaryKeyword}" (primary for ${m.path})`)
    }
  }
}

const appSource = fs.readFileSync(path.join(rootDir, 'src', 'App.jsx'), 'utf8')
for (const match of appSource.matchAll(/<Route path="([^"]+)" element=\{<(\w+)/g)) {
  const [, routePath, element] = match
  if (element === 'Navigate' || routePath.includes(':') || routePath === '*' || routePath === '/404') continue
  if (!modelPaths.has(routePath)) errors.push(`App route ${routePath} has no prerendered page`)
}

const vercel = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'))
const vercelSources = new Set((vercel.redirects || []).map((r) => r.source))
for (const source of redirectSources) {
  if (!vercelSources.has(source)) errors.push(`redirect ${source} missing from vercel.json`)
}

// ---------- write ----------
for (const m of models) {
  const html = renderPage(m, { noindex: m.noindex })
  const file = m.path === '/' ? indexPath : path.join(distDir, m.path.replace(/^\//, ''), 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  const written = fs.readFileSync(file, 'utf8')
  if (!m.noindex && !written.includes(`rel="canonical" href="${esc(m.canonicalUrl)}"`)) errors.push(`${m.path}: canonical not written`)
  if (!written.includes(`<h1>${esc(m.h1)}</h1>`)) errors.push(`${m.path}: H1 not written`)
}

const notFoundModel = {
  path: '/404',
  lang: 'en',
  title: 'Page Not Found | Alcoa Aluminium Scaffolding',
  description: 'The page you requested was not found on alcoascaffolding.com.',
  h1: '404 — Page Not Found',
  intro: ['The page may have moved. Try one of the main pages below.'],
  links: NAV_LINKS,
}
fs.writeFileSync(path.join(distDir, '404.html'), renderPage(notFoundModel, { noindex: true }))
fs.rmSync(path.join(distDir, '404'), { recursive: true, force: true })

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${models
  .filter((m) => !m.noindex)
  .map((m) => `  <url><loc>${esc(m.canonicalUrl === SITE_URL ? `${SITE_URL}/` : m.canonicalUrl)}</loc><lastmod>${m.lastmod || today}</lastmod></url>`)
  .join('\n')}
</urlset>
`
fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap)

warnings.forEach((w) => console.warn('SEO warning:', w))
if (errors.length) {
  errors.forEach((e) => console.error('SEO error:', e))
  console.error(`\nSEO guard failed with ${errors.length} error(s).`)
  process.exit(1)
}
const indexable = models.filter((m) => !m.noindex).length
console.log(
  `Prerendered ${models.length} pages (${indexable} indexable, ${models.length - indexable} noindex) + 404.html + sitemap.xml (${warnings.length} warnings)`
)
