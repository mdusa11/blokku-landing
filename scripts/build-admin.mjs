// Genera public/admin/index.html: el panel cifrado con AES-GCM (llave derivada
// de la clave de Manuel con PBKDF2). El repo solo guarda el cifrado; sin la
// clave no se puede leer. No necesita servidor ni secretos en Cloudflare.
// Uso: ADMIN_KEY='bk-…' node scripts/build-admin.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { COSM, VERS, LOGOS } from './admin-images.mjs';
import { webcrypto as crypto, createHash, createHmac } from 'node:crypto';
import { homedir } from 'node:os';
import { SEED } from '../admin/seed.js';

const key = process.env.ADMIN_KEY;
if (!key) { console.error('Falta ADMIN_KEY'); process.exit(1); }

// El panel vive en admin/app.html (estructura) + admin/panel/*.css|*.js (en orden
// por nombre); aquí se juntan en una sola página.
const PDIR = new URL('../admin/panel/', import.meta.url);
const parts = readdirSync(PDIR).sort();
const css = parts.filter((f) => f.endsWith('.css')).map((f) => readFileSync(new URL(f, PDIR), 'utf8')).join('\n');
const js = parts.filter((f) => f.endsWith('.js')).map((f) => `/* ${f} */\n` + readFileSync(new URL(f, PDIR), 'utf8')).join('\n');
let app = readFileSync(new URL('../admin/app.html', import.meta.url), 'utf8')
  .replace('/*STYLE*/', () => css).replace('/*APP*/', () => js);

// Imágenes: se reducen con Pillow a JPEG (~360 px) y van como data URI DENTRO
// del documento cifrado, así no quedan públicas.
const spec = [];
const MAPA = {}; const CAPS = {};
for (const [id, c] of Object.entries(COSM)) {
  if (!existsSync(c.file)) { console.warn('sin render:', id); continue; }
  spec.push({ key: id, file: c.file, crop: c.crop });
  MAPA[id] = { img: id };
  if (c.big) { spec.push({ key: id + '_b', file: c.file, w: 300 }); MAPA[id].big = id + '_b'; }
}
// Miniatura de cada premio pintada por el propio juego (test/panel_thumbs_test.dart
// en blocktetris): es la imagen de la lista; la captura de partida, si la hay,
// queda como imagen grande del detalle.
const THUMBS = process.env.PANEL_THUMBS || `${homedir()}/Desktop/Blokku/02-Documentos/panel-miniaturas`;
let nThumbs = 0;
for (const p of SEED.premios || []) {
  const f = p.cid && `${THUMBS}/${p.cid}.png`;
  if (!f || !existsSync(f)) continue;
  const key = 'th_' + p.cid;
  spec.push({ key, file: f, w: 240, q: 80 });
  const prev = MAPA[p.id];
  MAPA[p.id] = { img: key, big: prev ? prev.big || prev.img : key };
  nThumbs++;
}
console.log('miniaturas de premios:', nThumbs);
for (const [vid, list] of Object.entries(VERS)) {
  CAPS[vid] = [];
  list.forEach((c, i) => {
    if (!existsSync(c.file)) { console.warn('sin captura:', c.file); return; }
    const key = `${vid}_${i}`;
    spec.push({ key, file: c.file, crop: c.crop, w: c.w || 280 });
    CAPS[vid].push({ k: key, l: c.l, g: c.g });
  });
}
for (const [k, c] of Object.entries(LOGOS)) if (existsSync(c.file)) spec.push({ key: k, ...c });
// Logo de la pantalla de acceso (queda FUERA del cifrado: es el ícono público de la app).
if (existsSync(LOGOS.icono.file)) spec.push({ key: 'login_logo', file: LOGOS.icono.file, w: 128, q: 80 });
const py = execFileSync('python3', [fileURLToPath(new URL('./prep-images.py', import.meta.url))], { input: JSON.stringify(spec), maxBuffer: 1 << 28 });
const IMGS = JSON.parse(py.toString());
const LOGIN_LOGO = IMGS.login_logo || ''; delete IMGS.login_logo;
if (LOGIN_LOGO.length > 20000) { console.error('logo de acceso > 20 KB'); process.exit(1); }
console.log('imágenes:', Object.keys(IMGS).length, 'JPEG:', Math.round(Object.values(IMGS).reduce((n, u) => n + u.length, 0) / 1024), 'KB (base64)');
// Códigos de canje: se leen del CSV privado (fuera del repo) y viajan SOLO dentro
// del contenido cifrado. Cada uno lleva su sha256 (h): el documento guarda
// estado y notas por ese hash, nunca el código.
const CSV = process.env.CODES_CSV || `${homedir()}/Desktop/Blokku/04-Seguridad-NO-COMPARTIR/codigos-canje.csv`;
function parseCsv(t) {
  const rows = []; let r = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; r.push(f); f = ''; if (r.length > 1 || r[0]) rows.push(r); r = []; }
    else f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}
