/* ================= AJUSTES DEL JUEGO (14-servidor.sql, app 1.0.8) ================= */
// Ajustes con rango, interruptores (kill switches) y frases de Blokki. Todo es
// dato: la app lo baja con la config remota y lo valida igual que aquí. Sin
// valor = el de fábrica de la app. Las reglas viven en lib/services/ajustes_remotos.dart.
var SV_AJ = [
  ['mision_premio_pct', 'Premio de las misiones diarias', 25, 300, 100, '%', '100 % = normal; 150 % = 50 % más XP al reclamar una misión; 50 % = la mitad.'],
  ['mision_meta_pct', 'Meta de las misiones diarias', 50, 200, 100, '%', 'Cuánto hay que hacer en cada misión. 100 % = normal; 50 % = la mitad (mínimo 1); 200 % = el doble. Qué 3 misiones tocan cada día no cambia.'],
  ['xp_pct', 'XP por línea y por partida', 25, 300, 100, '%', '100 % = normal; 150 % = 50 % más XP por línea y por partida; 50 % = la mitad. El tope sigue siendo 3,000 XP por partida.'],
  ['reto_diario_seg', 'Duración del reto diario', 60, 600, 180, 'segundos', 'Cuánto dura el reto diario (180 = 3 minutos). Las piezas y el tablero del día no cambian. Cámbialo SOLO de madrugada, entre un día y otro: si dos jugadores del mismo día tienen tiempos distintos, el ranking del día no es justo.'],
  ['aviso_sesion_min', 'Tiempo fuera para contar como sesión nueva', 5, 720, 30, 'minutos', 'Cuánto tiempo fuera de la app cuenta como «sesión nueva». Ejemplo: 30 = si regresa después de 30 minutos, los avisos de frecuencia «Siempre» vuelven a salir.'],
  ['refresco_min', 'Cada cuánto la app pide esta configuración', 5, 120, 15, 'minutos', 'Con la app abierta o al volver de segundo plano. Ejemplo: 15 = cada 15 minutos. Más bajo = tus cambios llegan más rápido, pero la app hace más peticiones.']
];
// Anuncios entre partidas (app 1.0.9; 21-v109.sql). Mismos rangos que _srv_ajustes y AjustesRemotos.
var SV_AD = [
  ['ad_cada_partidas', 'Cada cuántas partidas sale un anuncio', 2, 10, 3, 'partidas', 'Ejemplo: 3 = un anuncio cada 3 partidas terminadas. El contador se guarda en el teléfono: ya no se reinicia al cerrar la app. Más bajo = más anuncios.'],
  ['ad_min_seg', 'Duración mínima de la partida', 20, 180, 45, 'segundos', 'Si la partida que acaba de terminar duró menos que esto, no sale anuncio (morir rápido y ver un anuncio hace que la gente se vaya). Ejemplo: 45. La partida corta no reinicia la cuenta: el anuncio sale en la siguiente larga.'],
  ['ad_min_intervalo_seg', 'Mínimo entre un anuncio y otro', 60, 1800, 180, 'segundos', 'Aunque ya toque, no sale otro anuncio hasta que pasen estos segundos desde el último. Ejemplo: 180 = 3 minutos. También se respeta aunque cierren y abran la app.']
];
var SV_ADK = SV_AD.map(function (c) { return c[0]; }).concat(['ad_en_diario']);
var SV_POD = [['bomb', 'Bomba', 1], ['lightning', 'Rayo', 1], ['undo', 'Deshacer', 2], ['shuffle', 'Mezclar', 2], ['picker', 'Gotero de color', 1]];
var SV_RK = [['rank_envio_umbral', 'Primer envío al ranking a media partida', 1000, 1000000, 10000, 'puntos', 'Desde cuántos puntos la app manda el puntaje al ranking sin esperar a que termine la partida. Ejemplo: 10,000.'], ['rank_envio_cada_seg', 'Segundos entre envíos a media partida', 10, 3600, 300, 'segundos', 'Espera mínima entre un envío y otro durante la partida. Ejemplo: 300 = cada 5 minutos. Solo se manda si el puntaje mejoró.']];
var SV_OFF = [
  ['ranking', 'Ranking', 'Oculta el botón y la app deja de hablar con el ranking (envíos, tablas y mensajes por jugador).'],
  ['eventos', 'Eventos', 'El menú no anuncia ni cuenta eventos (incluidos los de fábrica). Lo ya ganado se queda.'],
  ['canje', 'Canje de códigos', 'Se oculta el campo de Ajustes; un botón «Canjear» de un aviso contesta «sin conexión».'],
  ['blokki', 'Blokki en el menú', 'Quita la mascota del menú (y sus frases).'],
  ['compras', 'Compras («Sin anuncios»)', 'Oculta el botón y la pantalla de compra. Quien ya pagó conserva su beneficio.'],
  ['bomb', 'Poder: Bomba', 'El botón se ve apagado y no se puede usar. La carga guardada no se pierde.'],
  ['lightning', 'Poder: Rayo', 'Igual.'],
  ['undo', 'Poder: Deshacer', 'Igual.'],
  ['shuffle', 'Poder: Mezclar', 'Igual.'],
  ['picker', 'Poder: Gotero de color', 'Igual.']
];
var SV_TX = [
  ['blokki_happy', 'Blokki contento', 'Ya jugó hoy', '¡Racha a salvo! Nos vemos mañana', 'Streak saved! See you tomorrow'],
  ['blokki_wave', 'Blokki saludando', 'Frase normal', '¿Una partida?', 'Up for a game?'],
  ['blokki_worried', 'Blokki preocupado', 'Desde las 18:00 con racha sin jugar', '¡Tu racha está en peligro!', 'Your streak is in danger!'],
  ['blokki_sad', 'Blokki triste', 'Perdió la racha', 'Perdiste tu racha. ¡Empieza otra!', 'Streak lost. Let\'s start a new one!'],
  ['blokki_party', 'Blokki celebrando', 'Hitos de racha. {n} = días', '¡{n} días seguidos! ¡Leyenda!', '{n} days in a row! Legend!']
];
var SV_TIPS = 8;
var SV_NC = [['racha', 'Racha en riesgo', 'Tiene racha de 3+ y no jugó ayer'], ['dias2', '2 días sin jugar', ''], ['dias4', '3 a 5 días sin jugar', ''], ['dias7', '6 o más días sin jugar', ''], ['noche', 'Noche (22:00 en adelante)', ''], ['record', 'Récord a la vista', 'Solo si ya tiene un récord'], ['generico', 'Genérico', 'También es el respaldo si falta otra categoría']];
var SV_NMAX = 10, SV_NLEN = 120;
var SV = { d: {}, ap: null, saving: '', adDia: null };
function svSame(a, b) { function n(o) { return JSON.stringify(Object.keys(o).sort().map(function (k) { return [k, o[k] && typeof o[k] === 'object' ? Object.keys(o[k]).sort().map(function (j) { return [j, o[k][j]]; }) : o[k]]; })); } return n(a) === n(b); }
function svAdDia() { return SV.adDia != null ? SV.adDia : svAj().ad_en_diario === true; }
C.svAdDia = function (el) { SV.adDia = el.checked; };

