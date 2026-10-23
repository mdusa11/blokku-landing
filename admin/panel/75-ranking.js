/* ================= JUEGO: ranking (jugadores, tablas, moderación, reglas anti-trampa) ================= */
var RK = { t: {} };
var RK_MODOS = [['clasico', 'Clásico'], ['reloj', 'Contra reloj'], ['diario', 'Reto diario']];
var RK_CFG = [
  ['multiplo', 'Múltiplo de puntos', 'Todos los puntajes de Blokku son múltiplos de este número. Si llega uno que no lo es, se rechaza como trampa.'],
  ['max_por_segundo', 'Máximo de puntos por segundo', 'Puntos más altos que se creen posibles por cada segundo jugado. Si un puntaje lo rebasa, se acepta pero queda como «sospechoso» y los jugadores no lo ven hasta que lo apruebes.'],
  ['max_reloj', 'Tope de Contra reloj', 'Puntaje máximo posible en una partida de Contra reloj (90 segundos). Un puntaje mayor se rechaza directo, sin llegar al ranking.'],
  ['max_envios_hora', 'Envíos por hora por jugador', 'Cuántos puntajes puede mandar un mismo jugador en una hora. Pasando el límite, la app le pide esperar un rato.']
];
function rkModo(m) { var x = RK_MODOS.filter(function (o) { return o[0] === m; })[0]; return x ? x[1] : m; }
function rkFlag(cc) { cc = String(cc || '').toUpperCase(); if (!/^[A-Z]{2}$/.test(cc)) return '🌐'; return String.fromCodePoint(127397 + cc.charCodeAt(0), 127397 + cc.charCodeAt(1)); }
var rkDN = null;
function rkPais(cc) {
  cc = String(cc || '').toUpperCase(); if (!cc) return 'Sin país';
  try { if (!rkDN) rkDN = new Intl.DisplayNames(['es-MX'], { type: 'region' }); return rkDN.of(cc) || cc; } catch (e) { return cc; }
}
function rkSemana(s) {
  var p = s.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])), dow = d.getUTCDay() || 7, mon = new Date(d.getTime() - (dow - 1) * 864e5);
  d.setUTCDate(d.getUTCDate() + 4 - dow);
  var y = d.getUTCFullYear(), w = Math.ceil(((d - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return { id: y + '-W' + z2(w), n: w, ini: mon.toISOString().slice(0, 10), fin: new Date(mon.getTime() + 6 * 864e5).toISOString().slice(0, 10) };
}
function rkPerLabel(per) {
  if (per === 'historico') return 'Histórico';
  if (per.indexOf('semana:') === 0) return 'Semana ' + (+per.split('-W')[1]);
  if (per.indexOf('dia:') === 0) { var d = per.slice(4); return d === todayS() ? 'Hoy' : fd(d); }
  return per;
}
function rkF() {
  var f = S.f.rk = S.f.rk || { tab: 'tabla', modo: 'clasico', per: 'semana', fecha: '', pais: '', vis: false, cfg: {} };
  if (!f.fecha) f.fecha = todayS();
  if (f.modo !== 'diario' && f.per === 'dia') f.per = 'semana';
  return f;
}
function rkPeriodo(f) {
  if (f.per === 'historico') return 'historico';
  if (f.per === 'dia') return 'dia:' + f.fecha;
  return 'semana:' + rkSemana(f.fecha).id;
}
function rkKey(m, p, c) { return m + '|' + p + '|' + (c || ''); }
function rkT(m, p, c, force) {
  var k = rkKey(m, p, c), o = RK.t[k] = RK.t[k] || { rows: null };
  if (!o.loading && (force || (o.rows == null && !o.err))) {
    o.loading = true; o.err = null;
    rpc('admin_ranking', { p_modo: m, p_periodo: p, p_pais: c || '' }).then(function (r) { o.rows = r || []; o.err = null; o.t = Date.now(); }, function (e) { o.err = e; })
      .then(function () { o.loading = false; repaint(); });
  }
  return o;
}
function rkRes() { return rm('rkres'); }
function rkCfgVal(k) { var r = rkRes().rows; return r && r.config && r.config[k] != null ? Number(r.config[k]) : null; }
function rkSospKeys() {
  var w = 'semana:' + rkSemana(todayS()).id, out = [];
  RK_MODOS.forEach(function (m) { ['historico', w].concat(m[0] === 'diario' ? ['dia:' + todayS()] : []).forEach(function (p) { out.push([m[0], p]); }); });
  return out;
}
/* sospechosos agrupados por jugador + modo + puntos (el mismo puntaje suele estar en histórico y en la semana) */
function rkSosp() {
  var g = {}, ord = [], loading = false, err = null;
  rkSospKeys().forEach(function (k) {
    var o = rkT(k[0], k[1], '');
    if (o.rows == null) { if (o.err) err = err || o.err; else loading = true; return; }
    o.rows.forEach(function (r) {
      if (!r.sospechoso) return;
      var id = r.id + '|' + k[0] + '|' + r.puntos, x = g[id];
      if (!x) { x = g[id] = { id: r.id, modo: k[0], puntos: r.puntos, pers: [], actualizado: r.actualizado }; ord.push(x); }
      x.pers.push(k[1]); if (r.actualizado > x.actualizado) x.actualizado = r.actualizado;
    });
  });
  ord.forEach(function (x) { var r = rkRow(x.id, x.modo, x.pers[0]); x.nombre = r ? r.nombre : '—'; x.pais = r ? r.pais : ''; x.oculto = r ? r.oculto : false; });
  ord.sort(function (a, b) { return b.puntos - a.puntos; });
  return { list: ord, loading: loading, err: err };
}
function rkRow(id, modo, per) {
  var pre = modo + '|' + per + '|', hit = null;
  Object.keys(RK.t).some(function (k) { if (k.indexOf(pre) !== 0) return false; var o = RK.t[k]; hit = (o.rows || []).filter(function (r) { return r.id === id; })[0]; return !!hit; });
  return hit;
}
function rkTables(modo, per) { var pre = modo + '|' + per + '|'; return Object.keys(RK.t).filter(function (k) { return k.indexOf(pre) === 0; }).map(function (k) { return RK.t[k]; }); }
function rkRetry(s) { return s.replace('data-a="rretry"', 'data-a="rkReload"'); }

/* ---------- vista ---------- */
function rkKpis() {
  var o = rkRes(), r = o.rows, ld = '<span class="sk" style="display:inline-block;width:48px;height:26px"></span>';
  var wait = r == null && !o.err, v = function (n) { return wait ? ld : o.err ? '—' : nf(n); };
  return '<div class="kpis">' +
    kpi('user', 'Jugadores registrados', v(r && r.jugadores), o.err ? 'Sin datos' : 'Con nombre en el ranking') +
    kpi('clock', 'Activos en 7 días', v(r && r.activos_7d), r && r.jugadores ? pct(r.activos_7d, r.jugadores) + ' de los registrados' : '') +
    kpi('warn', 'Sospechosos por revisar', v(r && r.sospechosos), r && r.sospechosos ? 'Puntajes sin aprobar' : 'Nada pendiente') +
    kpi('eyeoff', 'Jugadores ocultos', v(r && r.ocultos), 'No salen en las tablas') + '</div>';
}
function rkCountries() {
  var r = rkRes().rows, p = r && r.paises ? r.paises : {}, ks = Object.keys(p).sort(function (a, b) { return p[b] - p[a]; });
  var h = '<div class="card"><div class="ch">' + ic('flag') + '<h3>Países con más jugadores</h3><span class="sub">' + (ks.length ? plural(ks.length, 'país', 'países') : '') + '</span></div><div class="cb">';
  if (!r) return h + '<div class="sk skl"></div></div></div>';
  if (!ks.length) return h + '<p class="mut">Todavía no hay jugadores con país.</p></div></div>';
  return h + hbars(ks.slice(0, 8).map(function (c) { return { l: '<span style="font-size:16px;vertical-align:-1px">' + rkFlag(c) + '</span> ' + esc(rkPais(c)) + ' <span class="mut mono xs">' + esc(c) + '</span>', v: p[c] }; })) + '</div></div>';
}
function vRanking() {
  var f = rkF(), o = rkRes();
  var h = pageHead('Ranking', 'Los jugadores de Blokku y sus puntajes. Aquí ves todo, incluso lo que los jugadores no ven, y limpias trampas.', '<button class="btn" data-a="rkReload">' + ic('refresh') + 'Actualizar</button>',
    undefined);
  if (o.err && o.err.code === 'sin_sql') return h + '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.ranking, 'Sin ese archivo el ranking no funciona. Está en Escritorio › Blokku › 02-Documentos › Supabase. Ábrelo, copia todo el texto, pégalo en Supabase › SQL Editor y presiona Run.') + '</div>';
  if (o.err) h += rkRetry(rerr(o, 'el resumen del ranking'));
  h += rkKpis() + '<div class="sec">' + rkCountries() + '</div>';
  var S1 = rkSosp(), nS = S1.loading ? '…' : S1.list.length;
  h += '<div class="row sec mb12"><div class="seg" role="group">' +
    '<button type="button" data-a="rkTab" data-v="tabla" aria-pressed="' + (f.tab === 'tabla') + '">' + ic('trophy') + 'Tablas</button>' +
    '<button type="button" data-a="rkTab" data-v="sosp" aria-pressed="' + (f.tab === 'sosp') + '">' + ic('warn') + 'Sospechosos <span class="n">' + nS + '</span></button></div></div>';
  h += f.tab === 'sosp' ? rkSospView(S1) : rkTablaView(f);
  h += rkRules();
  return h;
}
function rkTablaView(f) {
  var per = rkPeriodo(f), pa = f.pais, t = rkT(f.modo, per, pa), res = rkRes().rows, paises = res && res.paises ? Object.keys(res.paises) : [];
  if (pa && paises.indexOf(pa) < 0) paises.push(pa);
  var hoy = f.fecha === todayS(), wk = rkSemana(f.fecha);
  var perOpts = [['semana', hoy ? 'Esta semana' : 'Semana ' + wk.n], ['historico', 'Histórico']];
  if (f.modo === 'diario') perOpts.push(['dia', hoy ? 'Hoy' : fd(f.fecha)]);
  var h = '<div class="card"><div class="ch">' + ic('trophy') + '<h3>' + esc(rkModo(f.modo)) + '</h3><span class="sub grow">' + esc(rkPerLabel(per)) + (f.per === 'semana' ? ' · ' + fdr(wk.ini, wk.fin) : '') + ' · ' + (pa ? esc(rkPais(pa)) : 'Mundial') + '</span></div>' +
    '<div class="cb"><div class="row rk-fil">' +
    '<div class="col gap4"><span class="fl">Modo</span>' + seg('rkModo', f.modo, RK_MODOS) + '</div>' +
    '<div class="col gap4"><span class="fl">Periodo</span>' + seg('rkPer', f.per, perOpts) + '</div>' +
    (f.per !== 'historico' ? '<div class="col gap4"><label class="fl" for="rk_fecha">' + (f.per === 'dia' ? 'Día' : 'Semana del') + '</label><div class="row" style="gap:6px"><input class="in sm" type="date" id="rk_fecha" data-c="rkFecha" value="' + esc(f.fecha) + '" max="' + todayS() + '" style="width:auto">' + (hoy ? '' : '<button class="btn sm" data-a="rkHoy">Hoy</button>') + '</div></div>' : '') +
    '<div class="col gap4"><label class="fl" for="rk_pais">Ámbito</label><select class="sel sm" id="rk_pais" data-c="rkPais" style="width:auto;min-width:170px">' +
    opts([['', '🌍 Mundial']].concat(paises.map(function (c) { return [c, rkFlag(c) + ' ' + rkPais(c)]; })), pa) + '</select></div>' +
    '<div class="col gap4" style="padding-bottom:6px">' + tog('rk_vis', f.vis, 'Ver como los jugadores', { dc: 'rkVis', on: 'Como lo ven ellos', off: 'Ver todo' }) + '<span class="xs mut">Encendido = esconde sospechosos y ocultos, igual que los jugadores. Apagado = ves todo.</span>' + '</div></div></div>';
  if (t.err && t.err.code === 'sin_sql') return h + emptyBox('db', 'Falta correr ' + SQLF.ranking, 'Está en Escritorio › Blokku › 02-Documentos › Supabase.') + '</div>';
  if (t.err) return h + '<div class="cb">' + rkRetry(rerr(t, 'la tabla')) + '</div></div>';
  if (t.rows == null) return h + skel(5) + '</div>';
  var L = t.rows.filter(function (r) { return !f.vis || (!r.sospechoso && !r.oculto); });
  if (!L.length) return h + emptyBox('trophy', t.rows.length ? 'Nada que mostrar a los jugadores' : 'Todavía no hay puntajes aquí', t.rows.length ? 'Todos los puntajes de esta tabla están ocultos o son sospechosos.' : 'Nadie ha mandado un puntaje en este modo, periodo y ámbito. Cuando alguien juegue con la app conectada, aparecerá. Prueba con «Histórico» o con otro modo.') + '</div>';
  h += '<div class="tw" data-keep="rk"><table class="tbl"><thead><tr><th style="width:56px">Lugar</th><th>Jugador</th><th class="num">Puntos</th><th class="rk-up">Actualizado</th><th></th></tr></thead><tbody>';
  L.forEach(function (r, i) {
    var a = 'data-id="' + esc(r.id) + '" data-m="' + esc(f.modo) + '" data-p="' + esc(per) + '"';
    h += '<tr class="clk' + (r.sospechoso ? ' sus' : '') + (r.oculto ? ' dim' : '') + '" data-a="rkOpen" ' + a + '>' +
      '<td><b class="rk-pos' + (i < 3 ? ' pod' : '') + '">' + (i + 1) + '</b></td>' +
      '<td>' + rkName(r) + '<div class="rk-m xs mut">' + esc(fdt(r.actualizado)) + '</div></td>' +
      '<td class="num"><b>' + nf(r.puntos) + '</b></td><td class="rk-up mut nowrap">' + esc(fdt(r.actualizado)) + '</td>' +
      '<td class="num nowrap">' + (r.sospechoso ? '<button class="btn xs" data-a="rkAprobar" ' + a + '>' + ic('check') + 'Aprobar</button> ' : '') +
      '<button class="btn ghost xs ic" data-a="rkOpen" ' + a + ' aria-label="Acciones de ' + esc(r.nombre) + '">' + ic('dots') + '</button></td></tr>';
  });
  return h + '</tbody></table></div><div class="cb xs mut">' + plural(L.length, 'lugar', 'lugares') + (t.rows.length >= 200 ? ' · se muestran los primeros 200' : '') + '</div></div>';
}
function rkPlat(p) { return p === 'android' ? { n: 'Android', i: 'android' } : p === 'ios' ? { n: 'iPhone', i: 'apple' } : p === 'otra' ? { n: 'Otra plataforma', i: 'phone' } : null; }
function rkPlatIc(p) { var x = rkPlat(p); return x ? '<span class="rk-pl" title="' + esc(x.n) + '">' + ic(x.i) + '</span>' : ''; }
function rkName(r) {
  return '<div class="row" style="gap:8px"><span class="rk-fl" title="' + esc(rkPais(r.pais)) + '">' + rkFlag(r.pais) + '</span><b>' + esc(r.nombre) + '</b>' + rkPlatIc(r.plataforma) +
    (r.sospechoso ? chip('sospechoso', 'warn', 'warn') : '') + (r.oculto ? chip('oculto', 'line', 'eyeoff') : '') + '</div>';
}
function rkSospView(s) {
  var h = '<div class="card"><div class="ch">' + ic('warn') + '<h3>Puntajes sospechosos</h3><span class="sub grow">Histórico, esta semana y hoy · los 3 modos</span></div>';
  if (s.err && !s.list.length) return h + '<div class="cb">' + rkRetry(rerr({ err: s.err }, 'los sospechosos')) + '</div></div>';
  if (s.loading && !s.list.length) return h + skel(3) + '</div>';
  if (!s.list.length) return h + emptyBox('check', 'Nada sospechoso', 'No hay puntajes por revisar (histórico, esta semana y hoy). Un puntaje se marca «sospechoso» cuando rebasa las reglas anti-trampa; mientras tanto nadie lo ve. Los de semanas anteriores se ven en Tablas con el selector de fecha.') + '</div>';
  h += '<div class="list" style="border:0;box-shadow:none;border-radius:0">';
  s.list.forEach(function (x) {
    var a = 'data-id="' + esc(x.id) + '" data-m="' + esc(x.modo) + '" data-p="' + esc(x.pers[0]) + '" data-ps="' + esc(x.pers.join(',')) + '"';
    h += '<div class="li clk rk-s" data-a="rkOpen" ' + a + '><span class="rk-fl">' + rkFlag(x.pais) + '</span><div class="t"><b>' + esc(x.nombre) + (x.oculto ? ' ' + chip('oculto', 'line', 'eyeoff') : '') + '</b><span>' + esc(rkModo(x.modo)) + ' · ' + x.pers.map(rkPerLabel).join(' + ') + ' · ' + esc(relT(x.actualizado)) + '</span></div>' +
      '<div class="rk-pt"><b>' + nf(x.puntos) + '</b></div><div class="r">' +
      '<button class="btn xs" data-a="rkAprobar" ' + a + '>' + ic('check') + 'Aprobar</button>' +
      '<button class="btn xs dng" data-a="rkBorrar" ' + a + '>' + ic('trash') + 'Borrar</button></div></div>';
  });
  return h + '</div><div class="cb xs mut">Aprobar deja el puntaje visible para todos. Borrar lo quita (el jugador sigue en el ranking con sus otros puntajes). Los sospechosos de semanas anteriores se ven en Tablas con el selector de fecha.</div></div>';
}
function rkRules() {
  var f = rkF(), r = rkRes().rows;
  var h = '<div class="card sec"><div class="ch">' + ic('lock') + '<h3>Reglas anti-trampa</h3><span class="sub grow">Se aplican a los puntajes nuevos al instante</span></div><div class="cb">';
  if (!r) return h + '<div class="sk skl"></div></div></div>';
  var d = function (k) { var v = rkCfgVal(k); return f.cfg[k] != null ? f.cfg[k] : (v == null ? '' : String(v)); };
  var cps = Number(d('max_por_segundo')) || 0;
  h += '<div class="grid g2">';
  RK_CFG.forEach(function (c) {
    var hint = esc(c[2]);
    if (c[0] === 'max_por_segundo' && cps) hint += ' <b>Ahora:</b> en 60 segundos de partida, más de ' + nf(cps * 60) + ' puntos se marca.';
    h += field('rk_c_' + c[0], c[1], inp('rk_c_' + c[0], d(c[0]), { type: 'number', min: 1, mode: 'numeric', di: 'rkCfgIn' }), hint);
  });
  var dirty = RK_CFG.some(function (c) { return f.cfg[c[0]] != null && Number(f.cfg[c[0]]) !== rkCfgVal(c[0]); });
  return h + '</div><div class="row"><button class="btn pri" data-a="rkCfgSave"' + (dirty && !S.view.rkSaving ? '' : ' disabled') + '>' + (S.view.rkSaving ? '<span class="spin"></span>' : ic('check')) + 'Guardar reglas</button>' +
    (dirty ? '<button class="btn ghost" data-a="rkCfgReset">Descartar cambios</button>' : '') + '<span class="xs mut">Los puntajes que ya están guardados no cambian.</span></div></div></div>';
}
VIEWS['juego/ranking'] = vRanking;

/* ---------- filtros ---------- */
A.rkReload = function () { RKJ = {}; Object.keys(RK.t).forEach(function (k) { var p = k.split('|'); rkT(p[0], p[1], p[2], true); }); rload('rkres'); };
A.rkTab = function (el) { rkF().tab = el.dataset.v; paintPage(); };
A.rkModo = function (el) { rkF().modo = el.dataset.v; paintPage(); };
A.rkPer = function (el) { rkF().per = el.dataset.v; paintPage(); };
A.rkHoy = function () { rkF().fecha = todayS(); paintPage(); };
C.rkFecha = function (el) { var f = rkF(); if (/^\d{4}-\d{2}-\d{2}$/.test(el.value)) f.fecha = el.value > todayS() ? todayS() : el.value; paintPage(); };
C.rkPais = function (el) { rkF().pais = el.value; paintPage(); };
C.rkVis = function (el) { rkF().vis = el.checked; paintPage(); };
OPENERS.rk = function (a) { var f = rkF(); f.tab = a === 'sosp' ? 'sosp' : 'tabla'; paintPage(); };

/* ---------- moderación: cambio optimista, con deshacer si falla ---------- */
function rkPatch(id, patch, modo, per) {
  var undo = [], ts = modo ? rkTables(modo, per) : Object.keys(RK.t).map(function (k) { return RK.t[k]; });
  ts.forEach(function (o) { (o.rows || []).forEach(function (r) { if (r.id !== id) return; var old = {}; Object.keys(patch).forEach(function (k) { old[k] = r[k]; r[k] = patch[k]; }); undo.push([r, old]); }); });
  return function () { undo.forEach(function (u) { Object.keys(u[1]).forEach(function (k) { u[0][k] = u[1][k]; }); }); };
}
function rkDrop(id, modo, per) {
  var undo = [];
  rkTables(modo, per).forEach(function (o) { if (!o.rows) return; var old = o.rows; o.rows = old.filter(function (r) { return r.id !== id; }); undo.push([o, old]); });
  return function () { undo.forEach(function (u) { u[0].rows = u[1]; }); };
}
function rkRun(undo, calls, ok, bad) {
  repaint();
  return Promise.all(calls).then(function () { if (ok) toast(ok); rload('rkres', true); return true; }, function (e) {
    undo(); repaint(); toast((bad || 'No se pudo guardar') + ': ' + e.message, 'bad'); return false;
  });
}
function rkMod(id, ch) { return rpc('admin_moderar', { p_id: id, p_cambios: ch }); }
function rkPers(el) { return el.dataset.ps ? el.dataset.ps.split(',') : [el.dataset.p]; }
A.rkAprobar = async function (el) {
  var id = el.dataset.id, m = el.dataset.m, ps = rkPers(el), r0 = rkRow(id, m, ps[0]);
  if (!await confirmDlg({ title: '¿Aprobar este puntaje?', text: r0 ? nf(r0.puntos) + ' puntos de ' + r0.nombre + ' en ' + rkModo(m) + ' (' + ps.map(rkPerLabel).join(' y ') + ').' : 'El puntaje queda aprobado.', html: cbox([['Qué pasa', 'Deja de ser «sospechoso» y lo ven todos los jugadores en las tablas.'], ['A quién', 'A todos los jugadores que abran el ranking.'], ['Cuánto tarda', 'Aparece la próxima vez que cada jugador abra o actualice la tabla.']]), ok: 'Sí, aprobar', icon: 'check' })) return;
  var un = ps.map(function (p) { return rkPatch(id, { sospechoso: false }, m, p); });
  rkRun(function () { un.forEach(function (u) { u(); }); }, ps.map(function (p) { return rkMod(id, { aprobar: { modo: m, periodo: p } }); }), 'Puntaje aprobado: ya lo ven los jugadores', 'No se pudo aprobar');
};
A.rkBorrar = async function (el) {
  var id = el.dataset.id, m = el.dataset.m, ps = rkPers(el), r = rkRow(id, m, ps[0]);
  var ok = await confirmDlg({ title: '¿Borrar este puntaje?', text: 'Se quita ' + (r ? nf(r.puntos) + ' puntos de ' + r.nombre : 'el puntaje') + ' en ' + rkModo(m) + ' (' + ps.map(rkPerLabel).join(' y ') + '). El jugador sigue en el ranking con sus otros puntajes y puede volver a sumar.', ok: 'Borrar puntaje', danger: true });
  if (!ok) return;
  var un = ps.map(function (p) { return rkDrop(id, m, p); });
  if (LAY.dr) drawerKill();
  rkRun(function () { un.forEach(function (u) { u(); }); }, ps.map(function (p) { return rkMod(id, { borrar: { modo: m, periodo: p } }); }), 'Puntaje borrado', 'No se pudo borrar');
};
A.rkOculto = async function (el) {
  var id = el.dataset.id, v = el.dataset.v === '1', rr0 = Object.keys(RK.t).reduce(function (a, k) { return a || (RK.t[k].rows || []).filter(function (r) { return r.id === id; })[0]; }, null);
  if (!await confirmDlg({ title: v ? '¿Ocultar a ' + (rr0 ? rr0.nombre : 'este jugador') + '?' : '¿Mostrar a ' + (rr0 ? rr0.nombre : 'este jugador') + ' otra vez?', text: v ? 'Desaparece de todas las tablas y modos. No se borra nada.' : 'Vuelve a aparecer en todas las tablas con sus puntajes.', html: cbox([['A quién', 'Todos los jugadores dejan de verlo (o vuelven a verlo) en el ranking.'], ['Cuánto tarda', 'La próxima vez que abran o actualicen la tabla.'], ['Se puede deshacer', 'Sí, en cualquier momento.']]), ok: v ? 'Sí, ocultar' : 'Sí, mostrar', danger: v, icon: v ? 'eyeoff' : 'eye' })) return;
  var u = rkPatch(id, { oculto: v });
  rkRun(u, [rkMod(id, { oculto: v })], v ? 'Jugador oculto: ya no sale en ninguna tabla' : 'Jugador visible otra vez', 'No se pudo cambiar');
};
A.rkNombre = async function (el) {
  var id = el.dataset.id, ni = document.getElementById('rk_nn'), n = el.dataset.n != null ? el.dataset.n : (ni ? ni.value.replace(/\s+/g, ' ').trim() : '');
  if (n.length < 2 || n.length > 16) { toast('El nombre debe tener entre 2 y 16 caracteres', 'bad'); if (ni) ni.focus(); return; }
  var old = Object.keys(RK.t).reduce(function (a, k) { return a || (RK.t[k].rows || []).filter(function (r) { return r.id === id; })[0]; }, null);
  if (!await confirmDlg({ title: '¿Cambiar el nombre?', text: (old ? '«' + old.nombre + '» → ' : '') + '«' + n + '».', html: cbox([['A quién', 'Todos los jugadores verán el nombre nuevo en las tablas.'], ['Cuánto tarda', 'La próxima vez que abran o actualicen la tabla.']]), ok: 'Sí, cambiar nombre', icon: 'edit' })) return;
  var u = rkPatch(id, { nombre: n });
  rkRun(u, [rkMod(id, { nombre: n })], 'Nombre cambiado a «' + n + '»', 'No se pudo renombrar').then(function (ok) {
    if (ok) Object.keys(RK.t).forEach(function (k) { var p = k.split('|'); rkT(p[0], p[1], p[2], true); });
  });
};

/* ---------- cajón de un jugador ---------- */
var RKD = null, RKJ = {}, RKA = null;
var RK_MODOS5 = [['clasico', 'Clásico'], ['reloj', 'Contra reloj'], ['diario', 'Reto diario'], ['zen', 'Zen'], ['evento', 'Evento']];
function rkFicha(id) {
  var o = RKJ[id];
  if (!o) {
    o = RKJ[id] = { d: null, err: null, loading: true };
    rpc('admin_jugador', { p_id: id }, { nomiss: true }).then(function (r) { o.d = r; o.err = null; }, function (e) { o.err = e; })
      .then(function () { o.loading = false; repaint(); });
  }
  return o;
}
function rkDetalle(r) {
  var o = rkFicha(r.id), d = o.d, dash = '<span class="mut">—</span>';
  var h = '<div class="dsec"><h4>Dispositivo y partidas</h4>';
  if (o.loading) return h + '<div class="sk skl"></div></div>';
  /* sin la función nueva usamos lo que trae la fila del ranking (o nada) */
  var pl = d ? d.plataforma : r.plataforma, mo = d ? d.modelo : r.modelo, ve = d ? d.version_app : r.version_app;
  var pm = d && d.por_modo || {}, tot = d ? Number(d.partidas) || 0 : 0, dias = d ? Number(d.dias_jugados) || 0 : 0, mej = d && d.mejores || {};
  var P = rkPlat(pl), vacio = !P && !mo && !ve && !tot && !dias;
  if (vacio) return h + '<p class="xs mut">Sin datos (versión anterior)' + (o.err && o.err.code === 'sin_sql' ? ': falta correr ' + SQLF.detalle + ' en Supabase' : o.err ? ': no se pudo cargar (' + esc(o.err.message) + ')' : '. Aparecen cuando el jugador mande un puntaje con la 1.0.7 y esté corrido ' + SQLF.detalle) + '.</p></div>';
  h += '<div class="list"><div class="li"><div class="t"><b>Plataforma</b><span>' + (P ? ic(P.i) + ' ' + esc(P.n) : dash) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Modelo</b><span>' + (mo ? esc(mo) : dash) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Versión de la app</b><span>' + (ve ? esc(ve) : dash) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Partidas totales</b><span>' + (tot ? nf(tot) : dash) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Días jugados</b><span>' + (dias ? nf(dias) : dash) + '</span></div></div></div>';
  h += '<table class="tbl mt12"><thead><tr><th>Modo</th><th class="num">Partidas</th><th class="num">Mejor puntaje</th></tr></thead><tbody>';
  RK_MODOS5.forEach(function (m) {
    var n = Number(pm[m[0]]) || 0, b = mej[m[0]];
    h += '<tr><td>' + esc(m[1]) + '</td><td class="num">' + (n ? nf(n) : dash) + '</td><td class="num">' + (b != null ? '<b>' + nf(b) + '</b>' : dash) + '</td></tr>';
  });
  return h + '</tbody></table><p class="xs mut mt12">Los conteos son lo que la app reportó con sus últimos envíos al ranking. El mejor puntaje es el histórico (Zen y Evento no tienen ranking).</p></div>';
}
function rkOpenDr(id, modo, per, pers) {
  delete RKJ[id];
  RKA = { id: id, modo: modo, per: 'amb', v: '' };
  RKD = { id: id, modo: modo, per: per, pers: pers || [per] };
  drawer({
    live: true,
    title: function () { var r = RKD && rkRow(RKD.id, RKD.modo, RKD.per); return r ? esc(r.nombre) : 'Jugador'; },
    sub: function () { var r = RKD && rkRow(RKD.id, RKD.modo, RKD.per), P = r && rkPlat(r.plataforma); return r ? rkFlag(r.pais) + ' ' + esc(rkPais(r.pais)) + (P ? ' · ' + esc(P.n) : '') + ' · ' + nf(r.puntos) + ' puntos' : ''; },
    onClose: function () { RKD = null; },
    body: function () {
      var D = RKD, r = D && rkRow(D.id, D.modo, D.per);
      if (!r) return emptyBox('trophy', 'Este puntaje ya no está', 'Se borró o la tabla se actualizó.');
      var a = 'data-id="' + esc(r.id) + '" data-m="' + esc(D.modo) + '" data-p="' + esc(D.per) + '" data-ps="' + esc(D.pers.join(',')) + '"';
      var h = '<div class="row">' + (r.sospechoso ? chip('sospechoso', 'warn', 'warn') : chip('puntaje normal', 'ok', 'check')) + (r.oculto ? chip('oculto', 'line', 'eyeoff') : chip('visible', 'line', 'eye')) + '</div>' +
        '<div class="list mt12"><div class="li"><div class="t"><b>' + nf(r.puntos) + ' puntos</b><span>' + esc(rkModo(D.modo)) + ' · ' + D.pers.map(rkPerLabel).join(' + ') + '</span></div></div>' +
        '<div class="li"><div class="t"><b>Última jugada</b><span>' + esc(fdt(r.actualizado)) + ' · ' + esc(relT(r.actualizado)) + '</span></div></div>' +
        '<div class="li"><div class="t"><b>Se registró</b><span>' + esc(fdt(r.creado)) + '</span></div></div></div>';
      h += rkDetalle(r);
      h += '<div class="dsec"><h4>Puntaje</h4><div class="col">' +
        (r.sospechoso ? '<button class="btn blk" data-a="rkAprobar" ' + a + '>' + ic('check') + 'Aprobar puntaje</button><p class="xs mut">Lo aceptas como legítimo y los jugadores ya lo ven.</p>' : '') +
        '<button class="btn blk dng" data-a="rkBorrar" ' + a + '>' + ic('trash') + 'Borrar este puntaje</button><p class="xs mut">Quita solo este puntaje; el jugador y sus demás puntajes siguen.</p></div></div>';
      h += rkAjustar(r, D);
      h += '<div class="dsec"><h4>Jugador</h4><div class="col">' +
        '<button class="btn blk" data-a="rkOculto" data-id="' + esc(r.id) + '" data-v="' + (r.oculto ? 0 : 1) + '">' + ic(r.oculto ? 'eye' : 'eyeoff') + (r.oculto ? 'Mostrar jugador' : 'Ocultar jugador') + '</button>' +
        '<p class="xs mut">' + (r.oculto ? 'Vuelve a aparecer en todas las tablas.' : 'Desaparece de todas las tablas y modos, sin borrar nada.') + '</p></div></div>';
      h += '<div class="dsec"><h4>Renombrar</h4><div class="f" style="margin-bottom:8px"><label for="rk_nn">Nombre nuevo (2 a 16 caracteres)</label>' + inp('rk_nn', '', { max: 16, ph: r.nombre }) + '<div class="hint">Lo ven todos los jugadores en las tablas. «Poner Jugador» es el nombre neutral por si el anterior era ofensivo.</div></div>' +
        '<div class="row"><button class="btn" data-a="rkNombre" data-id="' + esc(r.id) + '">' + ic('edit') + 'Guardar nombre</button><button class="btn" data-a="rkNombre" data-id="' + esc(r.id) + '" data-n="Jugador">Poner «Jugador»</button></div></div>';
      return h;
    },
    foot: function () { return '<span class="sp"></span><button class="btn pri" data-a="drClose">Listo</button>'; }
  });
}
A.rkOpen = function (el) { rkOpenDr(el.dataset.id, el.dataset.m, el.dataset.p, el.dataset.ps ? el.dataset.ps.split(',') : null); };

/* ---------- ajustar puntaje (admin_poner_puntaje) ---------- */
function rkAjPers(modo, per) {
  var f = rkF(), dia = modo === 'diario';
  var s = per.indexOf(dia ? 'dia:' : 'semana:') === 0 ? per : dia ? 'dia:' + f.fecha : 'semana:' + rkSemana(f.fecha).id;
  return { sem: [s], his: ['historico'], amb: [s, 'historico'] };
}
function rkAjustar(r, D) {
  var A_ = RKA && RKA.id === r.id ? RKA : (RKA = { id: r.id, modo: D.modo, per: 'amb', v: '' }), dia = A_.modo === 'diario';
  return '<div class="dsec"><h4>Ajustar puntaje</h4><div class="col">' +
    '<div class="f"><label>Modo</label>' + seg('rkAjM', A_.modo, RK_MODOS) + '</div>' +
    '<div class="f"><label>Periodo</label>' + seg('rkAjP', A_.per, [['sem', dia ? 'Este día' : 'Esta semana'], ['his', 'Histórico'], ['amb', 'Ambos']]) + '</div>' +
    '<div class="f"><label for="rk_aj">Puntos nuevos</label>' + inp('rk_aj', A_.v ? Number(A_.v).toLocaleString('es-MX') : '', { mode: 'numeric', max: 12, ph: nf(r.puntos), di: 'rkAjIn' }) + '</div>' +
    '<button class="btn blk" data-a="rkAjSave" data-id="' + esc(r.id) + '">' + ic('edit') + 'Guardar puntaje</button>' +
    '<p class="xs mut">Fija el puntaje del jugador en ese modo y periodo (lo crea si no existe) y lo marca como normal. Máximo 100,000,000.</p></div></div>';
}
I.rkAjIn = function (el) {
  var d = el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 9);
  if (RKA) RKA.v = d; el.value = d ? Number(d).toLocaleString('es-MX') : '';
};
function rkAjRepaint() { var i = document.getElementById('rk_aj'); if (i && RKA) RKA.v = i.value.replace(/\D/g, ''); repaint(); }
A.rkAjM = function (el) { if (RKA) { RKA.modo = el.dataset.v; rkAjRepaint(); } };
A.rkAjP = function (el) { if (RKA) { RKA.per = el.dataset.v; rkAjRepaint(); } };
A.rkAjSave = async function (el) {
  var D = RKD, a = RKA; if (!D || !a || a.id !== el.dataset.id) return;
  var inpEl = document.getElementById('rk_aj'); if (inpEl) a.v = inpEl.value.replace(/\D/g, '');
  if (a.v === '' || +a.v > 1e8) { toast('Escribe un puntaje entre 0 y 100,000,000', 'bad'); if (inpEl) inpEl.focus(); return; }
  var n = +a.v, ps = rkAjPers(a.modo, D.per)[a.per];
  var lines = ps.map(function (p) { var o = rkRow(a.id, a.modo, p); return rkPerLabel(p) + ': antes ' + (o ? nf(o.puntos) : 'sin puntaje') + ' → ahora ' + nf(n); });
  var ok = await confirmDlg({ title: '¿Guardar este puntaje?', text: lines.join('. ') + '. Modo ' + rkModo(a.modo) + '. El puntaje queda como normal (no sospechoso).', ok: 'Guardar puntaje' });
  if (!ok) return;
  try {
    await Promise.all(ps.map(function (p) { return rpc('admin_poner_puntaje', { p_id: a.id, p_modo: a.modo, p_periodo: p, p_puntos: n }); }));
    toast('Puntaje guardado: ' + nf(n) + ' en ' + rkModo(a.modo));
    a.v = '';
    Object.keys(RK.t).forEach(function (k) { var q = k.split('|'); rkT(q[0], q[1], q[2], true); });
    rload('rkres', true); delete RKJ[a.id]; repaint();
  } catch (e) { toast(e.code === 'sin_sql' ? 'Falta correr ' + SQLF.servidor + ' en Supabase (función admin_poner_puntaje)' : 'No se pudo guardar: ' + e.message, 'bad'); }
};

/* ---------- reglas anti-trampa ---------- */
I.rkCfgIn = function (el) {
  var f = rkF(), k = el.id.replace('rk_c_', ''); f.cfg[k] = el.value;
  var b = document.querySelector('[data-a="rkCfgSave"]'); if (b) b.disabled = !RK_CFG.some(function (c) { return f.cfg[c[0]] != null && Number(f.cfg[c[0]]) !== rkCfgVal(c[0]); });
};
A.rkCfgReset = function () { rkF().cfg = {}; paintPage(); };
A.rkCfgSave = async function () {
  var f = rkF(), errs = {}, chg = [];
  RK_CFG.forEach(function (c) {
    var raw = f.cfg[c[0]]; if (raw == null) return;
    var n = Number(raw);
    if (!/^\d+$/.test(String(raw).trim()) || n < 1 || n > 1e9) { errs['rk_c_' + c[0]] = 'Escribe un número entero mayor que 0.'; return; }
    if (n !== rkCfgVal(c[0])) chg.push([c[0], n]);
  });
  if (!showErrs(errs)) return;
  if (!chg.length) { toast('No hay cambios', 'info'); return; }
  var lab = {}; RK_CFG.forEach(function (c) { lab[c[0]] = c[1]; });
  if (!await confirmDlg({ title: '¿Guardar las reglas anti-trampa?', text: 'Aplican a los puntajes nuevos al instante. Los puntajes ya guardados no cambian.', html: cbox(chg.map(function (c) { return [lab[c[0]], nf(rkCfgVal(c[0])) + ' → <b>' + nf(c[1]) + '</b>']; }).concat([['Ojo', 'Si pones los límites demasiado bajos, puntajes legítimos se marcarán como sospechosos o se rechazarán.']])), ok: 'Sí, guardar reglas', icon: 'lock' })) return;
  S.view.rkSaving = true; paintPage();
  try {
    await Promise.all(chg.map(function (c) { return rpc('admin_ranking_config', { p_clave_cfg: c[0], p_valor: c[1] }); }));
    var r = rkRes().rows; if (r) { r.config = r.config || {}; chg.forEach(function (c) { r.config[c[0]] = c[1]; }); }
    f.cfg = {}; toast('Reglas guardadas'); rload('rkres', true);
  } catch (e) { toast('No se pudieron guardar las reglas: ' + e.message, 'bad'); }
  S.view.rkSaving = false; paintPage();
};
