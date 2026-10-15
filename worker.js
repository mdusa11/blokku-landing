// Worker de blokku.online.
// 1) Enlace corto para los QR de los stickers: /play (y /p). NO CAMBIAR.
//    Android va directo a Google Play con el referrer (Play Console cuenta las
//    instalaciones por utm_source=sticker); todo lo demás a la landing.
//    302 y no 301: el destino se puede cambiar sin reimprimir los stickers.
// 2) Panel privado /admin (+ /api/admin/*): login con clave, sesión firmada,
//    datos en KV (ADMIN_KV). Sin KV funciona en solo lectura con la semilla.
// El resto del sitio lo sirven los assets.
import { SEED } from './admin/seed.js';
import LOGIN_HTML from './admin/login.html';
import APP_HTML from './admin/app.html';

const PLAY =
  'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku' +
  '&referrer=utm_source%3Dsticker%26utm_medium%3Dqr';
const WEB = 'https://blokku.online/?utm_source=sticker&utm_medium=qr';

// SHA-256 de la clave del panel. La clave en texto NO está en el repo.
const ADMIN_HASH = 'f7d4036c137d75e0a4d04223cdffad8a2e59df73cabf2890e1ef42c80ad3d6af';
// TODO: crear el secreto ADMIN_SECRET (Workers > blokku > Settings > Variables and Secrets)
// con un valor aleatorio largo. Mientras no exista, la firma de la cookie se
// deriva del hash, que es público en el repo: la clave sigue siendo necesaria
// para el login, pero con ADMIN_SECRET las sesiones no se podrían falsificar.
const COOKIE = 'bk_admin';
const SESSION_SECS = 60 * 60 * 24 * 7;
const MAX_FAILS = 5;
const WINDOW_SECS = 15 * 60;
const KEY_DOC = 'doc';
const KEY_HIST = 'history';
const MAX_HIST = 30;
const MAX_BODY = 1_000_000;
const SECTIONS = ['timeline', 'versiones', 'premios', 'eventos', 'cupones', 'pendientes', 'decisiones', 'ideas'];

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function safeEq(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function sha256Hex(s) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

async function hmac(env, msg) {
  const secret = env.ADMIN_SECRET || 'blokku-admin-session:' + ADMIN_HASH;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
}

async function makeToken(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECS;
  const nonce = b64u(crypto.getRandomValues(new Uint8Array(12)));
  const body = exp + '.' + nonce;
  return body + '.' + (await hmac(env, body));
}

async function validSession(request, env) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const parts = m[1].split('.');
  if (parts.length !== 3) return false;
  const exp = Number(parts[0]);
  if (!exp || exp < Date.now() / 1000) return false;
  return safeEq(parts[2], await hmac(env, parts[0] + '.' + parts[1]));
}

const cookieHeader = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

const baseHeaders = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...baseHeaders, 'content-type': 'application/json; charset=utf-8', ...extra },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      ...baseHeaders,
      'content-type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
      'X-Frame-Options': 'DENY',
    },
  });
}

// Rate limit de login: memoria del isolate + KV si existe.
const fails = new Map();
async function rateState(env, ip) {
  const now = Date.now();
  let e = fails.get(ip);
  if (!e || e.reset < now) e = { n: 0, reset: now + WINDOW_SECS * 1000 };
  if (env.ADMIN_KV) {
    try {
      const kv = await env.ADMIN_KV.get('rl:' + ip, 'json');
      if (kv && kv.reset > now && kv.n > e.n) e = kv;
    } catch {}
  }
  return e;
}
async function rateSave(env, ip, e) {
  fails.set(ip, e);
  if (fails.size > 500) fails.delete(fails.keys().next().value);
  if (env.ADMIN_KV) {
    try {
      await env.ADMIN_KV.put('rl:' + ip, JSON.stringify(e), { expirationTtl: WINDOW_SECS });
    } catch {}
  }
}

async function readBody(request) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function loadDoc(env) {
  if (!env.ADMIN_KV) return { doc: SEED, readonly: true };
  const doc = await env.ADMIN_KV.get(KEY_DOC, 'json');
  return { doc: doc || SEED, readonly: false };
}

function validDoc(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  return SECTIONS.every((k) => d[k] === undefined || Array.isArray(d[k]));
}