function svRows() { var o = rm('servidor'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) ? o.rows : null; }
function svAj() { var r = svRows(); return (r && r.ajustes) || {}; }
function svTxS() { var r = svRows(); return (r && r.textos) || {}; }
function svNotis() { var r = svRows(); return (r && r.notis && typeof r.notis === 'object' && !Array.isArray(r.notis)) ? r.notis : {}; }
function svNList(n, l, c) { var v = n[l]; v = v && !Array.isArray(v) && typeof v === 'object' ? v[c] : null; return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }) : []; }
function svLibNow() { var r = svRows(); return (r && Array.isArray(r.liberar)) ? r.liberar : []; }
function svLibOn() { return SV.lib != null ? SV.lib : svLibNow().indexOf('queplan') >= 0; }
C.svLib = function (el) { SV.lib = el.checked; };
function svOffNow() { var r = svRows(); return (r && Array.isArray(r.apagado)) ? r.apagado : []; }
function svIsOff(k) { return SV.ap && k in SV.ap ? SV.ap[k] : svOffNow().indexOf(k) >= 0; }
function svDraft(id, srv) { return id in SV.d ? SV.d[id] : (srv == null ? '' : String(srv)); }
I.svIn = function (el) { SV.d[el.id] = el.value; };
C.svTog = function (el) { SV.ap = SV.ap || {}; SV.ap[el.dataset.k] = !el.checked; };

