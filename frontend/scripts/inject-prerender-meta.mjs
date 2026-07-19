/**
 * Post-build: write per-route HTML shells with unique title/description/canonical
 * so crawlers see route-specific meta without Puppeteer.
 * Vercel serves these files when present (filesystem before SPA rewrite).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distDir, 'index.html')

const SITE = 'https://alcoascaffolding.com'

const routes = [
  {
    path: '/',
    title: 'Scaffolding Rental Abu Dhabi & Dubai | Alcoa UAE',
    description:
      'Rent or buy aluminium & steel scaffolding across UAE. Serving Abu Dhabi, Musaffah 37, Dubai. ISO 9001:2015. Call Alcoa for a free quote!',
    h1: 'Aluminium Scaffolding Rental in Abu Dhabi, Dubai & UAE',
  },
  {
    path: '/scaffolding-rental-dubai',
    title: 'Scaffolding Rental Dubai | Aluminium & Cuplock | Alcoa',
    description:
      'Scaffolding rental Dubai — aluminium towers, cuplock & ladders delivered from Musaffah 37. Free quote from Alcoa.',
    h1: 'Scaffolding Rental in Dubai, UAE',
  },
  {
    path: '/scaffolding-rental-abu-dhabi',
    title: 'Scaffolding Rental Abu Dhabi | Musaffah 37 | Alcoa UAE',
    description:
      'Scaffolding rental Abu Dhabi — aluminium towers, cuplock & erection crews from Musaffah 37. Free quote from Alcoa.',
    h1: 'Scaffolding Rental in Abu Dhabi, UAE',
  },
  {
    path: '/scaffolding-rental-musaffah',
    title: 'Scaffolding Rental Musaffah 37 | Walk-In Warehouse | Alcoa',
    description:
      'Scaffolding Musaffah 37 — Alcoa walk-in warehouse at Ar Rahmah 4 St. Call +971 58 137 5601.',
    h1: 'Scaffolding Rental Musaffah 37, Abu Dhabi',
  },
  {
    path: '/scaffolding-for-sale',
    title: 'Scaffolding for Sale UAE | Aluminium & Cuplock | Alcoa',
    description:
      'Buy aluminium & steel scaffolding in UAE from Alcoa Musaffah 37. Request a sales quote.',
    h1: 'Scaffolding for Sale in UAE',
  },
  {
    path: '/scaffolding-rental-uae',
    title: 'Scaffolding Rental UAE | All Emirates Coverage | Alcoa',
    description:
      'Scaffolding rental UAE — Abu Dhabi, Dubai, Sharjah, Ajman, Al Ain, RAK & Fujairah. Free quote.',
    h1: 'Scaffolding Rental Across the UAE',
  },
  {
    path: '/faq',
    title: 'Scaffolding FAQ UAE | Prices, Delivery & Hire | Alcoa',
    description:
      'Answers on scaffolding rental cost, delivery, 1-day hire, and how to book Alcoa from Musaffah 37.',
    h1: 'Scaffolding Rental FAQ — Abu Dhabi, Dubai & UAE',
  },
  {
    path: '/scaffolding-inspection-uae',
    title: 'Scaffolding Inspection Abu Dhabi | UAE | Alcoa',
    description:
      'Scaffolding inspection Abu Dhabi — pre-use, periodic & post-alteration checks with written reports.',
    h1: 'Scaffolding Inspection Services in Abu Dhabi & UAE',
  },
  {
    path: '/scaffolding-manpower-supply',
    title: 'Scaffolding Manpower Supply Abu Dhabi | Alcoa UAE',
    description:
      'Scaffolding manpower supply Abu Dhabi — erection & dismantling crews. Request a crew quote.',
    h1: 'Scaffolding Manpower Supply in Abu Dhabi & UAE',
  },
  {
    path: '/about-us',
    title: 'About Alcoa Aluminium Scaffolding | Abu Dhabi UAE',
    description:
      'Alcoa Aluminium Scaffolding LLC — ISO 9001:2015 scaffolding supplier in Musaffah 37, Abu Dhabi.',
    h1: 'About Alcoa Aluminium Scaffolding — Musaffah, Abu Dhabi',
  },
  {
    path: '/contact-us',
    title: 'Contact Alcoa Scaffolding | Abu Dhabi +971 58 137 5601',
    description:
      'Contact Alcoa Scaffolding in Musaffah 37, Abu Dhabi UAE. Call, WhatsApp, or visit our warehouse.',
    h1: 'Contact Alcoa Scaffolding UAE',
  },
  {
    path: '/services/rental',
    title: 'Scaffolding Rental UAE | Daily, Weekly & Monthly | Alcoa',
    description:
      'Flexible scaffolding hire across UAE. Aluminium & steel delivered from Musaffah 37. Free quote.',
    h1: 'Scaffolding Rental Services Across UAE',
  },
  {
    path: '/construction-scaffolding-uae',
    title: 'Construction Scaffolding UAE | Rental & Erection | Alcoa',
    description:
      'Construction scaffolding UAE — rental, installation and delivery from Musaffah 37, Abu Dhabi.',
    h1: 'Construction Scaffolding Services in UAE',
  },
  {
    path: '/aluminum-scaffolding-abu-dhabi',
    title: 'Aluminum Scaffolding Abu Dhabi | Products | Alcoa',
    description:
      'Aluminum scaffolding products in Abu Dhabi — towers, ladders, cuplock and couplers from Alcoa.',
    h1: 'Aluminum Scaffolding Products Abu Dhabi',
  },
]

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function inject(html, route) {
  const canonical = route.path === '/' ? SITE : `${SITE}${route.path}`
  let out = html

  // Remove existing title if present
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${route.title}</title>`)
  if (!/<title>/i.test(out)) {
    out = out.replace('</head>', `<title>${route.title}</title>\n</head>`)
  }

  const metaBlock = `
    <meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${route.title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
  `

  out = out.replace('</head>', `${metaBlock}</head>`)

  const noscript = `
    <noscript>
      <main style="font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem">
        <h1>${route.h1}</h1>
        <p>${route.description}</p>
        <p>Alcoa Aluminium Scaffolding LLC — Musaffah 37, Abu Dhabi, UAE. Call +971 58 137 5601.</p>
        <p><a href="${SITE}/contact-us">Contact us</a> · <a href="${SITE}/faq">FAQ</a></p>
      </main>
    </noscript>
  `
  out = out.replace('<div id="root"></div>', `<div id="root"></div>${noscript}`)

  return out
}

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html missing — run vite build first')
  process.exit(1)
}

const baseHtml = fs.readFileSync(indexPath, 'utf8')

for (const route of routes) {
  const html = inject(baseHtml, route)
  if (route.path === '/') {
    fs.writeFileSync(indexPath, html)
    console.log('updated /')
    continue
  }
  const dir = path.join(distDir, route.path.replace(/^\//, ''))
  ensureDir(dir)
  fs.writeFileSync(path.join(dir, 'index.html'), html)
  console.log('wrote', route.path)
}

// Soft-404 helper page (still SPA-loaded via rewrite for unknown URLs)
const notFound = inject(baseHtml, {
  path: '/404',
  title: 'Page Not Found | Alcoa Aluminium Scaffolding',
  description: 'The page you requested was not found on alcoascaffolding.com.',
  h1: '404 — Page Not Found',
})
ensureDir(path.join(distDir, '404'))
fs.writeFileSync(path.join(distDir, '404', 'index.html'), notFound.replace(
  'name="robots" content="index, follow',
  'name="robots" content="noindex, nofollow'
))

console.log('Prerender meta injection complete:', routes.length, 'routes')
