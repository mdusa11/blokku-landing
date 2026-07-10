// Prueba funcional del demo: arrastra la primera pieza al tablero y verifica.
// Nota: page.evaluate/$eval son la API de puppeteer para leer el DOM de NUESTRA
// propia página local (no ejecutan input externo) — uso seguro y estándar.
import puppeteer from 'puppeteer-core'

const CHROME = '/Users/manuelsanchez/StudioProjects/remotion-video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 880 })
await page.goto('http://localhost:4199/', { waitUntil: 'networkidle0' })
await page.evaluate(() => document.querySelector('#demo').scrollIntoView({ block: 'center' }))
await new Promise((r) => setTimeout(r, 2200))

// coords de VIEWPORT (getBoundingClientRect) — las mismas que usa page.mouse
const rect = (sel) => page.evaluate((s) => {
  const r = document.querySelector(s).getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height }
}, sel)

const sb = await rect('.demo-slot')
const bb = await rect('.demo-board')
const cell = bb.w / 8

// dedo destino para anclar en (fila 5, col 3): finger.y = top + (r + alto + 1.6)·cell
const fx = bb.x + 3 * cell + cell
const fy = bb.y + (5 + 2 + 1.6) * cell

await page.mouse.move(sb.x + sb.w / 2, sb.y + sb.h / 2)
await page.mouse.down()
for (let i = 1; i <= 14; i++) {
  await page.mouse.move(sb.x + sb.w / 2 + (fx - sb.x - sb.w / 2) * (i / 14), sb.y + sb.h / 2 + (fy - sb.y - sb.h / 2) * (i / 14))
  await new Promise((r) => setTimeout(r, 28))
}
await page.mouse.up()
await new Promise((r) => setTimeout(r, 700))

const gems = await page.$$eval('.demo-board .demo-gem', (els) => els.length)
const score = await page.$eval('.demo-score-num', (el) => el.textContent)
console.log('gems on board:', gems, '| score:', score)
await page.screenshot({ path: process.argv[2] || 'demo-test.png' })
await browser.close()
console.log(gems > 0 ? 'DEMO OK ✅' : 'DEMO FALLÓ ❌')
