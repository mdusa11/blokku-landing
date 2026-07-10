import puppeteer from 'puppeteer-core'
const CHROME = '/Users/manuelsanchez/StudioProjects/remotion-video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [url, out, full] = process.argv.slice(2)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await p.goto(url, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 2600))
// detectar overflow horizontal
const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
if (full === 'full') {
  await p.evaluate(async () => { const h=document.body.scrollHeight; for(let y=0;y<h;y+=600){window.scrollTo(0,y); await new Promise(r=>setTimeout(r,260))} window.scrollTo(0,0) })
  await new Promise(r => setTimeout(r, 600))
  await p.screenshot({ path: out, fullPage: true })
} else { await p.screenshot({ path: out }) }
await b.close()
console.log(`${out} | scrollW=${ov.sw} clientW=${ov.cw} ${ov.sw>ov.cw?'⚠️ OVERFLOW':'✓ sin overflow'}`)
