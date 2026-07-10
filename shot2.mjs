import puppeteer from 'puppeteer-core'
const CHROME = '/Users/manuelsanchez/StudioProjects/remotion-video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [url, out, h] = process.argv.slice(2)
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: Number(h) || 880 })
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 2800))
await page.screenshot({ path: out })
await browser.close()
console.log('ok', out)
