/* ================= CÓDIGOS REVOCADOS (6-revocados.sql, app 1.0.6) ================= */
// El hash se calcula aquí, igual que la app (lib/services/redeem_hash.dart y
// CodeRedeemService.hashOf): v2 = HMAC-SHA256('blokku-codes-v2|', normalizado);
// v1 (stickers) = sha256('blokku-codes-v1|' + normalizado). A Supabase solo va el hash.
var RV_V1 = 'blokku-codes-v1|', RV_V2 = 'blokku-codes-v2|';
// Como toUpperCase de Dart: sin expansiones (ß, ﬁ… se quedan como están).
function rvUp(s) { return String(s || '').replace(/[\s\S]/gu, function (c) { var u = c.toUpperCase(); return u.length === c.length ? u : c; }); }
function rvNorm1(s) { return rvUp(s).replace(/\s/g, '').replace(/[‐‑‒–—−]/g, '-'); }
function rvNorm2(s) { return rvUp(s).replace(/[\s\-‐‑‒–—−]/g, '').replace(/O/g, '0').replace(/I/g, '1').replace(/L/g, '1'); }
function rvHex(b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
function rvSha(t) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)).then(rvHex); }
function rvHmac(k, t) {
  var e = new TextEncoder();
  return crypto.subtle.importKey('raw', e.encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then(function (key) { return crypto.subtle.sign('HMAC', key, e.encode(t)); }).then(rvHex);
}
function rvHashV1(code) { return rvSha(RV_V1 + rvNorm1(code)); }
function rvHashV2(code) { return rvHmac(RV_V2, rvNorm2(code)); }
// Qué hash guardar: un hash pegado tal cual; BK-XXXX-XXXX-XXXX → v2; lo demás
// (stickers, BLOKKU-…) → v1. La app compara contra los dos, así que basta uno.
function rvHashFor(raw) {
  var t = String(raw || '').trim();
  if (/^[0-9a-fA-F]{64}$/.test(t)) return Promise.resolve({ h: t.toLowerCase(), k: 'hash' });
  if (/^BK[0-9A-Z]{12}$/.test(rvNorm2(t))) return rvHashV2(t).then(function (h) { return { h: h, k: 'v2' }; });
  return rvHashV1(t).then(function (h) { return { h: h, k: 'v1' }; });
}
// Qué código es (solo con lo que trae el panel cifrado).
function rvWho(h) {
  var all = typeof CODES !== 'undefined' ? CODES : [];
  var c = all.find(function (x) { return x.a === h; });
  if (c) return { n: c.i === '*' ? 'Código maestro' : c.n, k: c.i === '*' ? 'Maestro' : 'Único', fin: c.c.slice(-4) };
  if (typeof V1H !== 'undefined' && V1H[h]) return { n: V1H[h], k: 'Sticker' };
  return { n: 'Código', k: 'Otro', fin: '' };
}

function vRevocados() {
  var o = rm('revocados');
  var h = pageHead('Códigos revocados', 'Códigos fijos (únicos, maestros o stickers) que ya no deben aceptarse. Desde la 1.0.6 la app los rechaza como inválidos.', '<button class="btn pri" data-a="rvNew"' + (S.ro ? ' disabled' : '') + '>' + ic('plus') + 'Revocar código</button>',
    ['Escribe el <b>código en claro</b>: el panel calcula su huella y solo eso se guarda en Supabase.']);
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.revocados, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 2-remoto.sql.') + '</div>' : rerr(o, 'los revocados'));
  if (o.rows == null) return h + skel(3);
  var R = rows('revocados');
  if (!R.length) return h + '<div class="card">' + emptyBox('check', 'No hay códigos revocados', 'Ahora la app acepta todos los códigos fijos. Si un código se filtra o se dio por error, revócalo aquí y la app dejará de aceptarlo.', S.ro ? '' : '<button class="btn pri" data-a="rvNew">' + ic('plus') + 'Revocar código</button>') + '</div>';
  h += '<div class="card"><div class="tw"><table class="tbl"><thead><tr><th>Código</th><th>Tipo</th><th>Nota</th><th>Revocado</th><th></th></tr></thead><tbody>' + R.map(function (r) {
    var w = rvWho(r.hash);
    return '<tr><td><b>' + esc(w.n) + '</b>' + (w.fin ? '<div class="xs mut mono">termina en ' + esc(w.fin) + '</div>' : '') + '<div class="xs faint mono" title="' + esc(r.hash) + '">' + esc(r.hash.slice(0, 12)) + '…</div></td><td>' + chipN(w.k, w.k === 'Maestro' ? 'warn' : 'line') + '</td><td class="sm">' + esc(r.nota || '—') + '</td><td class="sm nowrap">' + esc(fdt(r.creado, 1)) + '</td><td class="num">' + (S.ro ? '' : '<button class="btn xs ghost" data-a="rvDel" data-h="' + esc(r.hash) + '">' + ic('x') + 'Quitar</button>') + '</td></tr>';
  }).join('') + '</tbody></table></div></div><p class="xs mut mt8">' + plural(R.length, 'código revocado', 'códigos revocados') + '</p>';
  return h;
}
A.rvNew = function () {
  formDrawer({
    title: 'Revocar código', sub: 'Deja de aceptarse en la app 1.0.6 o más nueva. Quien ya lo canjeó conserva su premio.',
    body: function () {
      return '<div class="fsec">' + field('rv_co', 'Código', inp('rv_co', '', { max: 80, ph: 'BK-XXXX-XXXX-XXXX o el del sticker', auto: true }), 'Escríbelo como lo escribiría el jugador (con o sin guiones). Ejemplo: BK-ABCD-EFGH-JKLM. Funciona para códigos únicos, maestros y stickers. También acepta la huella de 64 caracteres.') +
        field('rv_no', 'Nota', inp('rv_no', '', { max: 200, ph: 'Ej. se filtró en TikTok' }), 'Solo para ti, para acordarte por qué lo revocaste. Ejemplo: se filtró en TikTok.') + '</div>';
    },
    foot: function () { return '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn dng solid" data-a="rvGo">' + ic('pause') + 'Revocar</button>'; }
  });
};
A.rvGo = async function (el) {
  var raw = drawerVal('rv_co').trim(), nota = drawerVal('rv_no').trim();
  if (!showErrs(raw.length < 4 ? { rv_co: 'Escribe el código' } : {})) return;
  var r;
  try { r = await rvHashFor(raw); } catch { toast('Este navegador no puede calcular el hash', 'bad'); return; }
  var w = rvWho(r.h);
  if (rows('revocados').some(function (x) { return x.hash === r.h; }) && !await confirmDlg({ title: 'Ya estaba revocado', text: '¿Cambiar solo la nota?', ok: 'Cambiar nota', icon: 'edit' })) return;
  if (w.k === 'Otro' && r.k !== 'hash' && !await confirmDlg({ title: '¿Revocar este código?', text: 'No es ninguno de los códigos únicos ni de los stickers que conoce el panel. Revisa que esté bien escrito. Los rotativos se apagan en Rotativos, no aquí.', ok: 'Revocar de todos modos', danger: true, icon: 'warn' })) return;
  if (!rows('revocados').some(function (x) { return x.hash === r.h; }) && !await confirmDlg({ title: '¿Revocar ' + (w.k === 'Otro' ? 'este código' : w.n) + '?', text: 'Deja de aceptarse en la app.', html: cbox([['Qué pasa', 'Quien lo escriba verá que es inválido. Quien ya lo canjeó <b>conserva su premio</b>.'], ['A quién', 'A todos los jugadores con la app 1.0.6 o más nueva. Las versiones más viejas lo seguirán aceptando.'], ['Cuánto tarda', 'Los teléfonos bajan la lista nueva en unos minutos (como máximo unos 15). Se puede deshacer quitándolo de esta lista.']]), ok: 'Sí, revocar', danger: true, icon: 'pause' })) return;
  busy(el, true, 'Revocando…');
  try {
    await rpc('admin_revocar', { p_hash: r.h, p_nota: nota });
    toast((w.k === 'Otro' ? 'Código' : w.n) + ' revocado'); drawerKill(); rload('revocados');
  } catch (er) { busy(el, false); toast(er.message, 'bad'); }
};
A.rvDel = async function (el) {
  var hh = el.dataset.h, w = rvWho(hh);
  if (!await confirmDlg({ title: '¿Quitar de revocados?', text: (w.k === 'Otro' ? 'Este código' : w.n) + ' vuelve a aceptarse en cuanto los teléfonos bajen la lista nueva (en unos minutos). Cualquiera que lo tenga podrá canjearlo otra vez.', ok: 'Quitar', icon: 'play' })) return;
  try { await rpc('admin_quitar_revocado', { p_hash: hh }); toast('Quitado de revocados'); rload('revocados'); } catch (er) { toast(er.message, 'bad'); }
};

VIEWS['codigos/revocados'] = vRevocados;
