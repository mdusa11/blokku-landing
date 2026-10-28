/* ================= ANUNCIO POR PODER (31-anuncio-poderes.sql, app 2.0) ================= */
// admin_anuncio_poderes(p_clave[, p_cambios]) -> {config:{activo, por_poder}, hoy|d7|total:{vistos,dados,vacios}, por_poder:[{poder,vistos,dados,vacios}]}
// Se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.apod = '31-anuncio-poderes.sql';
FNF.admin_anuncio_poderes = 'apod';
RFN.apod = 'admin_anuncio_poderes';
N20['juego/anuncio-poderes'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/anuncio-poderes'; })) g.items.push(['juego/anuncio-poderes', 'Anuncio por poder', 'power']);
  ROUTES['juego/anuncio-poderes'] = { t: 'Anuncio por poder', ic: 'power', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/anuncio-poderes'] = {
  que: 'Cuando un poder (bomba, rayo, deshacer, revolver, gotero) se acaba en plena partida, el botón se ve apagado con un ▶. Al tocarlo el jugador puede ver un anuncio recompensado completo y recibe 1 carga de ese poder. Aquí lo enciendes o apagas y eliges cuántos anuncios por poder y por partida.',
  ve: 'En la partida, el botón del poder sin cargas con una pastillita ▶. Toca, sale «Mira un anuncio y gana 1 …», ve el anuncio y recibe la carga. Si no hay anuncio disponible sale «El anuncio no está disponible» y el ▶ se queda para reintentar.',
  cuando: 'Enciéndelo cuando el bloque «Recompensado» de AdMob ya tenga anuncios llenando. Vigila «No había anuncio»: si es mucho, el jugador toca y no pasa nada. Apágalo si molesta (no borra nada).',
  como: [
    '<b>Interruptor:</b> nace APAGADO. La app lo guarda 30 minutos (1 hora si está apagado), así que un cambio puede tardar en llegar.',
    '<b>Anuncios por poder y por partida:</b> de 0 a 3 (de fábrica 1). Con 1, cada uno de los 5 poderes da como máximo 1 carga por partida (hasta 5 anuncios en una partida).',
    '<b>Quién lo ve:</b> todos, también quien compró «Sin anuncios» (el recompensado es voluntario; «Sin anuncios» solo quita intersticiales y banner). No aplica en Muerte súbita, eventos sin poderes, reto diario ni retos entre amigos, ni a un poder apagado en Juego › Ajustes del juego.',
    '<b>Intersticial:</b> ver un recompensado cuenta para el tiempo mínimo entre intersticiales, así que no sale uno justo después.',
    '<b>Números:</b> anónimos, sin datos del jugador. «Visto» = anuncio completo; «Dado» = poder entregado; «No había anuncio» = tocó y no había.',
    '<b>Id de AdMob:</b> la app necesita el id del bloque Recompensado en el build (ADMOB_REWARDED_ANDROID / ADMOB_REWARDED_IOS). Sin él, la función se oculta aunque aquí esté encendida.',
    H_HORA
  ]
};

var AP = { on: null, n: null, saving: false };
var AP_POD = { bomb: 'Bomba', lightning: 'Rayo', undo: 'Deshacer', shuffle: 'Revolver', picker: 'Gotero' };
function apRows() { var o = rm('apod'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
I.apN = function (el) { AP.n = el.value; };
C.apOn = function (el) { AP.on = el.checked; };
A.apReload = function () { AP.on = null; AP.n = null; rload('apod'); toast('Recargando…', 'info'); };
A.apSave = async function () {
  if (AP.saving) return;
  var r = apRows(); if (!r) return;
  var on = AP.on == null ? !!r.config.activo : AP.on;
  var t = String(AP.n == null ? r.config.por_poder : AP.n).trim();
  if (!/^[0-3]$/.test(t)) { showErrs({ ap_n: 'Un entero de 0 a 3.' }); return; }
  var n = Number(t), ch = {}, dl = [];
  if (on !== !!r.config.activo) { ch.activo = on; dl.push(['Interruptor', (r.config.activo ? 'Encendido' : 'Apagado') + ' → <b>' + (on ? 'Encendido' : 'Apagado') + '</b>']); }
  if (n !== r.config.por_poder) { ch.por_poder = n; dl.push(['Anuncios por poder y partida', nf(r.config.por_poder) + ' → <b>' + nf(n) + '</b>']); }
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  if (!await confirmDlg({ title: on ? '¿Guardar «Anuncio por poder»?' : '¿Apagar «Anuncio por poder»?', text: 'Esto afecta a todos los jugadores con la app 2.0 o más nueva.', html: cbox(dl.concat([['Cuánto tarda', 'La app guarda estos valores unos 30 minutos.']])), ok: on ? 'Sí, guardar' : 'Apagar', danger: !on, icon: 'sliders' })) return;
  AP.saving = true; paintPage();
  try { await rpc('admin_anuncio_poderes', { p_cambios: ch }); AP.on = null; AP.n = null; toast('Guardado'); await rload('apod', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  AP.saving = false; paintPage();
};
function apKpis(r) {
  var d = r.hoy || {}, s = r.d7 || {}, t = r.total || {};
  return '<div class="kpis">' +
    kpi('trend', 'Anuncios vistos', nf(d.vistos), nf(s.vistos) + ' en 7 días · ' + nf(t.vistos) + ' en total') +
    kpi('spark', 'Poderes dados', nf(d.dados), nf(s.dados) + ' en 7 días · ' + nf(t.dados) + ' en total') +
    kpi('power', 'No había anuncio', nf(d.vacios), nf(s.vacios) + ' en 7 días · tocaron y no había') + '</div>';
}
function apForm(r) {
  var on = AP.on == null ? !!r.config.activo : AP.on;
  return '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptor y límite</h3><span class="sub grow">' + (r.config.activo ? 'Encendido' : 'Apagado: la app esconde todo') + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>Ver un anuncio para ganar un poder</b><div class="xs mut">Con un poder en 0, el botón muestra ▶.</div></div>' + tog('ap_on', on, 'Anuncio por poder', { dc: 'apOn' }) + '</div>' +
    field('ap_n', 'Anuncios por poder y por partida', inp('ap_n', AP.n == null ? String(r.config.por_poder) : AP.n, { type: 'number', mode: 'numeric', min: 0, ph: 'De fábrica: 1', di: 'apN' }), 'Entero de 0 a 3. <b>Ahora:</b> ' + nf(r.config.por_poder) + '.') +
    '<div class="row mt16"><button class="btn pri" data-a="apSave"' + (AP.saving ? ' disabled' : '') + '>' + (AP.saving ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div></div></div>';
}
function apTabla(r) {
  var l = r.por_poder || [];
  var h = '<div class="card sec"><div class="ch">' + ic('trend') + '<h3>Por poder (7 días)</h3></div><div class="cb">';
  if (!l.length) return h + '<p class="xs mut" style="margin:0">Aún no hay datos.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Poder</th><th class="num">Vistos</th><th class="num">Dados</th><th class="num">No había</th></tr></thead><tbody>' + l.map(function (x) {
    return '<tr><td>' + esc(AP_POD[x.poder] || x.poder) + '</td><td class="num">' + nf(x.vistos) + '</td><td class="num">' + nf(x.dados) + '</td><td class="num">' + nf(x.vacios) + '</td></tr>';
  }).join('') + '</tbody></table></div></div></div>';
}
function vAnuncioPoderes() {
  var o = rm('apod');
  var h = pageHead('Anuncio por poder', 'Ver un anuncio recompensado para ganar <b>1 carga</b> de un poder que se acabó.', '<button class="btn" data-a="apReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.apod, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 9-limites.sql.') + '</div>' : rerr(o, 'el anuncio por poder'));
  var r = apRows();
  if (!r) return h + skel(4);
  return h + apKpis(r) + apForm(r) + apTabla(r);
}
VIEWS['juego/anuncio-poderes'] = vAnuncioPoderes;
