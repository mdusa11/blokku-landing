// Genera public/admin/index.html: el panel cifrado con AES-GCM (llave derivada
// de la clave de Manuel con PBKDF2). El repo solo guarda el cifrado; sin la
// clave no se puede leer. No necesita servidor ni secretos en Cloudflare.
// Uso: ADMIN_KEY='bk-…' node scripts/build-admin.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { COSM, VERS, LOGOS } from './admin-images.mjs';
import { webcrypto as crypto } from 'node:crypto';
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
const inject = 'var SEED_DOC=' + JSON.stringify(SEED) + ';\nvar IMGS=' + JSON.stringify(IMGS) + ';\nvar MAPA=' + JSON.stringify(MAPA) + ';\nvar CAPS=' + JSON.stringify(CAPS) + ';\n';
app = app.replace('/*INJECT*/', () => inject);

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
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0E1A46;color:#EEF3FF;font-family:system-ui,sans-serif}
form{background:linear-gradient(180deg,#24408F,#1C3378);padding:28px 24px;border-radius:20px;box-shadow:inset 0 -5px 0 #0F1F55,0 20px 40px #030C2B90;width:min(340px,90vw);display:grid;gap:14px}
h1{margin:0;font-size:22px}input{padding:12px;border-radius:12px;border:0;background:#0E1A46;color:#fff;font-size:16px}
button{padding:12px;border:0;border-radius:12px;font-weight:800;color:#0A1433;background:#FFC93C;box-shadow:inset 0 -4px 0 #C99410;font-size:16px}#e{color:#FF8FA8;min-height:1em;font-size:14px}</style></head>
<body><form id="f"><h1>Blokku · Admin</h1><input id="k" type="password" autocomplete="current-password" placeholder="Clave" required><button>Entrar</button><div id="e"></div></form>
<script>
var D={s:"${b64(salt)}",i:"${b64(iv)}",c:"${b64(ct)}",n:${ITER}};
function u(b){return Uint8Array.from(atob(b),function(c){return c.charCodeAt(0)})}
async function open_(k){var e=new TextEncoder();var b=await crypto.subtle.importKey('raw',e.encode(k),'PBKDF2',false,['deriveKey']);
var a=await crypto.subtle.deriveKey({name:'PBKDF2',salt:u(D.s),iterations:D.n,hash:'SHA-256'},b,{name:'AES-GCM',length:256},false,['decrypt']);
var h=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u(D.i)},a,u(D.c)));document.open();document.write(h);document.close()}
var saved=sessionStorage.getItem('bk_k');if(saved)open_(saved).catch(function(){sessionStorage.removeItem('bk_k')});
document.getElementById('f').onsubmit=async function(ev){ev.preventDefault();var k=document.getElementById('k').value;document.getElementById('e').textContent='Abriendo…';
try{await open_(k);sessionStorage.setItem('bk_k',k)}catch(x){document.getElementById('e').textContent='Clave incorrecta.'}};
</script></body></html>`;
mkdirSync(new URL('../public/admin/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/admin/index.html', import.meta.url), page);
console.log('public/admin/index.html', page.length, 'bytes');