function svNumCard(title, icn, sub, spec, srvOf, pre, save, extra) {
  var h = '<div class="card sec"><div class="ch">' + ic(icn) + '<h3>' + esc(title) + '</h3><span class="sub grow">' + esc(sub) + '</span></div><div class="cb"><div class="grid g2">';
  spec.forEach(function (c) {
    var id = pre + c[0], cur = srvOf(c[0]);
    h += field(id, c[1], inp(id, svDraft(id, cur), { type: 'number', mode: 'numeric', min: c[2], ph: 'De fábrica: ' + nf(c[4]), di: 'svIn' }), 'Rango ' + nf(c[2]) + ' a ' + nf(c[3]) + ' ' + esc(c[5]) + '. ' + esc(c[6]) + (cur != null ? ' <b>Ahora:</b> ' + nf(cur) + '.' : ' <b>Ahora:</b> de fábrica.'));
  });
  h += '</div>' + (extra || '') + '<div class="row"><button class="btn pri" data-a="' + save + '"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === save ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Vacío = vuelve al valor de fábrica. Los teléfonos lo reciben en unos minutos (la app lo pide al abrirse y cada tanto).</span></div></div></div>';
  return h;
}

function vServidor() {
  var o = rm('servidor');
  var h = pageHead('Ajustes del juego', 'Mueve valores, apaga funciones y cambia frases de Blokki <b>sin sacar versión</b>. Solo datos; la app los valida y, si algo viene raro, usa el valor de fábrica. Necesita la app 1.0.8 o más nueva (las anteriores lo ignoran).', '<button class="btn" data-a="svReload">' + ic('refresh') + 'Recargar</button>',
    ['Cada tarjeta se guarda por separado. Un campo vacío vuelve al valor de fábrica.', 'Los <b>interruptores</b> son para emergencias (un abuso en el ranking, un poder con bug, una compra que falla). Apagar no borra nada: al encender, todo sigue como estaba.', 'Las <b>frases</b> solo aplican en <b>español e inglés</b>. Los demás idiomas siguen con el texto traducido de la app. Si dejas vacío un idioma, ese idioma usa el texto de la app.', 'Tocar a Blokki dos veces seguidas dice los <b>tips</b> en orden (Tip 1, Tip 2…).', 'Los mensajes a un jugador concreto se hacen en <b>Avisos</b> › «Solo para jugador(es)».']);
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.servidor, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 13-rank-envio.sql (el último de todos).') + '</div>' : rerr(o, 'los ajustes'));
  if (!svRows()) return h + skel(4);
  var r = svRows(), aj = svAj();
  // 1. Ajustes con rango
  var pod = '<h4 class="mt16" style="margin:16px 0 4px">Poderes con los que arranca cada partida</h4><p class="fnote">Cuántos usos de cada poder tiene el jugador al empezar una partida. 0 = ninguno.</p><div class="grid g2">' + SV_POD.map(function (p) {
    var id = 'sv_pod_' + p[0], cur = (aj.poderes_inicio || {})[p[0]];
    return field(id, p[1], inp(id, svDraft(id, cur), { type: 'number', mode: 'numeric', min: 0, ph: 'De fábrica: ' + p[2], di: 'svIn' }), 'Número de usos, de 0 a 5. ' + (cur != null ? '<b>Ahora:</b> ' + cur + '.' : '<b>Ahora:</b> de fábrica.'));
  }).join('') + '</div>';
  h += svNumCard('Valores del juego', 'sliders', 'Misiones, XP, reto diario, avisos', SV_AJ, function (k) { return aj[k]; }, 'sv_aj_', 'svSaveAj', pod);
  h += svNumCard('Anuncios entre partidas', 'zap', 'App 1.0.9 o más nueva', SV_AD, function (k) { return aj[k]; }, 'sv_ad_', 'svSaveAd',
    '<div class="row nw" style="align-items:flex-start;margin:4px 0 12px"><div class="grow"><b>También tras el reto diario</b><div class="xs mut">Apagado (de fábrica) = el reto diario nunca muestra anuncio ni suma a la cuenta. Encendido = cuenta como una partida más. <b>Ahora:</b> ' + (aj.ad_en_diario === true ? 'encendido' : 'apagado (de fábrica)') + '.</div></div>' + tog('sv_ad_diario', svAdDia(), 'Anuncio tras el reto diario', { dc: 'svAdDia', on: 'Sí', off: 'No' }) + '</div>' +
    '<div class="rule">' + ic('info') + '<div><b>Reglas que no se pueden cambiar desde aquí:</b> nunca sale un anuncio justo cuando toca pedir reseña, nunca con la app en segundo plano y nunca a quien compró «Sin anuncios». Las versiones anteriores a la 1.0.9 ignoran estos valores. Para guardar necesitas haber corrido <b>21-v109.sql</b> en Supabase.</div></div>');
  // 2. Envíos al ranking (admin_rank_envio, 13-rank-envio.sql)
  h += svNumCard('Envíos al ranking', 'trophy', 'A media partida (13-rank-envio.sql)', SV_RK, function (k) { return r[k]; }, 'sv_rk_', 'svSaveRk', '');
  // 3. Interruptores
  var nOff = SV_OFF.filter(function (x) { return svIsOff(x[0]); }).length;
  h += '<div class="card sec"><div class="ch">' + ic('pause') + '<h3>Interruptores</h3><span class="sub grow">' + (nOff ? plural(nOff, 'función apagada', 'funciones apagadas') + ' (los jugadores no la tienen)' : 'Todo encendido: todo funciona') + '</span></div><div class="cb"><div class="rule">' + ic('info') + '<div><b>Verde «Encendida» = la función funciona. Gris «Apagada» = desaparece o no se puede usar.</b> Usa estos interruptores solo en una emergencia; apagar no borra nada y al volver a encender todo sigue como estaba.</div></div><div class="col gap12">' +
    SV_OFF.map(function (x) { return '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>' + esc(x[1]) + '</b><div class="xs mut">' + esc(x[2]) + '</div></div>' + tog('sv_off_' + x[0], !svIsOff(x[0]), '', { dc: 'svTog', on: 'Encendida', off: 'Apagada' }).replace('<input ', '<input data-k="' + x[0] + '" ') + '</div>'; }).join('') +
    '</div><div class="row mt16"><button class="btn pri" data-a="svSaveAp"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveAp' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptores</button><span class="xs mut">Los teléfonos lo reciben en unos minutos (como máximo unos 15); sin internet usan lo último que supieron.</span></div></div></div>';
  // 4. Textos
  var tx = svTxS();
  var row = function (key, label, sub, dEs, dEn) {
    var s = tx[key] || {};
    return '<div class="f"><label>' + esc(label) + ' <span class="xs mut">· ' + esc(sub) + '</span></label><div class="grid g2">' +
      inp('sv_tx_' + key + '_es', svDraft('sv_tx_' + key + '_es', s.es), { max: 200, ph: 'Español (app: ' + dEs + ')', di: 'svIn' }) +
      inp('sv_tx_' + key + '_en', svDraft('sv_tx_' + key + '_en', s.en), { max: 200, ph: 'English (app: ' + dEn + ')', di: 'svIn' }) + '</div></div>';
  };
  h += '<div class="card sec"><div class="ch">' + ic('bell') + '<h3>Frases de Blokki y tips</h3><span class="sub grow">Español e inglés; el resto usa la app</span></div><div class="cb">' +
    SV_TX.map(function (t) { return row(t[0], t[1], t[2], t[3], t[4]); }).join('') +
    '<h4 style="margin:16px 0 8px">Tips (al tocar a Blokki por 2.ª vez, en orden)</h4>' +
    Array.apply(null, Array(SV_TIPS)).map(function (_, i) { return row('tip_' + (i + 1), 'Tip ' + (i + 1), 'vacío = no sale', '—', '—'); }).join('') +
    '<div class="row mt16"><button class="btn pri" data-a="svSaveTx"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveTx' ? '<span class="spin"></span>' : ic('check')) + 'Guardar frases</button><span class="xs mut">Máximo 200 caracteres. Frases cortas: caben en un globo chico. Vacío = usa la frase de la app.</span></div></div></div>';
  // 5. Notificaciones de Blokki (clave notis; formato de BlokkiNotifs.remotePool)
  var nt = svNotis();
  h += '<div class="card sec"><div class="ch">' + ic('bell') + '<h3>Notificaciones de Blokki</h3><span class="sub grow">Español e inglés, por situación</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Un mensaje por línea (hasta ' + SV_NMAX + ' por situación, ' + SV_NLEN + ' caracteres cada uno). Si una situación queda vacía usa «Genérico»; si todo queda vacío ese idioma usa los textos de la app. Los demás idiomas no cambian.</p>' +
    SV_NC.map(function (c) {
      return '<div class="f"><label>' + esc(c[1]) + (c[2] ? ' <span class="xs mut">· ' + esc(c[2]) + '</span>' : '') + '</label><div class="grid g2">' +
        ['es', 'en'].map(function (l) { var id = 'sv_nt_' + c[0] + '_' + l; return area(id, svDraft(id, svNList(nt, l, c[0]).join('\n')), { rows: 3, ph: l === 'es' ? 'Español, una por línea' : 'English, one per line', di: 'svIn' }); }).join('') + '</div></div>';
    }).join('') +
    '<div class="row mt16"><button class="btn pri" data-a="svSaveNt"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveNt' ? '<span class="spin"></span>' : ic('check')) + 'Guardar notificaciones</button><span class="xs mut">Aplican al reprogramar los avisos (al abrir la app).</span></div></div></div>';
  // 6. Liberar paquetes bloqueados hasta aviso
  h += '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Liberar paquetes</h3><span class="sub grow">' + (svLibOn() ? 'Qué Plan liberado' : 'Qué Plan bloqueado') + '</span></div><div class="cb"><div class="row nw" style="align-items:flex-start"><div class="grow"><b>Liberar «Qué Plan»</b><div class="xs mut">El paquete «Qué Plan» sale bloqueado en la app hasta que lo liberes aquí. Verde «Liberado» = los jugadores lo pueden usar; gris «Bloqueado» = no. Sirve para estrenar el paquete cuando tú quieras, sin versión nueva.</div></div>' +
    tog('sv_lib', svLibOn(), 'Qué Plan para todos los jugadores', { dc: 'svLib', on: 'Liberado', off: 'Bloqueado' }) + '</div><div class="row mt16"><button class="btn pri" data-a="svSaveLib"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveLib' ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button></div></div></div>';
  return h;
}
VIEWS['juego/servidor'] = vServidor;
A.svReload = function () { SV.d = {}; SV.ap = null; SV.lib = null; SV.adDia = null; rload('servidor'); rload('config'); toast('Recargando…', 'info'); };

