// Enlace corto para los QR de los stickers: /play (y /p).
// Decide en el servidor por User-Agent: Android va directo a Google Play con
// el referrer (Play Console cuenta las instalaciones por utm_source=sticker);
// todo lo demás (iPhone, iPad, escritorio) a la landing, que avisa que por
// ahora Blokku es solo para Android. 302 y no 301: el destino se puede cambiar
// sin reimprimir los stickers. El resto del sitio lo sirven los assets.
const PLAY =
  'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku' +
  '&referrer=utm_source%3Dsticker%26utm_medium%3Dqr';
const WEB = 'https://blokku.online/?utm_source=sticker&utm_medium=qr';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/admin/')) return admin(request, env, pathname);
    if (pathname === '/play' || pathname === '/play/' || pathname === '/p' || pathname === '/p/') {
      const ua = request.headers.get('user-agent') || '';
      const target = /android/i.test(ua) ? PLAY : WEB;
      return new Response(null, {
        status: 302,
        headers: { Location: target, 'Cache-Control': 'no-store', Vary: 'User-Agent' },
      });
    }
    // Panel privado: página estática CIFRADA (scripts/build-admin.mjs). Sin la
    // clave de Manuel solo se ve el formulario; no hay sesiones ni secretos.
    if (pathname === '/admin' || pathname === '/admin/') {
      const res = await env.ASSETS.fetch(request);
      const h = new Headers(res.headers);
      h.set('Cache-Control', 'no-store');
      h.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      h.set('Referrer-Policy', 'no-referrer');
      return new Response(res.body, { status: res.status, headers: h });
    }

    return env.ASSETS.fetch(request);
  },
};

// ---------------------------------------------------------------------------
// API del panel /admin (guardado en la nube con Cloudflare KV, binding ADMIN_KV).
// Cada petición lleva `Authorization: Bearer <clave>`; el Worker compara
// sha256(clave) en tiempo constante con el hash público de abajo. Sin cookies ni
// sesiones. La clave es aleatoria de 192 bits: su hash no se puede invertir.
// ---------------------------------------------------------------------------
const ADMIN_HASH = 'f7d4036c137d75e0a4d04223cdffad8a2e59df73cabf2890e1ef42c80ad3d6af';
const MAX_BODY = 4 * 1024 * 1024;
const MAX_IMG = 600 * 1024;
const HIST_N = 20;
const SNAP_GAP = 120000; // entre copias del historial al guardar seguido
const RL_MAX = 10;
const RL_WIN = 15 * 60 * 1000;
const rlMem = new Map();
const enc = new TextEncoder();

function reply(obj, status = 200, extra = {}) {
  const isText = typeof obj === 'string';
  return new Response(isText ? obj : JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      ...extra,
    },
  });
}

async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function sameHex(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function blocked(env, ip) {
  const now = Date.now();
  let n = 0;
  const m = rlMem.get(ip);
  if (m && now - m.t <= RL_WIN) n = m.n;
  try {
    const v = await env.ADMIN_KV.get('rl:' + ip, 'json');
    if (v && now - v.t <= RL_WIN) n = Math.max(n, v.n);
  } catch { /* KV caído: vale la memoria */ }
  return n >= RL_MAX;
}
async function failed(env, ip) {
  const now = Date.now();
  if (rlMem.size > 5000) rlMem.clear();
  let m = rlMem.get(ip);
  if (!m || now - m.t > RL_WIN) m = { n: 0, t: now };
  try {
    const v = await env.ADMIN_KV.get('rl:' + ip, 'json');
    if (v && now - v.t <= RL_WIN) m = { n: Math.max(m.n, v.n), t: Math.min(m.t, v.t) };
  } catch { /* igual */ }
  m.n++;
  rlMem.set(ip, m);
  try { await env.ADMIN_KV.put('rl:' + ip, JSON.stringify(m), { expirationTtl: 900 }); } catch { /* igual */ }
}

async function readBody(request, max) {
  const cl = Number(request.headers.get('content-length') || 0);
  if (cl > max) return { err: reply({ error: 'muy_grande' }, 413) };
  const buf = await request.arrayBuffer();
  if (buf.byteLength > max) return { err: reply({ error: 'muy_grande' }, 413) };
  return { text: new TextDecoder().decode(buf) };
}
async function readJson(request) {
  const b = await readBody(request, MAX_BODY);
  if (b.err) return b;
  try {
    const v = JSON.parse(b.text);
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw 0;
    return { v };
  } catch {
    return { err: reply({ error: 'json_invalido' }, 400) };
  }
}

const pad = (n) => String(n).padStart(9, '0');
const isDoc = (d) => d && typeof d === 'object' && !Array.isArray(d);

async function pruneHistory(env) {
  const l = await env.ADMIN_KV.list({ prefix: 'hist:' });
  const keys = l.keys.map((k) => k.name).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - HIST_N))) await env.ADMIN_KV.delete(k);
}
async function snapshot(env, cur) {
  const meta = { rev: cur.rev, updated: cur.updated, size: JSON.stringify(cur.doc).length };
  await env.ADMIN_KV.put('hist:' + pad(cur.rev), JSON.stringify({ rev: cur.rev, updated: cur.updated, doc: cur.doc }), { metadata: meta });
  await pruneHistory(env);
}