async function saveDoc(env, current, next) {
  const hist = (await env.ADMIN_KV.get(KEY_HIST, 'json')) || [];
  hist.unshift({ version: current.version, ts: new Date().toISOString(), doc: current });
  hist.length = Math.min(hist.length, MAX_HIST);
  const out = { ...next, version: (current.version || 0) + 1, actualizado: new Date().toISOString().slice(0, 10) };
  await env.ADMIN_KV.put(KEY_HIST, JSON.stringify(hist));
  await env.ADMIN_KV.put(KEY_DOC, JSON.stringify(out));
  return out;
}

async function handleAdminApi(request, env, pathname) {
  const method = request.method;
  const ip = request.headers.get('cf-connecting-ip') || 'local';

  if (pathname === '/api/admin/login' && method === 'POST') {
    const st = await rateState(env, ip);
    if (st.n >= MAX_FAILS) return json({ error: 'rate' }, 429, { 'Retry-After': String(WINDOW_SECS) });
    const body = await readBody(request);
    const key = body && typeof body.key === 'string' ? body.key.slice(0, 200) : '';
    const ok = safeEq(await sha256Hex(key), ADMIN_HASH);
    if (!ok) {
      st.n += 1;
      await rateSave(env, ip, st);
      return json({ error: 'clave' }, 401);
    }
    fails.delete(ip);
    return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader(await makeToken(env), SESSION_SECS) });
  }

  if (pathname === '/api/admin/logout' && method === 'POST') {
    return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', 0) });
  }

  if (!(await validSession(request, env))) return json({ error: 'sesion' }, 401);

  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'origen' }, 403);
  }

  if (pathname === '/api/admin/data' && method === 'GET') {
    const { doc, readonly } = await loadDoc(env);
    return json({ doc, readonly });
  }

  const secMatch = pathname.match(/^\/api\/admin\/data\/([a-z]+)$/);
  if ((pathname === '/api/admin/data' || secMatch) && method === 'PUT') {
    if (!env.ADMIN_KV) return json({ error: 'lectura' }, 503);
    const body = await readBody(request);
    if (!body) return json({ error: 'json' }, 400);
    const { doc: current } = await loadDoc(env);
    if (body.baseVersion !== current.version) return json({ error: 'conflicto', doc: current }, 409);
    let next;
    if (secMatch) {
      if (!SECTIONS.includes(secMatch[1]) || !Array.isArray(body.value)) return json({ error: 'seccion' }, 400);
      next = { ...current, [secMatch[1]]: body.value };
    } else {
      if (!validDoc(body.doc)) return json({ error: 'doc' }, 400);
      next = { ...current, ...body.doc };
    }
    return json({ doc: await saveDoc(env, current, next) });
  }

  if (pathname === '/api/admin/history' && method === 'GET') {
    if (!env.ADMIN_KV) return json({ history: [] });
    const hist = (await env.ADMIN_KV.get(KEY_HIST, 'json')) || [];
    return json({ history: hist.map((h) => ({ version: h.version, ts: h.ts })) });
  }

  if (pathname === '/api/admin/history/restore' && method === 'POST') {
    if (!env.ADMIN_KV) return json({ error: 'lectura' }, 503);
    const body = await readBody(request);
    const hist = (await env.ADMIN_KV.get(KEY_HIST, 'json')) || [];
    const snap = body && hist.find((h) => h.version === body.version);
    if (!snap) return json({ error: 'no existe' }, 404);
    const { doc: current } = await loadDoc(env);
    return json({ doc: await saveDoc(env, current, snap.doc) });
  }

  return json({ error: 'no encontrado' }, 404);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/play' || pathname === '/play/' || pathname === '/p' || pathname === '/p/') {
      const ua = request.headers.get('user-agent') || '';
      const target = /android/i.test(ua) ? PLAY : WEB;
      return new Response(null, {
        status: 302,
        headers: { Location: target, 'Cache-Control': 'no-store', Vary: 'User-Agent' },
      });
    }

    if (pathname.startsWith('/api/admin/')) {
      try {
        return await handleAdminApi(request, env, pathname);
      } catch {
        return json({ error: 'interno' }, 500);
      }
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: baseHeaders });
      if (pathname !== '/admin' && pathname !== '/admin/') return html(LOGIN_HTML, 404);
      return html((await validSession(request, env)) ? APP_HTML : LOGIN_HTML);
    }

    return env.ASSETS.fetch(request);
  },
};