/* ---------- validación (la misma que _srv_* en 14-servidor.sql) ---------- */
function svInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d+$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
var SV_LLEGA = 'Los teléfonos con la app 1.0.8 o más nueva lo reciben en unos minutos (como máximo unos 15); sin internet usan lo último que supieron. Las versiones anteriores lo ignoran.';
function svAsk(title, lines, ok) {
  return confirmDlg({ title: title, text: 'Esto afecta a todos los jugadores.', html: cbox(lines.concat([['A quién', 'A todos los jugadores con la app 1.0.8 o más nueva.'], ['Cuánto tarda', SV_LLEGA]])), ok: ok || 'Sí, guardar', icon: 'sliders' });
}
function svFmt(v, u) { return v == null ? 'de fábrica' : nf(v) + (u ? ' ' + esc(u) : ''); }
function svSave(name, fn) {
  if (SV.saving) return;
  SV.saving = name; paintPage();
  return Promise.resolve().then(fn).then(function () { rload('servidor', true); rload('config', true); }, function (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }).then(function () { SV.saving = ''; paintPage(); });
}

A.svSaveAj = async function () {
  var errs = {}, out = {}, srv = svAj(), pod = {};
  SV_AJ.forEach(function (c) {
    var id = 'sv_aj_' + c[0], raw = svDraft(id, srv[c[0]]);
    if (String(raw).trim() === '') return;
    var n = svInt(raw, c[2], c[3]);
    if (n == null) errs[id] = 'Un entero de ' + nf(c[2]) + ' a ' + nf(c[3]) + ', o vacío para el valor de fábrica.'; else out[c[0]] = n;
  });
  SV_POD.forEach(function (p) {
    var id = 'sv_pod_' + p[0], raw = svDraft(id, (srv.poderes_inicio || {})[p[0]]);
    if (String(raw).trim() === '') return;
    var n = svInt(raw, 0, 5);
    if (n == null) errs[id] = 'Un entero de 0 a 5, o vacío para el valor de fábrica.'; else pod[p[0]] = n;
  });
  if (!showErrs(errs)) return;
  if (Object.keys(pod).length) out.poderes_inicio = pod;
  SV_ADK.forEach(function (k) { if (srv[k] != null) out[k] = srv[k]; }); // los anuncios se guardan en su propia tarjeta
  if (svSame(out, srv)) { toast('No hay cambios', 'info'); return; }
  var dl = [];
  SV_AJ.forEach(function (c) { if (srv[c[0]] !== out[c[0]]) dl.push([c[1], svFmt(srv[c[0]], c[5]) + ' → <b>' + svFmt(out[c[0]], c[5]) + '</b>']); });
  SV_POD.forEach(function (c) { var a = (srv.poderes_inicio || {})[c[0]], b = (out.poderes_inicio || {})[c[0]]; if (a !== b) dl.push(['Poder inicial: ' + c[1], svFmt(a) + ' → <b>' + svFmt(b) + '</b>']); });
  if (!await svAsk('¿Guardar estos valores del juego?', dl)) return;
  svSave('svSaveAj', function () {
    return rpc('admin_servidor', { p_ajustes: out }).then(function (r) { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_(aj|pod)_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Valores guardados'); return r; });
  });
};

A.svSaveAd = async function () {
  var errs = {}, srv = svAj(), out = JSON.parse(JSON.stringify(srv));
  SV_AD.forEach(function (c) {
    var id = 'sv_ad_' + c[0], raw = svDraft(id, srv[c[0]]);
    if (String(raw).trim() === '') { delete out[c[0]]; return; }
    var n = svInt(raw, c[2], c[3]);
    if (n == null) errs[id] = 'Un entero de ' + nf(c[2]) + ' a ' + nf(c[3]) + ', o vacío para el valor de fábrica.'; else out[c[0]] = n;
  });
  if (!showErrs(errs)) return;
  var dia = svAdDia();
  if (dia) out.ad_en_diario = true; else delete out.ad_en_diario;
  if (svSame(out, srv)) { toast('No hay cambios', 'info'); return; }
  var dl = [];
  SV_AD.forEach(function (c) { if (srv[c[0]] !== out[c[0]]) dl.push([c[1], svFmt(srv[c[0]], c[5]) + ' → <b>' + svFmt(out[c[0]], c[5]) + '</b>']); });
  if ((srv.ad_en_diario === true) !== dia) dl.push(['Anuncio tras el reto diario', (srv.ad_en_diario === true ? 'Sí' : 'No') + ' → <b>' + (dia ? 'Sí' : 'No') + '</b>']);
  if (!await confirmDlg({ title: '¿Guardar los anuncios entre partidas?', text: 'Esto cambia cuántos anuncios ven todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 1.0.9 o más nueva.'], ['Cuánto tarda', 'Los teléfonos lo reciben en unos minutos (como máximo unos 15); sin internet usan lo último que supieron. Las versiones anteriores lo ignoran.']])), ok: 'Sí, guardar', icon: 'zap' })) return;
  svSave('svSaveAd', function () {
    return rpc('admin_servidor', { p_ajustes: out }).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_ad_/.test(k)) m[k] = SV.d[k]; return m; }, {}); SV.adDia = null; toast('Anuncios guardados'); });
  });
};

