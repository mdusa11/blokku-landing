// Genera public/admin/index.html: el panel cifrado con AES-GCM (llave derivada
// de la clave de Manuel con PBKDF2). El repo solo guarda el cifrado; sin la
// clave no se puede leer. No necesita servidor ni secretos en Cloudflare.
// Uso: ADMIN_KEY='bk-…' node scripts/build-admin.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { COSM, VERS, LOGOS } from './admin-images.mjs';
import { webcrypto as crypto, createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { SEED } from '../admin/seed.js';

const key = process.env.ADMIN_KEY;
if (!key) { console.error('Falta ADMIN_KEY'); process.exit(1); }

let app = readFileSync(new URL('../admin/app.html', import.meta.url), 'utf8');

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
const py = execFileSync('python3', [fileURLToPath(new URL('./prep-images.py', import.meta.url))], { input: JSON.stringify(spec), maxBuffer: 1 << 28 });
const IMGS = JSON.parse(py.toString());
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
  console.log('códigos de canje:', CODES.length, '(maestros:', CODES.filter((c) => c.i === '*').length + ')');
} else console.warn('sin CSV de códigos:', CSV);
const inject = 'var SEED_DOC=' + JSON.stringify(SEED) + ';\nvar IMGS=' + JSON.stringify(IMGS) + ';\nvar MAPA=' + JSON.stringify(MAPA) + ';\nvar CODES=' + JSON.stringify(CODES) + ';\nvar CAPS=' + JSON.stringify(CAPS) + ';\n';
app = app.replace('/*INJECT*/', () => inject);
// Vista previa local SIN cifrar (solo fuera del repo): ADMIN_PREVIEW=/ruta/panel.html
if (process.env.ADMIN_PREVIEW) writeFileSync(process.env.ADMIN_PREVIEW, app);

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const ITER = 310000;
const base = await crypto.subtle.importKey('raw', enc.encode(key), 'PBKDF2', false, ['deriveKey']);
const aes = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, enc.encode(app)));
const b64 = (u) => Buffer.from(u).toString('base64');

const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Blokku · Admin</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fff;color:#1f2937;font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;padding:16px}
form{width:100%;max-width:320px;display:grid;gap:14px}
h1{margin:0;font-size:22px;font-weight:600}p{margin:-8px 0 0;color:#6b7280;font-size:14px}
input{width:100%;padding:11px 12px;border:1px solid #d1d5db;border-radius:6px;font:inherit;color:#1f2937;background:#fff}input:focus{outline:2px solid #bfdbfe;border-color:#2563EB}
button{padding:11px;border:0;border-radius:6px;font:inherit;font-weight:600;color:#fff;background:#2563EB;cursor:pointer}button:hover{background:#1d4ed8}#e{color:#DC2626;min-height:1.3em;font-size:14px}</style></head>
<body><form id="f"><h1>Blokku</h1><p>Panel privado</p><input id="k" type="password" autocomplete="current-password" placeholder="Clave" required><button>Entrar</button><div id="e"></div></form>
<script>
var D={s:"${b64(salt)}",i:"${b64(iv)}",c:"${b64(ct)}",n:${ITER}};
function u(b){return Uint8Array.from(atob(b),function(c){return c.charCodeAt(0)})}
async function open_(k){var e=new TextEncoder();var b=await crypto.subtle.importKey('raw',e.encode(k),'PBKDF2',false,['deriveKey']);
var a=await crypto.subtle.deriveKey({name:'PBKDF2',salt:u(D.s),iterations:D.n,hash:'SHA-256'},b,{name:'AES-GCM',length:256},false,['decrypt']);
var h=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u(D.i)},a,u(D.c)));document.open();document.write(h);document.close()}
var saved=sessionStorage.getItem('bk_k');if(saved)open_(saved).catch(function(){sessionStorage.removeItem('bk_k')});
document.getElementById('f').onsubmit=async function(ev){ev.preventDefault();var k=document.getElementById('k').value;document.getElementById('e').textContent='Abriendo…';
try{sessionStorage.setItem('bk_k',k);await open_(k)}catch(x){sessionStorage.removeItem('bk_k');document.getElementById('e').textContent='Clave incorrecta.'}};
</script></body></html>`;
mkdirSync(new URL('../public/admin/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/admin/index.html', import.meta.url), page);
console.log('public/admin/index.html', page.length, 'bytes');
