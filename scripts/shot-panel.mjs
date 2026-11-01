// Capturas del panel SIN clave ni cifrado: arma la página con datos falsos, intercepta
// las llamadas a Supabase y fotografía cada ruta en escritorio (1280) y celular (360).
// Avisa de errores de JS y de desbordes horizontales. Salida: carpeta de $1 (por defecto /tmp/bl-shots).
// Uso: node scripts/shot-panel.mjs [carpeta] [ruta1,ruta2,…]
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import { SEED } from '../admin/seed.js';
import { FIX } from './panel-fixtures.mjs';

const out = process.argv[2] || '/tmp/bl-shots';
const only = process.argv[3] ? process.argv[3].split(',') : null;
mkdirSync(out, { recursive: true });
const P = new URL('../admin/panel/', import.meta.url);
const parts = readdirSync(P).sort();
const css = parts.filter((f) => f.endsWith('.css')).map((f) => readFileSync(new URL(f, P), 'utf8')).join('\n');
const js = parts.filter((f) => f.endsWith('.js')).map((f) => `/* ${f} */\n` + readFileSync(new URL(f, P), 'utf8')).join('\n');
const inject = 'var PREVIEW=true;\nvar SEED_DOC=' + JSON.stringify(SEED) + ';\nvar IMGS={};\nvar MAPA={};\nvar CODES=[];\nvar CAPS={};\nvar V1H={};\n';
const html = readFileSync(new URL('../admin/app.html', import.meta.url), 'utf8')
  .replace('/*STYLE*/', () => css).replace('/*APP*/', () => js).replace('/*INJECT*/', () => inject)
  .replace(/<link[^>]*fonts\.g[^>]*>/g, '');

const routes = (only || FIX.routes);
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'] });
let problems = 0;
for (const [w, h, tag] of [[1280, 900, 'pc'], [360, 780, 'cel']]) {
  for (const r of routes) {
    const pg = await browser.newPage();
    await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    const errs = [];
    pg.on('pageerror', (e) => errs.push(String(e.message)));
    pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    await pg.setRequestInterception(true);
    pg.on('request', (req) => {
      const u = req.url();
      if (u.split('#')[0] === 'http://panel.test/') return req.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: html });
      const m = u.match(/\/rest\/v1\/rpc\/([a-z_0-9]+)/);
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST,OPTIONS' };
      if (m && req.method() === 'OPTIONS') return req.respond({ status: 204, headers: cors });
      if (m) {
        let body = {}; try { body = JSON.parse(req.postData() || '{}'); } catch { }
        const res = FIX.rpc(m[1], body);
        if (res && res.__status) return req.respond({ status: res.__status, headers: cors, contentType: 'application/json', body: JSON.stringify(res.body || {}) });
        return req.respond({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify(res === undefined ? [] : res) });
      }
      if (u.startsWith('http://panel.test')) return req.respond({ status: 404, body: '' });
      req.abort();
    });
    await pg.evaluateOnNewDocument(() => { try { sessionStorage.setItem('bk_k', 'bk-demo'); localStorage.setItem('bk_theme', 'light'); } catch (e) { } });
    const [ruta, tab] = r.split('@');
    await pg.goto('http://panel.test/#/' + ruta, { waitUntil: 'load' });
    await new Promise((s) => setTimeout(s, 1500));
    if (tab) { const [acc, v] = tab.split(':'); await pg.evaluate((acc, v) => { const b = [...document.querySelectorAll(`[data-a="${acc}"]`)].find((x) => x.dataset.v === v || x.dataset.k === v || x.dataset.t === v); if (b) b.click(); }, acc, v); await new Promise((s) => setTimeout(s, 600)); }
    const info = await pg.evaluate(() => {
      const de = document.documentElement, bad = [];
      const vw = de.clientWidth;
      document.querySelectorAll('#page *').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width && b.right > vw + 1 && !el.closest('.tabs,.seg,.tblw,[style*="overflow"],.scroll,.sw,.xs-scroll')) {
          let p = el.parentElement, clipped = false;
          while (p && p.id !== 'page') { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') { clipped = true; break; } p = p.parentElement; }
          if (!clipped && bad.length < 4) bad.push((el.tagName + '.' + (el.className || '').toString().slice(0, 30)) + ' ' + Math.round(b.right));
        }
      });
      return { sw: de.scrollWidth, vw, bad, h1: (document.querySelector('#page h1') || {}).textContent || '', len: ((document.querySelector("#page") || {}).innerText || "").length };
    });
    const f = `${out}/${r.replace(/[\/@:]/g, '_')}-${tag}.png`;
    await pg.screenshot({ path: f, fullPage: true });
    const flags = [];
    if (errs.length) flags.push('JS: ' + [...new Set(errs)].slice(0, 3).join(' | '));
    if (info.sw > info.vw + 1) flags.push(`desborde horizontal ${info.sw}>${info.vw}`);
    if (info.bad.length) flags.push('fuera: ' + info.bad.join(', '));
    if (!info.h1) flags.push('sin título');
    if (flags.length) problems++;
    console.log(`${flags.length ? '✗' : '·'} ${tag} ${r} (${info.len} car) ${flags.join(' ; ')}`);
    await pg.close();
  }
}
await browser.close();
console.log(problems ? `${problems} con avisos; capturas en ${out}` : `sin avisos; capturas en ${out}`);