A.svSaveRk = async function () {
  var errs = {}, args = {}, r = svRows();
  SV_RK.forEach(function (c) {
    var id = 'sv_rk_' + c[0], raw = svDraft(id, r[c[0]]);
    if (String(raw).trim() === '') return;
    var n = svInt(raw, c[2], c[3]);
    if (n == null) errs[id] = 'Un entero de ' + nf(c[2]) + ' a ' + nf(c[3]) + '.';
    else if (n !== r[c[0]]) args[c[0] === 'rank_envio_umbral' ? 'p_umbral' : 'p_cada_seg'] = n;
  });
  if (!showErrs(errs)) return;
  if (!Object.keys(args).length) { toast('No hay cambios', 'info'); return; }
  var dl2 = SV_RK.filter(function (c) { return args[c[0] === 'rank_envio_umbral' ? 'p_umbral' : 'p_cada_seg'] != null; }).map(function (c) { return [c[1], svFmt(r[c[0]], c[5]) + ' → <b>' + svFmt(args[c[0] === 'rank_envio_umbral' ? 'p_umbral' : 'p_cada_seg'], c[5]) + '</b>']; });
  if (!await svAsk('¿Guardar los envíos al ranking?', dl2)) return;
  svSave('svSaveRk', function () {
    return rpc('admin_rank_envio', args).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_rk_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Envíos al ranking guardados'); });
  });
};

