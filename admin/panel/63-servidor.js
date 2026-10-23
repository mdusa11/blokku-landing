/* ================= AJUSTES DEL JUEGO (14-servidor.sql, app 1.0.8) ================= */
// Ajustes con rango, interruptores (kill switches) y frases de Blokki. Todo es
// dato: la app lo baja con la config remota y lo valida igual que aquí. Sin
// valor = el de fábrica de la app. Las reglas viven en lib/services/ajustes_remotos.dart.
var SV_AJ = [
  ['mision_premio_pct', 'Premio de las misiones diarias', 25, 300, 100, '%', 'XP que dan al reclamarlas. 150 = una vez y media.'],
  ['mision_meta_pct', 'Meta de las misiones diarias', 50, 200, 100, '%', 'Cuánto hay que hacer. 50 = la mitad (mínimo 1). Qué 3 misiones tocan cada día no cambia.'],
  ['xp_pct', 'XP por línea y por partida', 25, 300, 100, '%', 'Sube o baja el XP que da jugar (con el mismo tope de 3 000 por partida).'],
  ['reto_diario_seg', 'Duración del reto diario', 60, 600, 180, 'segundos', 'Las piezas y el tablero del día no cambian. Cámbialo SOLO entre días: si dos jugadores del mismo día tienen tiempos distintos, el ranking del día no es justo.'],
  ['aviso_sesion_min', 'Tiempo fuera para contar como sesión nueva', 5, 720, 30, 'minutos', 'Al volver a la app tras este tiempo, los avisos «siempre» y el siguiente modal vuelven a salir.'],
  ['refresco_min', 'Cada cuánto la app pide esta configuración', 5, 120, 15, 'minutos', 'Con la app abierta o al volver de segundo plano. Más bajo = cambios más rápidos, más peticiones.']
];
var SV_POD = [['bomb', 'Bomba', 1], ['lightning', 'Rayo', 1], ['undo', 'Deshacer', 2], ['shuffle', 'Mezclar', 2], ['picker', 'Gotero de color', 1]];
var SV_RK = [['rank_envio_umbral', 'Primer envío al ranking a media partida', 1000, 1000000, 10000, 'puntos', 'Desde cuántos puntos se manda el puntaje sin esperar al final.'], ['rank_envio_cada_seg', 'Segundos entre envíos a media partida', 10, 3600, 300, 'segundos', 'Solo si el puntaje mejora lo ya enviado.']];
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
var SV = { d: {}, ap: null, saving: '' };

function svRows() { var o = rm('servidor'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) ? o.rows : null; }
function svAj() { var r = svRows(); return (r && r.ajustes) || {}; }
function svTxS() { var r = svRows(); return (r && r.textos) || {}; }
function svOffNow() { var r = svRows(); return (r && Array.isArray(r.apagado)) ? r.apagado : []; }
function svIsOff(k) { return SV.ap && k in SV.ap ? SV.ap[k] : svOffNow().indexOf(k) >= 0; }
function svDraft(id, srv) { return id in SV.d ? SV.d[id] : (srv == null ? '' : String(srv)); }
I.svIn = function (el) { SV.d[el.id] = el.value; };
C.svTog = function (el) { SV.ap = SV.ap || {}; SV.ap[el.dataset.k] = el.checked; };

