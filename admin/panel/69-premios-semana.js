/* ================= PREMIOS SEMANALES (27-premios-semana.sql, app 2.0) ================= */
// Premios por lugar del ranking semanal. Todo por admin_premios_semana(p_clave, p_accion, p_datos):
// sin acción solo lee {config, actual, semanas, detalle, stats, tienda_semanal}.
//   'config'     {activo?, modos?, tramos?, gracia_horas?, min_jugadores?}
//   'semana'     {modo, semana}                 → también devuelve `detalle` (ganadores)
//   'anular'     {modo, semana, id, nota?}      'reentregar' {modo, semana, id}
//   'otorgar'    {modo, semana, id, puesto, nota?}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.psem = '27-premios-semana.sql';
FNF.admin_premios_semana = 'psem';
RFN.psem = 'admin_premios_semana';
N20['juego/premios-semana'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/premios-semana'; })) g.items.push(['juego/premios-semana', 'Premios semanales', 'trophy']);
  ROUTES['juego/premios-semana'] = { t: 'Premios semanales', ic: 'trophy', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/premios-semana'] = {
  que: 'Premios por lugar del ranking semanal: al cerrar cada semana los mejores de Clásico (y de Contrarreloj si lo enciendes) ganan Bloques, protectores de racha, una insignia del año («Campeón semanal», «Podio», «Top 10») y el 1.º un título «Campeón de la semana» que dura una semana.',
  ve: 'Sobre el ranking semanal, una franja «Premios de esta semana» con lo que gana cada lugar y cuánto falta para el cierre; al tocarla, los premios por lugar y los campeones de semanas pasadas. Al abrir la app después del cierre, un cofre «¡Quedaste 3.º la semana pasada!».',
  cuando: 'Enciéndelo cuando quieras empezar a premiar (lo que ya cerró antes no se premia). Revisa cada lunes «Semanas cerradas» por si hay que anular a alguien o dar un premio a mano.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Apagado o sin el SQL, la app no enseña nada.',
    '<b>Cierre:</b> la semana (la misma del ranking) se cierra el <b>lunes a las 00:00, hora de la Ciudad de México</b>, más las horas de gracia que pongas (0 de fábrica). La primera persona que abre la app o el ranking después de esa hora dispara el cierre; correrlo dos veces no reparte dos veces.',
    '<b>Quién gana:</b> solo puntajes que NO están marcados como sospechosos, de jugadores NO ocultos, guardados antes del cierre. La tabla se congela al cerrar: aprobar después un sospechoso no le da premio (usa «Dar premio a mano»). Si esa semana jugaron menos del mínimo de jugadores, no se reparte nada.',
    '<b>Premios por lugar:</b> hasta 12 tramos, hasta el lugar 500, con máximo 20,000 Bloques y 3 protectores por tramo. Cambiarlos afecta a las semanas que cierren después; las cerradas guardan lo que daban.',
    '<b>Bloques:</b> llegan a la cartera de la tienda. Al encender esto, el premio semanal viejo de la tienda (solo Bloques) se pone en 0 para no pagar dos veces; al apagarlo vuelve a sus valores. Los protectores respetan el máximo que se puede guardar.',
    '<b>Anular:</b> si aún no lo abría, ya no le sale el cofre. Si ya lo abrió, se le quitan los Bloques que todavía tenga (la insignia ya está en su teléfono). <b>Reentregar</b> devuelve un premio anulado a «pendiente».',
    '<b>Cuánto tarda:</b> la app revisa los premios al abrirse y cada pocos minutos; la franja guarda los tramos 15 minutos.',
    H_HORA
  ]
};

var PS = { d: {}, saving: '', tramos: null, det: null, otorgar: {} };
var PS_INS = [['', 'Sin insignia'], ['campeon', 'Campeón semanal'], ['podio', 'Podio'], ['top10', 'Top 10']];
var PS_MODO = { clasico: 'Clásico', reloj: 'Contrarreloj' };