A.svSaveAp = async function () {
  var now = SV_OFF.map(function (x) { return x[0]; }).filter(svIsOff), before = svOffNow();
  var extra = before.filter(function (k) { return SV_OFF.every(function (x) { return x[0] !== k; }); }); // claves que este panel no conoce: se respetan
  var list = now.concat(extra), added = now.filter(function (k) { return before.indexOf(k) < 0; });
  if (list.slice().sort().join() === before.slice().sort().join()) { toast('No hay cambios', 'info'); return; }
  if (added.length && !await confirmDlg({ title: '¿Apagar ' + added.map(function (k) { return SV_OFF.filter(function (x) { return x[0] === k; })[0][1]; }).join(', ') + '?', text: 'La función deja de estar disponible para todos los jugadores con la app 1.0.8 o más nueva, en unos minutos (como máximo unos 15). Apagar no borra nada: se puede volver a encender en cualquier momento.', ok: 'Apagar', danger: true, icon: 'pause' })) return;
  svSave('svSaveAp', function () { return rpc('admin_servidor', { p_apagado: list }).then(function () { SV.ap = null; toast(list.length ? 'Interruptores guardados' : 'Todo encendido'); }); });
};

A.svSaveTx = async function () {
  var errs = {}, srv = svTxS(), out = JSON.parse(JSON.stringify(srv));
  var keys = SV_TX.map(function (t) { return t[0]; }).concat(Array.apply(null, Array(SV_TIPS)).map(function (_, i) { return 'tip_' + (i + 1); }));
  keys.forEach(function (k) {
    var langs = out[k] || {};
    ['es', 'en'].forEach(function (l) {
      var id = 'sv_tx_' + k + '_' + l, v = String(svDraft(id, (srv[k] || {})[l])).trim();
      if (v.length > 200) errs[id] = 'Máximo 200 caracteres (tiene ' + v.length + ').';
      if (v) langs[l] = v; else delete langs[l];
    });
    if (Object.keys(langs).length) out[k] = langs; else delete out[k];
  });
  if (!showErrs(errs)) return;
  if (JSON.stringify(out) === JSON.stringify(srv)) { toast('No hay cambios', 'info'); return; }
  var ch = keys.filter(function (k) { return JSON.stringify(out[k] || null) !== JSON.stringify(srv[k] || null); }).map(function (k) { var t = SV_TX.filter(function (x) { return x[0] === k; })[0]; return t ? t[1] : 'Tip ' + k.replace('tip_', ''); });
  if (!await svAsk('¿Guardar las frases de Blokki?', [['Frases que cambian', esc(ch.join(', '))], ['Qué pasa', 'Blokki dirá las frases nuevas en español e inglés. Una frase vacía vuelve a la del juego.']])) return;
  svSave('svSaveTx', function () {
    return rpc('admin_servidor', { p_textos: out }).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_tx_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Frases guardadas'); });
  });
};