async function admin(request, env, pathname) {
  const m = request.method;
  let route = null;
  if (pathname === '/api/admin/doc') route = 'doc';
  else if (pathname === '/api/admin/history') route = 'history';
  else if (pathname === '/api/admin/restore') route = 'restore';
  else if (/^\/api\/admin\/img\/[A-Za-z0-9]{4,40}$/.test(pathname)) route = 'img';
  if (!route) return reply({ error: 'no_existe' }, 404);
  const allowed = { doc: ['GET', 'PUT'], history: ['GET'], restore: ['POST'], img: ['GET', 'PUT'] }[route];
  if (!allowed.includes(m)) return reply({ error: 'metodo' }, 405, { Allow: allowed.join(', ') });
  if (!env.ADMIN_KV) return reply({ error: 'sin_kv' }, 503);

  const ip = request.headers.get('cf-connecting-ip') || 'local';
  if (await blocked(env, ip)) return reply({ error: 'demasiados_intentos' }, 429, { 'Retry-After': '900' });
  const auth = /^Bearer (.{1,256})$/.exec(request.headers.get('authorization') || '');
  if (!auth || !sameHex(await sha256hex(auth[1]), ADMIN_HASH)) {
    await failed(env, ip);
    return reply({ error: 'no_autorizado' }, 401);
  }

  const kv = env.ADMIN_KV;
  const cur = route === 'img' ? null : await kv.get('doc', 'json');
  const rev = cur ? cur.rev : 0;

  if (route === 'doc' && m === 'GET') {
    return reply({ rev, updated: cur ? cur.updated : 0, doc: cur ? cur.doc : null });
  }

  if (route === 'doc' && m === 'PUT') {
    const b = await readJson(request);
    if (b.err) return b.err;
    const { baseVersion, doc } = b.v;
    if (!Number.isInteger(baseVersion) || !isDoc(doc)) return reply({ error: 'datos_invalidos' }, 400);
    if (baseVersion !== rev) return reply({ error: 'conflicto', rev, updated: cur ? cur.updated : 0, doc: cur ? cur.doc : null }, 409);
    const now = Date.now();
    let snap = cur ? cur.snap || 0 : 0;
    if (cur && now - snap >= SNAP_GAP) { await snapshot(env, cur); snap = now; }
    await kv.put('doc', JSON.stringify({ rev: rev + 1, updated: now, snap, doc }));
    return reply({ rev: rev + 1, updated: now });
  }

  if (route === 'history') {
    const l = await kv.list({ prefix: 'hist:' });
    const versions = l.keys
      .map((k) => k.metadata)
      .filter(Boolean)
      .sort((a, b) => b.rev - a.rev)
      .slice(0, HIST_N);
    return reply({ current: rev, versions });
  }

  if (route === 'restore') {
    const b = await readJson(request);
    if (b.err) return b.err;
    if (!Number.isInteger(b.v.rev) || b.v.rev < 1) return reply({ error: 'datos_invalidos' }, 400);
    const old = await kv.get('hist:' + pad(b.v.rev), 'json');
    if (!old || !isDoc(old.doc)) return reply({ error: 'no_existe' }, 404);
    const now = Date.now();
    if (cur) await snapshot(env, cur);
    await kv.put('doc', JSON.stringify({ rev: rev + 1, updated: now, snap: now, doc: old.doc }));
    return reply({ rev: rev + 1, updated: now, doc: old.doc });
  }

  // imágenes que Manuel agrega desde su dispositivo: data URI en img:<id>
  const id = pathname.split('/').pop();
  if (m === 'GET') {
    const v = await kv.get('img:' + id);
    return v == null ? reply({ error: 'no_existe' }, 404) : reply(v);
  }
  const b = await readBody(request, MAX_IMG);
  if (b.err) return b.err;
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.text)) return reply({ error: 'imagen_invalida' }, 400);
  await kv.put('img:' + id, b.text);
  return reply({ ok: true, id });
}