const RAR = { common: 'Común', comun: 'Común', rare: 'Raro', raro: 'Raro', epic: 'Épico', epico: 'Épico', legendary: 'Legendario', legendario: 'Legendario', mythic: 'Mítico', mitico: 'Mítico', mitica: 'Mítico' };
let CODES = [];
if (existsSync(CSV)) {
  const [head, ...rest] = parseCsv(readFileSync(CSV, 'utf8'));
  const ix = Object.fromEntries(head.map((h, i) => [h.trim(), i]));
  const norm = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  CODES = rest.filter((r) => r[ix.codigo]).map((r) => {
    const c = r[ix.codigo].trim();
    return { h: createHash('sha256').update(c).digest('hex'), c, i: r[ix.cosmetico_id].trim(), n: r[ix.nombre].trim(), r: RAR[norm(r[ix.rareza])] || r[ix.rareza], t: r[ix.tipo].trim() };
  });
  // Hash con el que la APP reconoce cada código (el que llega a Supabase al canjear).
  const norm2 = (x) => x.toUpperCase().replace(/[\s\-‐‑‒–—−]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  CODES.forEach((c) => { c.a = createHmac('sha256', 'blokku-codes-v2|').update(norm2(c.c)).digest('hex'); });
  console.log('códigos de canje:', CODES.length, '(maestros:', CODES.filter((c) => c.i === '*').length + ')');
} else console.warn('sin CSV de códigos:', CSV);
// Stickers (v1): sha256('blokku-codes-v1|' + código normalizado) → código.
const V1H = {};
for (const c of SEED.cupones || []) {
  const n = c.codigo.toUpperCase().replace(/\s/g, '').replace(/[‐‑‒–—−]/g, '-');
  V1H[createHash('sha256').update('blokku-codes-v1|' + n).digest('hex')] = c.codigo;
}
const inject = 'var SEED_DOC=' + JSON.stringify(SEED) + ';\nvar IMGS=' + JSON.stringify(IMGS) + ';\nvar MAPA=' + JSON.stringify(MAPA) + ';\nvar CODES=' + JSON.stringify(CODES) + ';\nvar CAPS=' + JSON.stringify(CAPS) + ';\nvar V1H=' + JSON.stringify(V1H) + ';\n';
// Vista previa local SIN cifrar (solo fuera del repo): ADMIN_PREVIEW=/ruta/panel.html.
// Solo ella acepta ?sb=http://127.0.0.1:PUERTO para probar contra un Supabase local.
if (process.env.ADMIN_PREVIEW) writeFileSync(process.env.ADMIN_PREVIEW, app.replace('/*INJECT*/', () => 'var PREVIEW=true;\n' + inject));
app = app.replace('/*INJECT*/', () => 'var PREVIEW=false;\n' + inject);

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const ITER = 310000;
const base = await crypto.subtle.importKey('raw', enc.encode(key), 'PBKDF2', false, ['deriveKey']);
const aes = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, enc.encode(app)));
const b64 = (u) => Buffer.from(u).toString('base64');