A.svSaveNt = async function () {
  var errs = {}, srv = svNotis(), out = JSON.parse(JSON.stringify(srv));
  ['es', 'en'].forEach(function (l) {
    var langs = out[l] && !Array.isArray(out[l]) && typeof out[l] === 'object' ? out[l] : {};
    SV_NC.forEach(function (c) {
      var id = 'sv_nt_' + c[0] + '_' + l, raw = svDraft(id, svNList(srv, l, c[0]).join('\n'));
      var lines = String(raw).split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
      if (lines.length > SV_NMAX) errs[id] = 'Máximo ' + SV_NMAX + ' mensajes (tiene ' + lines.length + ').';
      else if (lines.some(function (x) { return x.length > SV_NLEN; })) errs[id] = 'Cada mensaje: máximo ' + SV_NLEN + ' caracteres.';
      if (lines.length) langs[c[0]] = lines; else delete langs[c[0]];
    });
    if (Object.keys(langs).length) out[l] = langs; else delete out[l];
  });
  if (!showErrs(errs)) return;
  if (JSON.stringify(out) === JSON.stringify(srv)) { toast('No hay cambios', 'info'); return; }
  var cn = SV_NC.filter(function (c) { return ['es', 'en'].some(function (l) { return JSON.stringify(svNList(out, l, c[0])) !== JSON.stringify(svNList(srv, l, c[0])); }); }).map(function (c) { return c[1]; });
  if (!await svAsk('¿Guardar las notificaciones de Blokki?', [['Situaciones que cambian', esc(cn.join(', '))], ['Qué pasa', 'Las notificaciones que recibe el jugador usarán estos mensajes. Se programan al abrir la app, así que cada jugador los ve la siguiente vez que abra Blokku.']])) return;
  svSave('svSaveNt', function () {
    return rpc('admin_servidor', { p_notis: out }).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_nt_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Notificaciones guardadas'); });
  });
};

A.svSaveLib = async function () {
  var before = svLibNow(), rest = before.filter(function (k) { return k !== 'queplan'; }), list = svLibOn() ? rest.concat('queplan') : rest;
  if (list.slice().sort().join() === before.slice().sort().join()) { toast('No hay cambios', 'info'); return; }
  if (!await svAsk(svLibOn() ? '¿Liberar «Qué Plan» para todos?' : '¿Volver a bloquear «Qué Plan»?', [['Qué pasa', svLibOn() ? 'El paquete «Qué Plan» queda <b>disponible</b> para todos los jugadores.' : 'El paquete «Qué Plan» vuelve a salir <b>bloqueado</b> para quien aún no lo tenga.']], svLibOn() ? 'Sí, liberar' : 'Sí, bloquear')) return;
  svSave('svSaveLib', function () { return rpc('admin_servidor', { p_liberar: list }).then(function () { SV.lib = null; toast(svLibOn() ? 'Qué Plan liberado' : 'Qué Plan bloqueado'); }); });
};

