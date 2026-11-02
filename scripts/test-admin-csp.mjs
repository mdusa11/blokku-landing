// Prueba del login cifrado con una clave FALSA (nunca la real) y sin códigos de canje:
// compila a una carpeta temporal, abre el panel en Chrome sin red (Supabase con datos falsos de
// panel-fixtures) y revisa que (1) el panel arranca sin violar la CSP, (2) un <img onerror> metido
// con innerHTML NO se ejecuta y (3) dentro de un iframe no se descifra nada.
// Uso: node scripts/test-admin-csp.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { FIX } from './panel-fixtures.mjs';

const dir = mkdtempSync(join(tmpdir(), 'bk-admin-csp-'));
const out = join(dir, 'index.html');
const key = 'prueba-' + randomBytes(12).toString('hex');
execFileSync('node', [fileURLToPath(new URL('./build-admin.mjs', import.meta.url))], {
  env: { ...process.env, ADMIN_KEY: key, ADMIN_OUT: out, CODES_CSV: join(dir, 'no-hay.csv'), PANEL_THUMBS: join(dir, 'no-hay') },
  stdio: ['ignore', 'ignore', 'inherit'],
  maxBuffer: 1 << 28,
});
const page = readFileSync(out, 'utf8');
rmSync(dir, { recursive: true, force: true });
assert.match(page, /http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-/);
assert.ok(!page.includes(key), 'la clave no queda en la página');

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS' };
async function abrir(url, conClave) {
  const pg = await browser.newPage();
  const log = [];
  pg.on('console', (m) => log.push(m.text()));
  pg.on('pageerror', (e) => log.push('pageerror: ' + e.message));
  await pg.setRequestInterception(true);
  pg.on('request', (req) => {
    const u = req.url().split('#')[0];
    if (u === 'http://localhost:9/admin/') return req.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: page });
    if (u === 'http://localhost:9/marco.html') return req.respond({ status: 200, contentType: 'text/html', body: '<iframe id="f" src="/admin/" width="800" height="600"></iframe>' });
    const m = u.match(/\/rest\/v1\/rpc\/([a-z_0-9]+)/);
    if (m && req.method() === 'OPTIONS') return req.respond({ status: 204, headers: cors });
    if (m) {
      let body = {}; try { body = JSON.parse(req.postData() || '{}'); } catch { }
      const res = FIX.rpc(m[1], body);
      if (res && res.__status) return req.respond({ status: res.__status, headers: cors, contentType: 'application/json', body: JSON.stringify(res.body || {}) });
      return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(res === undefined ? [] : res) });
    }
    req.abort();
  });
  if (conClave) await pg.evaluateOnNewDocument((k) => { try { sessionStorage.setItem('bk_k', k); } catch (e) { } }, key);
  await pg.goto(url, { waitUntil: 'load' });
  return { pg, log };
}

let { pg, log } = await abrir('http://localhost:9/admin/', true);
await pg.waitForFunction(() => document.querySelector('#side') && document.querySelector('#side').innerHTML.length > 100, { timeout: 30000 }).catch((e) => { console.error(log.slice(0, 15).join('\n')); throw e; });
await new Promise((s) => setTimeout(s, 1500));
const csp = (l) => l.filter((t) => /Content Security Policy/i.test(t));
const menu = await pg.evaluate(() => [...document.querySelectorAll('[href^="#/"]')].map((a) => a.getAttribute('href').slice(2)));
const rutas = [...new Set([...menu, ...FIX.routes])];
for (const r of rutas) {
  await pg.evaluate((r) => { location.hash = '#/' + r.split('@')[0]; }, r);
  await new Promise((s) => setTimeout(s, 400));
}
assert.deepEqual(csp(log), [], 'el panel no viola la CSP:\n' + [...new Set(csp(log))].join('\n'));
console.log('rutas recorridas sin violar la CSP:', rutas.length);
await pg.evaluate(() => { document.querySelector('#page').insertAdjacentHTML('beforeend', '<img src="x:y" onerror="window.__pwn=1"><a id="jl" href="javascript:window.__pwn=2">x</a>'); });
await new Promise((s) => setTimeout(s, 500));
await pg.evaluate(() => document.getElementById('jl').click());
await new Promise((s) => setTimeout(s, 500));
assert.equal(await pg.evaluate(() => window.__pwn), undefined, 'XSS inyectado no corre');
assert.ok(csp(log).length >= 1, 'la CSP sigue viva después de document.write');
await pg.close();

({ pg, log } = await abrir('http://localhost:9/marco.html', true));
await new Promise((s) => setTimeout(s, 2500));
const f = pg.frames().find((x) => x.url().endsWith('/admin/'));
assert.ok(f, 'hay iframe');
assert.equal(await f.evaluate(() => document.body.textContent.trim()), '', 'en un iframe no se enseña ni descifra nada');
assert.equal(await f.evaluate(() => !!document.querySelector('#side')), false);
await pg.close();
await browser.close();
console.log('admin CSP / marco: pruebas OK');