function psRows() { var o = rm('psem'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function psDraft(id, srv) { return id in PS.d ? PS.d[id] : (srv == null ? '' : String(srv)); }
function psLugar(t) { return t.desde === t.hasta ? '#' + t.desde : '#' + t.desde + '–' + t.hasta; }
function psPremio(t) {
  var p = [];
  if (t.bloques) p.push(nf(t.bloques) + ' Bloques');
  if (t.protectores) p.push(t.protectores + (t.protectores === 1 ? ' protector' : ' protectores'));
  if (t.insignia) p.push('insignia «' + (PS_INS.filter(function (x) { return x[0] === t.insignia; })[0] || [0, t.insignia])[1] + '»');
  if (t.titulo) p.push('título «Campeón de la semana»');
  return p.length ? p.join(' · ') : 'nada';
}
I.psIn = function (el) { PS.d[el.id] = el.value; };
C.psTog = function (el) { PS.d[el.id] = el.checked; };
A.psReload = function () { PS.d = {}; PS.tramos = null; PS.det = null; rload('psem'); toast('Recargando…', 'info'); };

function psKpis(r) {
  var s = r.stats || {}, c = r.config;
  return '<div class="kpis">' +
    kpi('trophy', 'Estado', c.activo ? 'Encendido' : 'Apagado', c.activo ? 'Premia ' + c.modos.map(function (m) { return PS_MODO[m]; }).join(' y ') : 'La app no enseña nada') +
    kpi('clock', 'Esta semana cierra', esc(fdt(r.actual.cierra)), 'Semana ' + esc(r.actual.semana) + ' · ' + esc(relT(r.actual.cierra))) +
    kpi('gift', 'Premios entregados', nf(s.entregados), nf(s.pendientes) + ' por abrir · ' + nf(s.anulados) + ' anulados · ' + nf(s.manuales) + ' a mano') +
    kpi('store', 'Bloques repartidos', nf(s.bloques), nf(s.bloques_retirados) + ' retirados al anular · ' + nf(s.protectores) + ' protectores') +
    kpi('user', 'Ganadores distintos', nf(s.jugadores), nf(s.semanas) + ' semanas cerradas') + '</div>';
}

function psConfig(r) {
  var c = r.config, on = 'ps_activo' in PS.d ? PS.d.ps_activo : c.activo;
  var mc = 'ps_m_clasico' in PS.d ? PS.d.ps_m_clasico : c.modos.indexOf('clasico') >= 0;
  var mr = 'ps_m_reloj' in PS.d ? PS.d.ps_m_reloj : c.modos.indexOf('reloj') >= 0;
  var ts = r.tienda_semanal || {}, viejo = Object.keys(ts).some(function (k) { return ts[k] > 0; });
  var h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptor y reglas</h3><span class="sub grow">' + (c.activo ? 'Encendido' : 'Apagado (de fábrica)') + '</span></div><div class="cb">';
  h += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>Premios semanales</b><div class="xs mut">Al encender, solo se premian las semanas que cierren de aquí en adelante.</div></div>' + tog('ps_activo', on, 'Premios semanales', { dc: 'psTog' }) + '</div>';
  h += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>Clásico</b><div class="xs mut">Ranking semanal de Clásico.</div></div>' + tog('ps_m_clasico', mc, 'Clásico', { dc: 'psTog', on: 'Premia', off: 'No premia' }) + '</div>';
  h += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>Contrarreloj</b><div class="xs mut">Ranking semanal de Contrarreloj (recién encendido, empieza con la semana en curso).</div></div>' + tog('ps_m_reloj', mr, 'Contrarreloj', { dc: 'psTog', on: 'Premia', off: 'No premia' }) + '</div>';
  h += '<div class="grid g2">' +
    field('ps_min', 'Jugadores mínimos en la semana', inp('ps_min', psDraft('ps_min', c.min_jugadores), { type: 'number', mode: 'numeric', min: 1, di: 'psIn' }), 'Entero de 1 a 1,000. Con menos jugadores esa semana no se reparte nada. <b>Ahora:</b> ' + nf(c.min_jugadores) + '.') +
    field('ps_gracia', 'Horas de gracia después del lunes 00:00 (CDMX)', inp('ps_gracia', psDraft('ps_gracia', c.gracia_horas), { type: 'number', mode: 'numeric', min: 0, di: 'psIn' }), 'Entero de 0 a 12. Sirve para quien juega al oeste de México (su domingo termina más tarde). <b>Ahora:</b> ' + nf(c.gracia_horas) + '.') +
    '</div>';
  h += '<div class="rule">' + ic('info') + '<div>Premio semanal viejo de la tienda (solo Bloques): ' + (viejo ? '<b>todavía paga</b> (' + Object.keys(ts).map(function (k) { return esc(k) + ' ' + nf(ts[k]); }).join(', ') + '). Al encender esto se pone en 0 solo.' : 'en 0 (lo reemplaza esto).') + '</div></div>';
  return h + '<div class="row mt16"><button class="btn pri" data-a="psSaveCfg"' + (PS.saving ? ' disabled' : '') + '>' + (PS.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div></div></div>';
}

A.psSaveCfg = async function () {
  if (PS.saving) return;
  var r = psRows(); if (!r) return;
  var c = r.config, ch = {}, dl = [], errs = {};
  var on = 'ps_activo' in PS.d ? PS.d.ps_activo : c.activo;
  var modos = [];
  if ('ps_m_clasico' in PS.d ? PS.d.ps_m_clasico : c.modos.indexOf('clasico') >= 0) modos.push('clasico');
  if ('ps_m_reloj' in PS.d ? PS.d.ps_m_reloj : c.modos.indexOf('reloj') >= 0) modos.push('reloj');
  var mn = String(psDraft('ps_min', c.min_jugadores)).trim(), gr = String(psDraft('ps_gracia', c.gracia_horas)).trim();
  if (!/^\d+$/.test(mn) || +mn < 1 || +mn > 1000) errs.ps_min = 'Un entero de 1 a 1,000.';
  if (!/^\d+$/.test(gr) || +gr > 12) errs.ps_gracia = 'Un entero de 0 a 12.';
  if (!showErrs(errs)) return;
  if (!modos.length) { toast('Elige al menos un modo', 'warn'); return; }
  if (on !== c.activo) { ch.activo = on; dl.push(['Premios semanales', (c.activo ? 'Encendido' : 'Apagado') + ' → <b>' + (on ? 'Encendido' : 'Apagado') + '</b>']); }
  if (modos.join() !== c.modos.join()) { ch.modos = modos; dl.push(['Modos', c.modos.map(function (m) { return PS_MODO[m]; }).join(' y ') + ' → <b>' + modos.map(function (m) { return PS_MODO[m]; }).join(' y ') + '</b>']); }
  if (+mn !== c.min_jugadores) { ch.min_jugadores = +mn; dl.push(['Jugadores mínimos', nf(c.min_jugadores) + ' → <b>' + nf(+mn) + '</b>']); }
  if (+gr !== c.gracia_horas) { ch.gracia_horas = +gr; dl.push(['Horas de gracia', nf(c.gracia_horas) + ' → <b>' + nf(+gr) + '</b>']); }
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  if (ch.activo === true) dl.push(['Tienda', 'El premio semanal viejo de la tienda (solo Bloques) se pone en 0 para no pagar dos veces.']);
  if (ch.activo === false) dl.push(['Tienda', 'El premio semanal viejo de la tienda vuelve a sus valores. Los premios ya ganados y no abiertos quedan esperando hasta que lo vuelvas a encender.']);
  var ok = await confirmDlg({ title: ch.activo === false ? '¿Apagar los premios semanales?' : ch.activo ? '¿Encender los premios semanales?' : '¿Guardar las reglas?', text: 'Esto afecta a todos los jugadores con la app 2.0.', html: cbox(dl.concat([['Cuánto tarda', 'La app revisa al abrirse; la franja del ranking guarda los datos 15 minutos.']])), ok: ch.activo === false ? 'Apagar' : 'Sí, guardar', danger: ch.activo === false, icon: 'trophy' });
  if (!ok) return;
  PS.saving = 'cfg'; paintPage();
  try { await rpc('admin_premios_semana', { p_accion: 'config', p_datos: ch }); PS.d = {}; toast('Premios semanales actualizados'); await rload('psem', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  PS.saving = ''; paintPage();
};

/* ---- tramos ---- */
function psTramosDraft(r) { if (!PS.tramos) PS.tramos = JSON.parse(JSON.stringify(r.config.tramos || [])); return PS.tramos; }
function psTramos(r) {
  var l = psTramosDraft(r);
  var h = '<div class="card sec"><div class="ch">' + ic('sliders') + '<h3>Premios por lugar</h3><span class="sub grow">' + plural(l.length, 'tramo', 'tramos') + '</span></div><div class="cb">';
  h += '<p class="xs mut" style="margin:0 0 12px">Cada tramo es un rango de lugares (sin encimarse). Hasta 12 tramos y hasta el lugar 500; máximo 20,000 Bloques y 3 protectores por tramo. Lo que cambies aplica a las semanas que cierren después.</p>';
  if (l.length) {
    h += '<div class="tw"><table class="tbl"><thead><tr><th>Desde</th><th>Hasta</th><th>Bloques</th><th>Protectores</th><th>Insignia</th><th>Título</th><th></th></tr></thead><tbody>';
    l.forEach(function (t, i) {
      h += '<tr><td>' + inp('ps_t_desde_' + i, t.desde, { type: 'number', min: 1, di: 'psTr', mode: 'numeric' }) + '</td><td>' + inp('ps_t_hasta_' + i, t.hasta, { type: 'number', min: 1, di: 'psTr', mode: 'numeric' }) + '</td>' +
        '<td>' + inp('ps_t_bloques_' + i, t.bloques, { type: 'number', min: 0, di: 'psTr', mode: 'numeric' }) + '</td><td>' + inp('ps_t_protectores_' + i, t.protectores, { type: 'number', min: 0, di: 'psTr', mode: 'numeric' }) + '</td>' +
        '<td>' + sel('ps_t_insignia_' + i, t.insignia, PS_INS, { dc: 'psTrSel' }) + '</td><td>' + tog('ps_t_titulo_' + i, !!t.titulo, '', { dc: 'psTrTog', on: 'Sí', off: 'No' }) + '</td>' +
        '<td class="num"><button class="btn sm ghost" data-a="psTrDel" data-i="' + i + '" aria-label="Quitar tramo">' + ic('trash') + '</button></td></tr>';
    });
    h += '</tbody></table></div>';
  } else h += '<p class="mut">Sin tramos no se reparte nada.</p>';
  return h + '<div class="row mt16"><button class="btn" data-a="psTrAdd"' + (l.length >= 12 ? ' disabled' : '') + '>' + ic('plus') + 'Agregar tramo</button><button class="btn pri" data-a="psTrSave"' + (PS.saving ? ' disabled' : '') + '>' + (PS.saving === 'tramos' ? '<span class="spin"></span>' : ic('check')) + 'Guardar premios</button><button class="btn ghost" data-a="psTrReset">Deshacer cambios</button></div></div></div>';
}
function psTrIdx(id) { var m = /^ps_t_([a-z]+)_(\d+)$/.exec(id); return m ? [m[1], Number(m[2])] : null; }
I.psTr = function (el) { var k = psTrIdx(el.id); if (k && PS.tramos[k[1]]) PS.tramos[k[1]][k[0]] = el.value; };
C.psTrSel = function (el) { var k = psTrIdx(el.id); if (k && PS.tramos[k[1]]) PS.tramos[k[1]].insignia = el.value; };
C.psTrTog = function (el) { var k = psTrIdx(el.id); if (k && PS.tramos[k[1]]) PS.tramos[k[1]].titulo = el.checked; };
A.psTrAdd = function () {
  var r = psRows(); if (!r) return;
  var l = psTramosDraft(r), last = l.length ? Number(l[l.length - 1].hasta) || 0 : 0;
  l.push({ desde: last + 1, hasta: Math.min(500, last + 10), bloques: 0, protectores: 0, insignia: '', titulo: false });
  paintPage();
};
A.psTrDel = function (el) { PS.tramos.splice(Number(el.dataset.i), 1); paintPage(); };
A.psTrReset = function () { PS.tramos = null; paintPage(); };
A.psTrSave = async function () {
  if (PS.saving) return;
  var r = psRows(); if (!r) return;
  var l = psTramosDraft(r), out = [], errs = {}, prev = 0;
  function int(v, lo, hi) { var t = String(v == null ? '' : v).trim(); return /^\d+$/.test(t) && +t >= lo && +t <= hi ? +t : null; }
  l.forEach(function (t, i) {
    var d = int(t.desde, 1, 500), h = int(t.hasta, 1, 500), b = int(t.bloques, 0, 20000), p = int(t.protectores, 0, 3);
    if (d == null) errs['ps_t_desde_' + i] = '1 a 500';
    if (h == null || (d != null && h < d)) errs['ps_t_hasta_' + i] = '≥ desde, hasta 500';
    if (b == null) errs['ps_t_bloques_' + i] = '0 a 20,000';
    if (p == null) errs['ps_t_protectores_' + i] = '0 a 3';
    out.push({ desde: d, hasta: h, bloques: b, protectores: p, insignia: t.insignia || '', titulo: !!t.titulo });
  });
  if (Object.keys(errs).length) { toast('Revisa los tramos marcados', 'warn'); Object.keys(errs).forEach(function (k) { var e = document.getElementById(k); if (e) e.classList.add('bad'); }); return; }
  out.sort(function (a, b) { return a.desde - b.desde; });
  for (var i = 0; i < out.length; i++) { if (out[i].desde <= prev) { toast('Los tramos se enciman en el lugar ' + out[i].desde, 'warn'); return; } prev = out[i].hasta; }
  if (out.length > 12) { toast('Como mucho 12 tramos', 'warn'); return; }
  var antes = (r.config.tramos || []).map(function (t) { return psLugar(t) + ': ' + psPremio(t); }).join('<br>') || 'nada';
  var despues = out.map(function (t) { return psLugar(t) + ': ' + psPremio(t); }).join('<br>') || 'nada';
  if (antes === despues) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: '¿Guardar los premios por lugar?', text: 'Aplica a las semanas que cierren de aquí en adelante.', html: cbox([['Antes', antes], ['Después', '<b>' + despues + '</b>'], ['Semanas cerradas', 'No cambian: guardan lo que daban.']]), ok: 'Sí, guardar', icon: 'trophy' });
  if (!ok) return;
  PS.saving = 'tramos'; paintPage();
  try { await rpc('admin_premios_semana', { p_accion: 'config', p_datos: { tramos: out } }); PS.tramos = null; toast('Premios guardados'); await rload('psem', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  PS.saving = ''; paintPage();
};

/* ---- semanas cerradas y ganadores ---- */
function psSemanas(r) {
  var l = r.semanas || [];
  var h = '<div class="card sec"><div class="ch">' + ic('star') + '<h3>Semanas cerradas</h3><span class="sub grow">' + (l.length ? 'Las últimas ' + nf(l.length) : 'Ninguna todavía') + '</span></div>';
  if (!l.length) return h + '<div class="cb"><p class="mut">Cuando cierre la primera semana con la función encendida, aparecerá aquí con sus ganadores.</p></div></div>';
  h += '<div class="tw"><table class="tbl"><thead><tr><th>Semana</th><th>Modo</th><th>Cerró</th><th>Campeón</th><th class="num">Jugadores</th><th class="num">Premiados</th><th class="num">Abiertos</th><th class="num">Por abrir</th><th class="num">Anulados</th><th></th></tr></thead><tbody>';
  l.forEach(function (s) {
    h += '<tr><td class="mono">' + esc(s.semana) + '</td><td>' + esc(PS_MODO[s.modo] || s.modo) + '</td><td>' + esc(fdt(s.cerrada)) + '</td><td>' + (s.campeon ? esc(s.campeon) : (s.premiados ? '—' : chip('Sin reparto', 'warn'))) + '</td><td class="num">' + nf(s.jugadores) + '</td><td class="num">' + nf(s.premiados) + '</td><td class="num">' + nf(s.entregados) + '</td><td class="num">' + nf(s.pendientes) + '</td><td class="num">' + nf(s.anulados) + '</td>' +
      '<td class="num"><button class="btn sm" data-a="psVer" data-m="' + esc(s.modo) + '" data-s="' + esc(s.semana) + '">' + ic('eye') + 'Ganadores</button></td></tr>';
  });
  return h + '</tbody></table></div><div class="cb"><span class="xs mut">«Sin reparto» = esa semana jugaron menos del mínimo de jugadores.</span></div></div>';
}
A.psVer = async function (el) {
  PS.saving = 'ver'; paintPage();
  try { var x = await rpc('admin_premios_semana', { p_accion: 'semana', p_datos: { modo: el.dataset.m, semana: el.dataset.s } }); PS.det = x.detalle; var cur = RM.psem; if (cur) { cur.rows = x; cur.t = Date.now(); } }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  PS.saving = ''; paintPage();
  var c = document.getElementById('ps_det'); if (c && c.scrollIntoView) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function psDetalle() {
  var d = PS.det; if (!d) return '';
  var est = { pendiente: ['Por abrir', ''], entregado: ['Abierto', 'ok'], anulado: ['Anulado', 'bad'] };
  var h = '<div class="card sec" id="ps_det"><div class="ch">' + ic('trophy') + '<h3>Ganadores · ' + esc(PS_MODO[d.modo] || d.modo) + ' ' + esc(d.semana) + '</h3><span class="sub grow">' + plural((d.filas || []).length, 'premio', 'premios') + '</span><button class="btn sm ghost" data-a="psDetClose">' + ic('x') + 'Cerrar</button></div>';
  var l = d.filas || [];
  if (l.length) {
    h += '<div class="tw"><table class="tbl"><thead><tr><th>#</th><th>Jugador</th><th class="num">Puntos</th><th>Premio</th><th>Estado</th><th></th></tr></thead><tbody>';
    l.forEach(function (g) {
      var e = est[g.estado] || [g.estado, ''];
      h += '<tr><td>' + nf(g.puesto) + '</td><td><b>' + esc(g.nombre_hoy || g.nombre) + '</b>' + (g.pais ? ' <span class="xs mut">' + esc(g.pais) + '</span>' : '') + (g.oculto ? ' ' + chip('Oculto', 'warn') : '') + (g.manual ? ' ' + chip('A mano', '') : '') + (g.nota ? '<div class="xs mut">' + esc(g.nota) + '</div>' : '') + '</td><td class="num">' + nf(g.puntos) + '</td>' +
        '<td class="xs">' + esc(psPremio(g)) + (g.estado === 'entregado' ? '<div class="mut">Pagado: ' + nf(g.bloques_pagados) + ' Bloques · ' + nf(g.protectores_dados) + ' protectores</div>' : '') + '</td><td>' + chip(e[0], e[1]) + '</td>' +
        '<td class="num">' + (g.estado === 'anulado'
          ? '<button class="btn sm" data-a="psReentregar" data-id="' + esc(g.id) + '">' + ic('refresh') + 'Reentregar</button>'
          : '<button class="btn sm ghost" data-a="psAnular" data-id="' + esc(g.id) + '">' + ic('trash') + 'Anular</button>') + '</td></tr>';
    });
    h += '</tbody></table></div>';
  } else h += '<div class="cb"><p class="mut">Esta semana no tiene premios.</p></div>';
  h += '<div class="cb"><h4 style="margin:6px 0 8px">Dar premio a mano</h4><p class="xs mut" style="margin:0 0 10px">Por ejemplo, a un puntaje sospechoso que aprobaste después del cierre. Recibe lo que da HOY el tramo de ese lugar. Busca su id en Ranking o Cuentas.</p><div class="grid g2">' +
    field('ps_o_id', 'Id del jugador', inp('ps_o_id', PS.otorgar.id || '', { di: 'psOt', ph: '00000000-0000-…' })) +
    field('ps_o_puesto', 'Lugar', inp('ps_o_puesto', PS.otorgar.puesto || '', { type: 'number', min: 1, mode: 'numeric', di: 'psOt' })) +
    field('ps_o_nota', 'Nota (opcional)', inp('ps_o_nota', PS.otorgar.nota || '', { max: 200, di: 'psOt', ph: 'Sospechoso aprobado el lunes' })) +
    '</div><div class="row"><button class="btn" data-a="psOtorgar"' + (PS.saving ? ' disabled' : '') + '>' + ic('gift') + 'Dar premio</button></div></div>';
  return h + '</div>';
}
I.psOt = function (el) { PS.otorgar[el.id.replace('ps_o_', '')] = el.value; };
A.psDetClose = function () { PS.det = null; paintPage(); };

async function psAccion(acc, datos, okMsg) {
  PS.saving = acc; paintPage();
  try {
    var x = await rpc('admin_premios_semana', { p_accion: acc, p_datos: datos });
    PS.det = x.detalle; var cur = RM.psem; if (cur) { cur.rows = x; cur.t = Date.now(); }
    toast(okMsg); PS.saving = ''; paintPage(); return true;
  } catch (e) { toast('No se pudo: ' + e.message, 'bad'); PS.saving = ''; paintPage(); return false; }
}
function psFila(id) { return ((PS.det || {}).filas || []).filter(function (g) { return g.id === id; })[0]; }
A.psAnular = async function (el) {
  var d = PS.det, g = psFila(el.dataset.id); if (!d || !g) return;
  var ok = await confirmDlg({ title: '¿Anular el premio de ' + (g.nombre_hoy || g.nombre) + '?', text: g.estado === 'entregado' ? 'Ya lo abrió: se le quitan los Bloques que todavía tenga (hasta ' + nf(g.bloques_pagados) + '). La insignia se queda en su teléfono.' : 'Aún no lo abría: ya no le saldrá el cofre.', html: cbox([['Semana', esc(d.semana) + ' · ' + esc(PS_MODO[d.modo])], ['Lugar', '#' + nf(g.puesto)], ['Premio', esc(psPremio(g))]]), ok: 'Anular', danger: true, icon: 'trash' });
  if (!ok) return;
  psAccion('anular', { modo: d.modo, semana: d.semana, id: g.id }, 'Premio anulado');
};
A.psReentregar = async function (el) {
  var d = PS.det, g = psFila(el.dataset.id); if (!d || !g) return;
  var ok = await confirmDlg({ title: '¿Reentregar el premio de ' + (g.nombre_hoy || g.nombre) + '?', text: 'Vuelve a «por abrir»: le saldrá el cofre al abrir la app y se le paga otra vez.', html: cbox([['Semana', esc(d.semana) + ' · ' + esc(PS_MODO[d.modo])], ['Premio', esc(psPremio(g))]]), ok: 'Sí, reentregar', icon: 'refresh' });
  if (!ok) return;
  psAccion('reentregar', { modo: d.modo, semana: d.semana, id: g.id }, 'Premio reentregado');
};
A.psOtorgar = async function () {
  var d = PS.det, r = psRows(); if (!d || !r) return;
  var id = String(PS.otorgar.id || '').trim(), pu = String(PS.otorgar.puesto || '').trim(), errs = {};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) errs.ps_o_id = 'Un id de jugador (uuid).';
  if (!/^\d+$/.test(pu) || +pu < 1 || +pu > 500) errs.ps_o_puesto = 'Un lugar de 1 a 500.';
  if (!showErrs(errs)) return;
  var t = (r.config.tramos || []).filter(function (x) { return +pu >= x.desde && +pu <= x.hasta; })[0];
  if (!t) { showErrs({ ps_o_puesto: 'Ese lugar no tiene premio en los tramos de hoy.' }); return; }
  var ok = await confirmDlg({ title: '¿Dar este premio a mano?', text: 'Le saldrá el cofre la próxima vez que abra la app.', html: cbox([['Semana', esc(d.semana) + ' · ' + esc(PS_MODO[d.modo])], ['Jugador', '<span class="mono">' + esc(id) + '</span>'], ['Lugar', '#' + nf(+pu)], ['Premio', esc(psPremio(t))]]), ok: 'Sí, dar premio', icon: 'gift' });
  if (!ok) return;
  if (await psAccion('otorgar', { modo: d.modo, semana: d.semana, id: id, puesto: +pu, nota: String(PS.otorgar.nota || '').trim() }, 'Premio otorgado')) PS.otorgar = {};
};

function vPremiosSemana() {
  var o = rm('psem');
  var h = pageHead('Premios semanales', 'Premios por lugar del <b>ranking semanal</b>: Bloques, protectores, insignia del año y título de una semana para el 1.º. Necesita la app 2.0 o más nueva.', '<button class="btn" data-a="psReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.psem, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 19-tienda.sql; solo crea cosas nuevas y nace apagado.') + '</div>' : rerr(o, 'los premios semanales'));
  var r = psRows();
  if (!r) return h + skel(4);
  return h + psKpis(r) + psConfig(r) + psTramos(r) + psDetalle() + psSemanas(r);
}
VIEWS['juego/premios-semana'] = vPremiosSemana;