/* ================= AVISOS PARA JUGADORES CONCRETOS (avisos.jugadores, mis_avisos) ================= */
// El filtro es del servidor: config_remota nunca manda estos avisos; cada
// jugador los pide con su id y token del ranking. Estado del selector: AV.jug
// (ids), AV.jn (id → nombre) y AV.jr (resultados de la última búsqueda).
function avJugInit(ids) {
  AV.jug = (ids || []).slice(); AV.jn = {}; AV.jr = null; AV.jq = '';
  if (AV.jug.length) {
    rpc('admin_buscar_jugadores', { p_q: '', p_ids: AV.jug }, { nomiss: true }).then(function (r) {
      (r || []).forEach(function (j) { AV.jn[j.id] = j.nombre; }); avJugPaint();
    }, function (e) { if (e.code === 'sin_sql') { S.newSql.servidor = true; avJugPaint(); } });
  }
}
function avJugHtml() {
  if (S.newSql.servidor) return '<div class="ban bad" style="margin:0"><div class="tx"><b>Falta correr ' + esc(SQLF.servidor) + '</b>Sin él no se puede elegir jugadores, y un aviso así saldría para todos. Córrelo en Supabase (después de 13-rank-envio.sql).</div></div>';
  return '<div id="av_jsel" class="pkh" style="border:0;padding:0 0 8px"></div>' +
    '<input type="hidden" id="av_jug" value="' + esc(AV.jug.join(',')) + '">' +
    searchBox('pkq_avj', AV.jq, 'Buscar por nombre del ranking (2 letras o más)…', 'avJugQ') +
    '<div id="av_jr" class="mt8"></div>';
}
function avJugPaint() {
  var w = $('#av_jw'); if (!w) return;
  if (S.newSql.servidor) { w.innerHTML = avJugHtml(); return; }
  var s = $('#av_jsel'); if (!s) { w.innerHTML = avJugHtml(); s = $('#av_jsel'); }
  s.innerHTML = AV.jug.length ? AV.jug.map(function (id) { return '<button type="button" class="pkc" data-a="avJugDel" data-id="' + esc(id) + '" aria-label="Quitar ' + esc(AV.jn[id] || id) + '" style="padding:0 8px">' + esc(AV.jn[id] || id.slice(0, 8) + '…') + ic('x') + '</button>'; }).join('') : '<span class="mut" style="font-size:13px">Todos los jugadores (sin filtro)</span>';
  var hid = $('#av_jug'); if (hid) hid.value = AV.jug.join(',');
  var r = $('#av_jr'); if (!r) return;
  if (AV.jr == null) { r.innerHTML = ''; return; }
  r.innerHTML = AV.jr.length ? '<div class="pkl" style="border:1px solid var(--border);border-radius:10px">' + AV.jr.map(function (j) {
    var on = AV.jug.indexOf(j.id) >= 0;
    return '<button type="button" class="pkr" data-a="avJugAdd" data-id="' + esc(j.id) + '" data-n="' + esc(j.nombre) + '" aria-pressed="' + on + '"><span class="t">' + esc(j.nombre) + '<span>' + (j.pais ? esc(j.pais) + ' · ' : '') + 'visto ' + esc(relT(j.visto)) + (j.oculto ? ' · oculto' : '') + '</span></span><span class="ck">' + ic('check') + '</span></button>';
  }).join('') + '</div>' : '<div class="xs mut">Nadie con ese nombre.</div>';
}
I.avJugQ = debounce(function (el) {
  AV.jq = el.value; var q = el.value.trim();
  if (q.length < 2) { AV.jr = null; avJugPaint(); return; }
  var mine = AV.jseq = (AV.jseq || 0) + 1;
  rpc('admin_buscar_jugadores', { p_q: q }, { nomiss: true }).then(function (r) {
    if (mine !== AV.jseq) return; AV.jr = r || []; avJugPaint();
  }, function (e) { if (e.code === 'sin_sql') { S.newSql.servidor = true; avJugPaint(); } else toast(e.message, 'bad'); });
}, 250);
A.avJugAdd = function (el) {
  var id = el.dataset.id, i = AV.jug.indexOf(id);
  if (i >= 0) AV.jug.splice(i, 1);
  else { if (AV.jug.length >= 200) { toast('Máximo 200 jugadores por aviso', 'warn'); return; } AV.jug.push(id); AV.jn[id] = el.dataset.n; }
  avJugPaint();
};
A.avJugDel = function (el) { var i = AV.jug.indexOf(el.dataset.id); if (i >= 0) AV.jug.splice(i, 1); avJugPaint(); };
