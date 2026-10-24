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
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/r/')) return reto(request, env, ctx, pathname);
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

// ── /r/{CODIGO}: página del reto de un amigo (Blokku 2.0) ───────────────────────
// Si la app está instalada, App Links / Universal Links abren /r/* directo en la
// app y esta página ni se ve. Si no, enseña el reto y manda a la tienda.
const SB_URL = 'https://fngbputjfnwtrcwaabue.supabase.co';
// Llave publishable: pública por diseño (la misma que usan la app y el panel).
const SB_KEY = 'sb_publishable_uSMrnJx7qRj2HU2yuyTs9A_y5eL514_';
const STORE_IOS = 'https://apps.apple.com/app/id6822583798';
const CODIGO_RE = /^[2-9A-HJKMNP-Z]{6}$/;
const CACHE_S = 60;

const esc = (v) =>
  String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const miles = (n) => String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const T = {
  es: {
    lang: 'es',
    title: (n, p) => `${n} te retó: ¿le ganas a ${p}?`,
    desc: 'Juega las mismas piezas y compara tu puntaje en Blokku.',
    h1: (n) => `${n} te retó`,
    lead: (p) => `¿Le ganas a <b>${p}</b> puntos?`,
    amigos: (k) => (k === 1 ? '1 amigo ya jugó este reto' : `${k} amigos ya jugaron este reto`),
    code: 'Código del reto',
    play: 'Google Play',
    ios: 'App Store',
    open: 'Abrir en Blokku',
    nohas: '¿No tienes Blokku? Descárgalo',
    nopen: (c) => `¿No se abre? En Blokku ve a Perfil › Mis retos y pega el código ${c}`,
    hint: 'Instala Blokku y abre este enlace otra vez para jugar el reto.',
    gone: 'Este reto ya no está disponible',
    goneText: 'Puede que haya caducado o que el enlace esté mal escrito. Aun así, Blokku te espera.',
    err: 'No pudimos cargar el reto',
    errText: 'Intenta de nuevo en un momento. Mientras, puedes instalar Blokku.',
  },
  en: {
    lang: 'en',
    title: (n, p) => `${n} challenged you: can you beat ${p}?`,
    desc: 'Play the same pieces and compare your score in Blokku.',
    h1: (n) => `${n} challenged you`,
    lead: (p) => `Can you beat <b>${p}</b> points?`,
    amigos: (k) => (k === 1 ? '1 friend has already played this challenge' : `${k} friends have already played this challenge`),
    code: 'Challenge code',
    play: 'Google Play',
    ios: 'App Store',
    open: 'Open in Blokku',
    nohas: "Don't have Blokku? Download it",
    nopen: (c) => `Won't open? In Blokku go to Profile › My challenges and paste the code ${c}`,
    hint: 'Install Blokku and open this link again to play the challenge.',
    gone: 'This challenge is no longer available',
    goneText: 'It may have expired or the link may be mistyped. Blokku is still waiting for you, though.',
    err: "We couldn't load the challenge",
    errText: 'Try again in a moment. In the meantime, you can install Blokku.',
  },
};

function playUrl(codigo) {
  return (
    'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku' +
    `&referrer=utm_source%3Dreto%26utm_medium%3Dlink%26utm_campaign%3D${codigo}`
  );
}

