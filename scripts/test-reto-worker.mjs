// Worker /r/{codigo} sin red real. Uso: node scripts/test-reto-worker.mjs
import worker from '../worker.js';

let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.error('FALLÓ:', m); } };

let rpcBody = null, rpcCalls = 0, mock = { ok: true, codigo: 'ABC234', puntos: 12345, retador: { nombre: 'Ana', pais: 'MX' }, caduca: 'x', caducado: false, total_intentos: 3, intentos: [], ganador: null };
globalThis.fetch = async (url, init) => {
  ok(String(url).includes('/rest/v1/rpc/reto_ver'), 'llama a reto_ver');
  rpcCalls++; rpcBody = JSON.parse(init.body);
  if (mock === 'red') throw new Error('sin red');
  return new Response(JSON.stringify(mock), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
// Cache API simulada
const store = new Map();
globalThis.caches = { default: { match: async (k) => { const r = store.get(k.url); return r ? r.clone() : undefined; }, put: async (k, r) => { store.set(k.url, r); } } };

const ASSETS = { fetch: async () => new Response('asset', { status: 200 }) };
const env = { ASSETS };
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-A176B) Chrome/120 Mobile';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1';
const DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120';
const get = (path, ua = DESKTOP, lang) => worker.fetch(new Request('https://blokku.online' + path, { headers: { 'user-agent': ua, ...(lang ? { 'accept-language': lang } : {}) } }), env, { waitUntil() {} });
const PLAY = 'play.google.com/store/apps/details?id=com.dusasolutions.blokku';
const IOS = 'apps.apple.com/app/id6822583798';

// formato inválido -> 302 a /
for (const p of ['/r/', '/r/ABC', '/r/ABC2345', '/r/ABCO23', '/r/ABC1I2', '/r/ab%zz12', '/r/ABC234/x']) {
  const r = await get(p);
  ok(r.status === 302 && r.headers.get('location') === '/', `inválido ${p} -> 302 / (fue ${r.status})`);
}
ok(rpcCalls === 0, 'formato inválido no llama a Supabase');

// minúsculas normaliza; android
let r = await get('/r/abc234', ANDROID), h = await r.text();
ok(r.status === 200, 'ok 200');
ok(rpcBody.p_codigo === 'ABC234' && rpcBody.p_id === null, 'p_codigo en mayúsculas, p_id null');
ok(h.includes(PLAY) && h.includes('referrer=utm_source%3Dreto%26utm_medium%3Dlink%26utm_campaign%3DABC234'), 'android: Play con referrer');
ok(!h.includes(IOS), 'android: sin App Store');
ok(h.includes('intent://blokku.online/r/ABC234#Intent;scheme=https;package=com.dusasolutions.blokku;S.browser_fallback_url=https%3A%2F%2Fplay.google.com') && h.includes(';end'), 'android: intent URL con fallback a Play');
ok(h.includes('Abrir en Blokku') && h.includes('¿No tienes Blokku? Descárgalo') && h.includes('Perfil › Mis retos y pega el código ABC234'), 'android: botón abrir + texto de respaldo');
ok(h.includes('Ana te retó: ¿le ganas a 12,345?'), 'título es con miles');
ok(h.includes('3 amigos ya jugaron'), 'amigos');
ok(h.includes('og:title') && h.includes('/og.jpg') && h.includes('noindex'), 'og + noindex');
ok(r.headers.get('x-robots-tag').includes('noindex'), 'X-Robots-Tag');
// caché: segunda visita no llama a Supabase
const n = rpcCalls; await get('/r/ABC234', IPHONE);
ok(rpcCalls === n, 'segunda visita sale de la caché');
// iPhone y escritorio
h = await (await get('/r/ABC234', IPHONE)).text();
ok(h.includes(IOS) && !h.includes(PLAY), 'iPhone: solo App Store');
ok(h.includes('href="https://blokku.online/r/ABC234"') && !h.includes('intent://'), 'iPhone: Universal Link');
h = await (await get('/r/ABC234', DESKTOP)).text();
ok(h.includes(IOS) && h.includes(PLAY) && !h.includes('Abrir en Blokku'), 'escritorio: ambos, sin botón abrir');
// inglés
h = await (await get('/r/ABC234', DESKTOP, 'en-US,en;q=0.9')).text();
ok(h.includes('Ana challenged you: can you beat 12,345?') && h.includes('lang="en"'), 'inglés');

// XSS
store.clear();
mock = { ok: true, puntos: 500, retador: { nombre: '<script>alert(1)</script>"><img src=x onerror=alert(2)>' }, caducado: false, total_intentos: 0 };
r = await get('/r/ABC234'); h = await r.text();
ok(!h.includes('<script') && !h.includes('<img src=x') && !h.includes('"><img'), 'XSS escapado');
ok(h.includes('&lt;script&gt;'), 'nombre visible escapado');
ok(!h.includes('ya jugaron') && !h.includes('ya jugó'), 'sin intentos no menciona amigos');

// no existe -> 404
store.clear(); mock = { ok: false, error: 'no_existe' };
r = await get('/r/ABC234', ANDROID); h = await r.text();
ok(r.status === 404 && h.includes('ya no está disponible') && h.includes(PLAY), 'no_existe -> 404 con tienda');
// caducado -> 200 amable
store.clear(); mock = { ok: true, puntos: 500, retador: { nombre: 'Ana' }, caducado: true };
r = await get('/r/ABC234'); h = await r.text();
ok(r.status === 200 && h.includes('ya no está disponible'), 'caducado -> 200 amable');
// error de red -> 200 neutro y sin cachear
store.clear(); mock = 'red';
r = await get('/r/ABC234'); h = await r.text();
ok(r.status === 200 && h.includes('No pudimos cargar') && h.includes(PLAY) && h.includes(IOS), 'red -> 200 neutro');
ok(store.size === 0, 'error de red no se cachea');
// límite -> 200 neutro
mock = { ok: false, error: 'limite' };
r = await get('/r/ABC234'); ok(r.status === 200, 'limite -> 200');

// rutas existentes intactas
for (const p of ['/play', '/play/', '/p', '/p/']) {
  r = await get(p, ANDROID);
  ok(r.status === 302 && r.headers.get('location').includes('referrer=utm_source%3Dsticker%26utm_medium%3Dqr'), `${p} android -> Play`);
  r = await get(p, IPHONE);
  ok(r.status === 302 && r.headers.get('location') === 'https://blokku.online/?utm_source=sticker&utm_medium=qr', `${p} otros -> landing`);
}
r = await get('/admin');
ok(r.status === 200 && r.headers.get('cache-control') === 'no-store' && /noindex/.test(r.headers.get('x-robots-tag')), '/admin intacto');
r = await get('/.well-known/assetlinks.json');
ok((await r.text()) === 'asset', 'otras rutas -> assets');

console.log(bad ? `FALLÓ (${bad})` : 'OK: worker /r/{codigo} y rutas existentes');
process.exit(bad ? 1 : 0);
