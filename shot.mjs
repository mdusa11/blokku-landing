// Captura la landing con Chrome real (espera animaciones de entrada).
import puppeteer from 'puppeteer-core'

const CHROME = '/Users/manuelsanchez/StudioProjects/remotion-video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const OUT = process.argv[2] || 'shot.png'
const FULL = process.argv[3] === 'full'

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 880 })
await page.goto('http://localhost:4199/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3200))
if (FULL) {
  // scroll para disparar los reveals y esperar cada uno
  await page.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 320)) }
    window.scrollTo(0, 0)
  })
  await new Promise((r) => setTimeout(r, 800))
  await page.screenshot({ path: OUT, fullPage: true })
} else {
  await page.screenshot({ path: OUT })
}
await browser.close()
console.log('saved', OUT)