const logoTag = LOGIN_LOGO ? `<img class="lg" alt="" width="64" height="64" src="${LOGIN_LOGO}">` : '<span class="lg"></span>';
const page = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><meta name="color-scheme" content="dark"><meta name="theme-color" content="#0b0d16"><title>Blokku HQ</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
html{background:#0b0d16}
body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px;color:#eef0fa;font:15px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;
background:radial-gradient(900px 520px at 12% -8%,rgba(91,76,240,.30),transparent 60%),radial-gradient(800px 520px at 100% 108%,rgba(230,74,160,.22),transparent 60%),#0b0d16}
.card{width:100%;max-width:392px;background:rgba(18,21,34,.86);border:1px solid #232841;border-radius:22px;padding:34px 28px 26px;box-shadow:0 24px 70px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.4);backdrop-filter:blur(8px);position:relative;overflow:hidden}
.card::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(135deg,#5b4cf0 0%,#8a4be8 55%,#e64aa0 100%)}
.hd{text-align:center;margin-bottom:26px}
.lg{display:block;width:64px;height:64px;margin:0 auto 14px;border-radius:16px;box-shadow:0 8px 24px rgba(91,76,240,.4);background:linear-gradient(135deg,#5b4cf0,#e64aa0)}
h1{margin:0;font-size:25px;font-weight:800;letter-spacing:-.02em}
h1 em{font-style:normal;background:linear-gradient(135deg,#8b7fff 0%,#e64aa0 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin:4px 0 0;color:#959cb6;font-size:14px}
label.f{display:block;font-size:13px;font-weight:600;color:#c3c8dc;margin-bottom:6px}
.pw{position:relative}
input.in{width:100%;height:48px;padding:0 48px 0 14px;border-radius:12px;border:1px solid #2f3553;background:#0e111c;color:#eef0fa;font:inherit;font-size:16px;outline:0;transition:border-color .15s,box-shadow .15s}
input.in::placeholder{color:#6b7290}
input.in:focus{border-color:#8b7fff;box-shadow:0 0 0 3px rgba(139,127,255,.35)}
.eye{position:absolute;right:4px;top:4px;width:40px;height:40px;border:0;border-radius:9px;background:none;color:#959cb6;cursor:pointer;display:grid;place-items:center}
.eye:hover{color:#eef0fa;background:#1a1e31}.eye:focus-visible{outline:2px solid #8b7fff}
.eye svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rem{display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;cursor:pointer;font-size:14px;color:#c3c8dc}
.rem input{appearance:none;-webkit-appearance:none;flex:none;width:20px;height:20px;margin:1px 0 0;border-radius:6px;border:1.5px solid #3a4163;background:#0e111c;cursor:pointer;display:grid;place-items:center;transition:all .15s}
.rem input:checked{background:linear-gradient(135deg,#5b4cf0,#8a4be8);border-color:#8b7fff}
.rem input:checked::after{content:"";width:9px;height:5px;border:2px solid #fff;border-top:0;border-right:0;transform:rotate(-45deg) translate(1px,-1px)}
.rem input:focus-visible{outline:2px solid #8b7fff;outline-offset:2px}
.rem small{display:block;color:#6b7290;font-size:12.5px;margin-top:1px}
.go{width:100%;height:50px;margin-top:20px;border:0;border-radius:12px;font:inherit;font-size:16px;font-weight:700;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#5b4cf0 0%,#8a4be8 55%,#e64aa0 100%);box-shadow:0 8px 22px rgba(91,76,240,.4);transition:transform .12s,box-shadow .15s,opacity .15s}
.go:hover:not(:disabled){box-shadow:0 10px 28px rgba(138,75,232,.5);transform:translateY(-1px)}
.go:active:not(:disabled){transform:none}
.go:focus-visible{outline:2px solid #fff;outline-offset:2px}
.go:disabled{cursor:progress;opacity:.85}
.sp{display:none;width:18px;height:18px;border-radius:50%;border:2.5px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .7s linear infinite}
.busy .sp{display:block}
#e{min-height:22px;margin-top:12px;text-align:center;font-size:14px;font-weight:600;color:#f87171}
.shake{animation:shake .45s cubic-bezier(.36,.07,.19,.97)}
@keyframes shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}
@keyframes spin{to{transform:rotate(360deg)}}
.ft{margin-top:6px;text-align:center;color:#6b7290;font-size:12.5px}
.u{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none}
@media (prefers-reduced-motion:reduce){.shake{animation:none}.sp{animation:none;border-top-color:#fff;opacity:.7}}
@media (max-width:420px){.card{padding:28px 20px 22px;border-radius:20px}}
</style></head>
<body><main class="card" id="c">
<div class="hd">${logoTag}<h1>Blokku <em>HQ</em></h1><p class="sub">Panel privado de Manuel</p></div>
<form id="f" autocomplete="on" novalidate>
<input class="u" type="text" name="username" id="un" autocomplete="username" value="Blokku HQ" tabindex="-1" aria-hidden="true" readonly>
<label class="f" for="k">Clave de acceso</label>
<div class="pw"><input class="in" id="k" name="password" type="password" autocomplete="current-password" placeholder="Tu clave" autofocus required autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
<button type="button" class="eye" id="t" aria-label="Mostrar clave" aria-pressed="false"><svg id="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>
<label class="rem"><input type="checkbox" id="r"><span>Recordar en este dispositivo (30 días)<small>Solo en tus dispositivos personales</small></span></label>
<button class="go" id="b" type="submit"><span class="sp" aria-hidden="true"></span><span id="bt">Entrar</span></button>
<div id="e" role="alert" aria-live="assertive"></div>
</form>
<div class="ft">Acceso cifrado · solo para Manuel</div>
</main>
<script>
var D={s:"${b64(salt)}",i:"${b64(iv)}",c:"${b64(ct)}",n:${ITER}};
var EYE="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z",EYEOFF="M17.94 17.94A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22";
var $=function(i){return document.getElementById(i)};
function u(b){return Uint8Array.from(atob(b),function(c){return c.charCodeAt(0)})}
function dec(k){var e=new TextEncoder();return crypto.subtle.importKey('raw',e.encode(k),'PBKDF2',false,['deriveKey']).then(function(b){
return crypto.subtle.deriveKey({name:'PBKDF2',salt:u(D.s),iterations:D.n,hash:'SHA-256'},b,{name:'AES-GCM',length:256},false,['decrypt'])}).then(function(a){
return crypto.subtle.decrypt({name:'AES-GCM',iv:u(D.i)},a,u(D.c))}).then(function(p){return new TextDecoder().decode(p)})}
function show(h){document.open();document.write(h);document.close()}
function rem(){try{var r=JSON.parse(localStorage.getItem('bk_k_rem')||'null');if(r&&r.k&&r.exp>Date.now())return r.k;if(r)localStorage.removeItem('bk_k_rem')}catch(x){try{localStorage.removeItem('bk_k_rem')}catch(y){}}return ''}
function forget(){try{sessionStorage.removeItem('bk_k')}catch(x){}try{localStorage.removeItem('bk_k_rem')}catch(x){}}
function busy(on,txt){$('c').classList.toggle('busy',on);$('b').disabled=on;$('k').readOnly=on;$('bt').textContent=on?txt:'Entrar'}
function bad(msg){busy(false);$('e').textContent=msg;var c=$('c');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');$('k').focus();$('k').select()}
function save(k,remember){try{sessionStorage.setItem('bk_k',k)}catch(x){}
try{if(remember)localStorage.setItem('bk_k_rem',JSON.stringify({k:k,exp:Date.now()+30*864e5}));else localStorage.removeItem('bk_k_rem')}catch(x){}}
var saved='';try{saved=sessionStorage.getItem('bk_k')||''}catch(x){}
if(!saved)saved=rem();
if(saved){busy(true,'Abriendo…');dec(saved).then(show,function(){forget();busy(false)})}
$('t').onclick=function(){var p=$('k').type==='password';$('k').type=p?'text':'password';$('t').setAttribute('aria-label',p?'Ocultar clave':'Mostrar clave');$('t').setAttribute('aria-pressed',String(p));$('ti').firstChild.setAttribute('d',p?EYEOFF:EYE);$('ti').lastChild.style.display=p?'none':'';$('k').focus()};
$('k').oninput=function(){$('e').textContent=''};
$('f').onsubmit=function(ev){ev.preventDefault();var k=$('k').value;if(!k){bad('Escribe tu clave');return}
$('e').textContent='';busy(true,'Abriendo…');
setTimeout(function(){dec(k).then(function(h){save(k,$('r').checked);show(h)},function(){bad('Clave incorrecta')})},30)};
</script></body></html>`;
mkdirSync(new URL('../public/admin/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/admin/index.html', import.meta.url), page);
console.log('public/admin/index.html', page.length, 'bytes');
