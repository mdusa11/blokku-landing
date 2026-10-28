// Worker /d/{codigo} (1 vs 1) sin red. Uso: node scripts/test-duelo-worker.mjs
import worker from '../worker.js';

let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.error('FALLÓ:', m); } };
globalThis.fetch = async () => { ok(false, '/d no llama a la red'); throw new Error('x'); };
const env = { ASSETS: { fetch: async () => new Response('asset', { status: 200 }) } };
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-A176B) Chrome/120 Mobile';
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1';
const get = (path, ua = 'Mozilla/5.0 (Macintosh)', lang) => worker.fetch(new Request('https://blokku.online' + path, { headers: { 'user-agent': ua, ...(lang ? { 'accept-language': lang } : {}) } }), env, { waitUntil() {} });

for (const p of ['/d/', '/d/ABC', '/d/ABCO23', '/d/ab%zz12', '/d/ABC234/x']) {
  const r = await get(p);
  ok(r.status === 302 && r.headers.get('location') === '/', `inválido ${p} -> 302`);
}
let r = await get('/d/abc234', ANDROID), h = await r.text();
ok(r.status === 200, '200');
ok(h.includes('intent://blokku.online/d/ABC234#Intent;'), 'android: intent a /d');
ok(h.includes('ABC234') && h.includes('1 vs 1'), 'código y título');
r = await get('/d/ABC234', IPHONE); h = await r.text();
ok(h.includes('href="https://blokku.online/d/ABC234"'), 'iphone: universal link /d');
r = await get('/d/ABC234', IPHONE, 'en-US'); h = await r.text();
ok(h.includes('Room code'), 'inglés');
// /r, /play y /p siguen igual
r = await get('/play', ANDROID); ok(r.status === 302 && r.headers.get('location').includes('play.google.com'), '/play intacto');
r = await get('/p'); ok(r.status === 302, '/p intacto');
r = await get('/r/ABC'); ok(r.status === 302, '/r intacto (formato)');
if (bad) { console.error(bad + ' fallos'); process.exit(1); } else console.log('OK worker /d');