// h1/lead/extra ya vienen escapados por quien llama; título y descripción se escapan aquí.
function pagina({ t, codigo, ua, titulo, desc, h1, lead, extra, status, conCodigo }) {
  const android = /android/i.test(ua);
  const ios = /iphone|ipad|ipod/i.test(ua);
  const btnPlay = `<a class="b g" href="${esc(playUrl(codigo))}" rel="noopener">${esc(t.play)}</a>`;
  const btnIos = `<a class="b a" href="${STORE_IOS}" rel="noopener">${esc(t.ios)}</a>`;
  const botones = android ? btnPlay : ios ? btnIos : btnPlay + btnIos;
  // «Abrir en Blokku» solo con código válido y en móvil. Android: intent URL (abre la app si está
  // instalada, si no cae a Play con referrer). iPhone: el Universal Link normal.
  let abrir = '';
  if (conCodigo && (android || ios)) {
    const href = android
      ? `intent://blokku.online/r/${codigo}#Intent;scheme=https;package=com.dusasolutions.blokku;S.browser_fallback_url=${encodeURIComponent(playUrl(codigo))};end`
      : `https://blokku.online/r/${codigo}`;
    abrir = `<a class="b p" href="${esc(href)}">${esc(t.open)}</a><p class="h2">${esc(t.nohas)}</p>`;
  }
  const html = `<!doctype html>
<html lang="${t.lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#1b3072">
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="BLOKKU">
<meta property="og:image" content="https://blokku.online/og.jpg?v=4">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon-64.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px;font-family:"Fredoka","Nunito",ui-rounded,system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;background:linear-gradient(#1b3072,#0e1a46)}
main{width:100%;max-width:420px;text-align:center;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.13);border-radius:24px;padding:28px 22px}
img{width:72px;height:72px;border-radius:18px;margin-bottom:14px}
h1{font-size:26px;line-height:1.2;overflow-wrap:anywhere;margin-bottom:8px}
.lead{font-size:20px;color:#aab6e8;margin-bottom:6px}
.lead b{color:#ffc93c;font-size:28px}
.n{font-size:15px;color:#43d9a3;margin-top:8px}
.code{display:inline-block;margin:16px 0 4px;padding:6px 14px;border-radius:12px;background:rgba(255,255,255,.1);letter-spacing:4px;font-weight:700;font-size:20px}
.cl{font-size:12px;color:#aab6e8}
.bs{display:flex;flex-direction:column;gap:10px;margin-top:20px}
.b{display:block;padding:14px;border-radius:14px;font-weight:700;font-size:18px;text-decoration:none;color:#0e1a46}
.g{background:#43d9a3}.a{background:#4ea1ff}.p{background:#ffc93c;font-size:20px}
.h2{font-size:14px;color:#aab6e8;margin:18px 0 -4px}
.h{font-size:13px;color:#aab6e8;margin-top:16px}
</style></head><body><main>
<img src="/favicon-64.png" alt="Blokku" width="72" height="72">
<h1>${h1}</h1>
${lead}${extra}
${conCodigo ? `<div class="code">${esc(codigo)}</div><div class="cl">${esc(t.code)}</div>` : ''}
<div class="bs">${abrir}${botones}</div>
${conCodigo ? `<p class="h">${esc(abrir ? t.nopen(codigo) : t.hint)}</p>` : ''}
</main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      Vary: 'Accept-Language, User-Agent',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy':
        "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
}

// Devuelve el JSON de reto_ver, o null si falló la red/el servidor (eso no se cachea).
async function retoVer(codigo, env, ctx) {
  const cache = typeof caches !== 'undefined' && caches.default ? caches.default : null;
  const key = new Request(`https://blokku.online/__reto_cache/${codigo}`);
  try {
    const hit = cache && (await cache.match(key));
    if (hit) return await hit.json();
  } catch {}
  let data = null;
  try {
    const base = (env && env.SUPABASE_URL) || SB_URL;
    const k = (env && env.SUPABASE_ANON_KEY) || SB_KEY;
    const r = await fetch(`${base}/rest/v1/rpc/reto_ver`, {
      method: 'POST',
      headers: { apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ p_codigo: codigo, p_id: null }),
      signal: AbortSignal.timeout(3500),
    });
    if (r.ok) data = await r.json();
  } catch {}
  if (!data || typeof data !== 'object') return null;
  if (cache && (data.ok === true || data.error === 'no_existe')) {
    const put = cache
      .put(key, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${CACHE_S}` } }))
      .catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(put);
  }
  return data;
}

function decodeSafe(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return '';
  }
}

async function reto(request, env, ctx, pathname) {
  const m = pathname.match(/^\/r\/([^/]+)\/?$/);
  const codigo = m ? decodeSafe(m[1]).toUpperCase() : '';
  if (!CODIGO_RE.test(codigo)) {
    return new Response(null, { status: 302, headers: { Location: '/', 'Cache-Control': 'no-store' } });
  }
  const ua = request.headers.get('user-agent') || '';
  const t = /^\s*en/i.test(request.headers.get('accept-language') || '') ? T.en : T.es;
  const data = await retoVer(codigo, env, ctx);
  const base = { t, codigo, ua };
  const puntos = data ? Number(data.puntos) : 0;
  if (data && data.ok === true && !data.caducado && Number.isFinite(puntos) && puntos > 0) {
    const nombre = String((data.retador && data.retador.nombre) || '').trim().slice(0, 40) || 'Blokku';
    const p = miles(puntos);
    const k = Math.max(0, Math.trunc(Number(data.total_intentos) || 0));
    return pagina({
      ...base,
      titulo: t.title(nombre, p),
      desc: k ? `${t.amigos(k)}. ${t.desc}` : t.desc,
      h1: esc(t.h1(nombre)),
      lead: `<p class="lead">${t.lead(esc(p))}</p>`,
      extra: k ? `<p class="n">${esc(t.amigos(k))}</p>` : '',
      status: 200,
      conCodigo: true,
    });
  }
  // No existe -> 404; caducado o error genérico -> 200 con mensaje neutro.
  const noExiste = !!data && data.ok === false && data.error === 'no_existe';
  const falla = !data || (data.ok !== true && !noExiste);
  return pagina({
    ...base,
    titulo: falla ? t.err : t.gone,
    desc: falla ? t.errText : t.goneText,
    h1: esc(falla ? t.err : t.gone),
    lead: `<p class="lead">${esc(falla ? t.errText : t.goneText)}</p>`,
    extra: '',
    status: noExiste ? 404 : 200,
    conCodigo: false,
  });
}
