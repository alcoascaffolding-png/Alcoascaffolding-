/**
 * One-off: builds public/og-default.jpg (1200x630) from the real company logo.
 * Re-run after changing the logo: node scripts/generate-og-image.mjs
 */
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const WIDTH = 1200
const HEIGHT = 630

const logo = await sharp(path.join(publicDir, 'logo.jpeg'))
  .resize({ width: 760, height: 330, fit: 'inside' })
  .toBuffer()
const { width: logoW, height: logoH } = await sharp(logo).metadata()

const text = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${HEIGHT - 150}" width="${WIDTH}" height="150" fill="#1e3a8a"/>
  <text x="${WIDTH / 2}" y="${HEIGHT - 88}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#ffffff" text-anchor="middle">Aluminium Scaffolding Abu Dhabi &amp; UAE</text>
  <text x="${WIDTH / 2}" y="${HEIGHT - 40}" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#dbeafe" text-anchor="middle">Musaffah 37, Abu Dhabi · +971 58 137 5601 · ISO 9001:2015</text>
</svg>`

await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: '#ffffff' } })
  .composite([
    { input: logo, left: Math.round((WIDTH - logoW) / 2), top: Math.round((HEIGHT - 150 - logoH) / 2) },
    { input: Buffer.from(text), left: 0, top: 0 },
  ])
  .jpeg({ quality: 86 })
  .toFile(path.join(publicDir, 'og-default.jpg'))

console.log('wrote public/og-default.jpg')
