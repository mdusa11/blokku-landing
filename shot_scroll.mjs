import puppeteer from 'puppeteer-core'
const CHROME='/Users/manuelsanchez/StudioProjects/remotion-video/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const [url,out,y]=process.argv.slice(2)
const b=await puppeteer.launch({executablePath:CHROME,headless:true,args:['--no-sandbox']})
const p=await b.newPage()
await p.setViewport({width:1280,height:860})
await p.goto(url,{waitUntil:'networkidle0'})
await new Promise(r=>setTimeout(r,2400))
await p.evaluate((yy)=>window.scrollTo(0,Number(yy)),y)
await new Promise(r=>setTimeout(r,1600))
await p.screenshot({path:out})
await b.close();console.log('ok',out)