function svNumCard(title, icn, sub, spec, srvOf, pre, save, extra) {
  var h = '<div class="card sec"><div class="ch">' + ic(icn) + '<h3>' + esc(title) + '</h3><span class="sub grow">' + esc(sub) + '</span></div><div class="cb"><div class="grid g2">';
  spec.forEach(function (c) {
    var id = pre + c[0], cur = srvOf(c[0]);
    h += field(id, c[1], inp(id, svDraft(id, cur), { type: 'number', mode: 'numeric', min: c[2], ph: 'De fábrica: ' + nf(c[4]), di: 'svIn' }), 'Rango ' + nf(c[2]) + ' a ' + nf(c[3]) + ' ' + esc(c[5]) + '. ' + esc(c[6]) + (cur != null ? ' <b>Ahora:</b> ' + nf(cur) + '.' : ' <b>Ahora:</b> de fábrica.'));
  });
  h += '</div>' + (extra || '') + '<div class="row"><button class="btn pri" data-a="' + save + '"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === save ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Vacío = vuelve al valor de fábrica. Se aplica en minutos (la app lo baja al abrirse o cada tanto).</span></div></div></div>';
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
  var pod = '<h4 class="mt16" style="margin:16px 0 8px">Poderes con los que arranca cada partida</h4><div class="grid g2">' + SV_POD.map(function (p) {
    var id = 'sv_pod_' + p[0], cur = (aj.poderes_inicio || {})[p[0]];
    return field(id, p[1], inp(id, svDraft(id, cur), { type: 'number', mode: 'numeric', min: 0, ph: 'De fábrica: ' + p[2], di: 'svIn' }), '0 a 5. ' + (cur != null ? '<b>Ahora:</b> ' + cur + '.' : '<b>Ahora:</b> de fábrica.'));
  }).join('') + '</div>';
  h += svNumCard('Valores del juego', 'sliders', 'Misiones, XP, reto diario, avisos', SV_AJ, function (k) { return aj[k]; }, 'sv_aj_', 'svSaveAj', pod);
  // 2. Envíos al ranking (admin_rank_envio, 13-rank-envio.sql)
  h += svNumCard('Envíos al ranking', 'trophy', 'A media partida (13-rank-envio.sql)', SV_RK, function (k) { return r[k]; }, 'sv_rk_', 'svSaveRk', '');
  // 3. Interruptores
  var nOff = SV_OFF.filter(function (x) { return svIsOff(x[0]); }).length;
  h += '<div class="card sec"><div class="ch">' + ic('pause') + '<h3>Interruptores</h3><span class="sub grow">' + (nOff ? plural(nOff, 'función apagada', 'funciones apagadas') : 'Todo encendido') + '</span></div><div class="cb"><div class="col gap12">' +
    SV_OFF.map(function (x) { return '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>' + esc(x[1]) + '</b><div class="xs mut">' + esc(x[2]) + '</div></div>' + tog('sv_off_' + x[0], svIsOff(x[0]), 'Apagada', { dc: 'svTog' }).replace('<input ', '<input data-k="' + x[0] + '" ') + '</div>'; }).join('') +
    '</div><div class="row mt16"><button class="btn pri" data-a="svSaveAp"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveAp' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptores</button><span class="xs mut">Quien tenga la app abierta lo recibe en unos minutos; sin red usa lo último que supo.</span></div></div></div>';
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
    '<div class="row mt16"><button class="btn pri" data-a="svSaveTx"' + (SV.saving ? ' disabled' : '') + '>' + (SV.saving === 'svSaveTx' ? '<span class="spin"></span>' : ic('check')) + 'Guardar frases</button><span class="xs mut">Máximo 200 caracteres. Frases cortas: caben en un globo chico.</span></div></div></div>';
  return h;
}
VIEWS['juego/servidor'] = vServidor;
A.svReload = function () { SV.d = {}; SV.ap = null; rload('servidor'); rload('config'); toast('Recargando…', 'info'); };

/* ---------- validación (la misma que _srv_* en 14-servidor.sql) ---------- */
function svInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d+$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function svSave(name, fn) {
  if (SV.saving) return;
  SV.saving = name; paintPage();
  return Promise.resolve().then(fn).then(function () { rload('servidor', true); rload('config', true); }, function (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }).then(function () { SV.saving = ''; paintPage(); });
}

A.svSaveAj = function () {
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
  if (JSON.stringify(out) === JSON.stringify(srv)) { toast('No hay cambios', 'info'); return; }
  svSave('svSaveAj', function () {
    return rpc('admin_servidor', { p_ajustes: out }).then(function (r) { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_(aj|pod)_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Valores guardados'); return r; });
  });
};

A.svSaveRk = function () {
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
  svSave('svSaveRk', function () {
    return rpc('admin_rank_envio', args).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_rk_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Envíos al ranking guardados'); });
  });
};

A.svSaveAp = async function () {
  var now = SV_OFF.map(function (x) { return x[0]; }).filter(svIsOff), before = svOffNow();
  var extra = before.filter(function (k) { return SV_OFF.every(function (x) { return x[0] !== k; }); }); // claves que este panel no conoce: se respetan
  var list = now.concat(extra), added = now.filter(function (k) { return before.indexOf(k) < 0; });
  if (list.slice().sort().join() === before.slice().sort().join()) { toast('No hay cambios', 'info'); return; }
  if (added.length && !await confirmDlg({ title: '¿Apagar ' + added.map(function (k) { return SV_OFF.filter(function (x) { return x[0] === k; })[0][1]; }).join(', ') + '?', text: 'Los jugadores con la app 1.0.8 o más nueva lo notan en unos minutos. Se puede volver a encender en cualquier momento.', ok: 'Apagar', danger: true, icon: 'pause' })) return;
  svSave('svSaveAp', function () { return rpc('admin_servidor', { p_apagado: list }).then(function () { SV.ap = null; toast(list.length ? 'Interruptores guardados' : 'Todo encendido'); }); });
};

A.svSaveTx = function () {
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
  svSave('svSaveTx', function () {
    return rpc('admin_servidor', { p_textos: out }).then(function () { SV.d = Object.keys(SV.d).reduce(function (m, k) { if (!/^sv_tx_/.test(k)) m[k] = SV.d[k]; return m; }, {}); toast('Frases guardadas'); });
  });
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
