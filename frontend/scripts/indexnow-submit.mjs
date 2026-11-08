/**
 * Notify IndexNow (Bing, Yandex, Seznam, Naver) of all URLs in the LIVE sitemap.
 * Run after a production deploy: npm run indexnow
 * Optional: pass specific URLs as arguments to submit only those.
 */
const HOST = 'alcoascaffolding.com'
const KEY = '3a634fd95cfd98fc57410673e6c4272f'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

const keyCheck = await fetch(KEY_LOCATION)
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  console.error(`Key file not live at ${KEY_LOCATION} — deploy first.`)
  process.exit(1)
}

let urlList = process.argv.slice(2)
if (!urlList.length) {
  const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
  urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
})

console.log(`IndexNow: submitted ${urlList.length} URLs — HTTP ${response.status} ${response.statusText}`)
if (response.status >= 400) process.exit(1)
