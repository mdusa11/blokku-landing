/* ================= MÉTRICAS: activos, nuevos, retención, partidas (app 1.0.6+) ================= */
var MET = {};
var MT_MODOS = { clasico: 'Clásico', reloj: 'Contra reloj', diario: 'Reto diario', zen: 'Zen', evento: 'Evento de finde' };
var MT_PLAT = { android: ['Android', '#16a34a'], ios: ['iOS', '#5b4cf0'], otra: ['Otra', '#94a3b8'] };
function mtRng() { return S.f.mtr || 30; }
function metLoad(rng, quiet) {
  if (rng === true) { quiet = true; rng = null; }
  var keys = rng ? [rng] : Object.keys(MET).map(Number);
  if (!keys.length) keys = [30];
  keys.forEach(function (n) {
    var o = MET[n] = MET[n] || { rows: null };
    if (o.loading) return;
    o.loading = true; if (!quiet) o.err = null;
    var t = dn(todayS());
    rpc('admin_metricas', { p_desde: iso(t - n + 1), p_hasta: todayS() }, { nomiss: true })
      .then(function (r) { o.rows = r; o.err = null; o.t = Date.now(); }, function (e) { o.err = e; })
      .then(function () { o.loading = false; repaint(); });
  });
}
function met(n) { if (!MET[n]) metLoad(n); return MET[n]; }
function mtPct(v) { return v == null ? '—' : Number(v).toLocaleString('es-MX', { maximumFractionDigits: 1 }) + ' %'; }
function mtNum(v, d) { return v == null ? '—' : Number(v).toLocaleString('es-MX', { maximumFractionDigits: d == null ? 1 : d }); }
function mtVacio(r) { return !r || !r.totales || !r.totales.instalaciones; }
function mtSinSql() {
  return emptyBox('db', 'Falta correr ' + SQLF.metricas + ' en Supabase', 'Solo hace falta el día que salga la 1.0.6 (antes ninguna versión manda métricas). Está en Escritorio › Blokku › 02-Documentos › Supabase: ábrelo, copia todo, pégalo en Supabase › SQL Editor y presiona Run.');
}
function mtEspera() {
  return emptyBox('trend', 'Llegan cuando salga la 1.0.6', 'Cada teléfono con la 1.0.6 manda un resumen anónimo al día: si abrió la app y cuántas partidas jugó. En cuanto la primera persona la abra, aquí se ve.');
}

/* ---------- gráfica: activos (área) y nuevos (barras) por día ---------- */
function mtChart(dias) {
  var n = dias.length, mx = Math.max.apply(null, dias.map(function (d) { return Math.max(d.activos, d.nuevos); }).concat([1]));
  var step = mx <= 4 ? 1 : Math.pow(10, Math.floor(Math.log10(mx / 4))), nice = Math.ceil(mx / 4 / step) * step * 4;
  if (nice / 4 > step && (nice / 4) % (step * 5) && (nice / 4) % (step * 2)) nice = Math.ceil(mx / 4 / (step * 2)) * step * 8;
  var W = 1000, H = 300, x = function (i) { return n < 2 ? W / 2 : (i + .5) * W / n; }, y = function (v) { return H - v * H / nice; };
  var bw = Math.max(2, W / n * .46);
  var pts = dias.map(function (d, i) { return x(i).toFixed(1) + ' ' + y(d.activos).toFixed(1); });
  var line = 'M' + pts.join(' L'), area = line + ' L' + x(n - 1).toFixed(1) + ' ' + H + ' L' + x(0).toFixed(1) + ' ' + H + 'Z';
  var every = Math.ceil(n / 6), today = todayS();
  var svg = '<svg class="mt-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="mtg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".30"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>';
  dias.forEach(function (d, i) { if (d.nuevos) svg += '<rect class="mt-nv" x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + y(d.nuevos).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (H - y(d.nuevos)).toFixed(1) + '" rx="3"/>'; });
  svg += '<path d="' + area + '" fill="url(#mtg)"/><path d="' + line + '" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
  var dots = dias.map(function (d, i) { return '<i class="mt-dot' + (d.dia === today ? ' hot' : '') + '" style="left:' + (x(i) / 10).toFixed(2) + '%;bottom:' + (d.activos * 100 / nice).toFixed(2) + '%"></i>'; }).join('');
  var cols = dias.map(function (d) { return '<div class="mt-col" title="' + esc(fd(d.dia) + ' · ' + plural(d.activos, 'activo') + ' · ' + plural(d.nuevos, 'nuevo') + ' · ' + plural(d.partidas, 'partida')) + '"></div>'; }).join('');
  var lab = dias.map(function (d, i) { var p = d.dia.split('-'); return '<span>' + ((i % every === 0 && n - i > every / 2) || i === n - 1 ? (+p[2]) + ' ' + MES[+p[1] - 1].slice(0, 3) : '') + '</span>'; }).join('');
  return '<div class="hb mt-ch" role="img" aria-label="Activos y nuevos por día"><div class="hby">' + [4, 3, 2, 1, 0].map(function (g) { return '<span>' + nf(Math.round(nice * g / 4)) + '</span>'; }).join('') + '</div><div class="hbp"><div class="hbg">' + [0, 1, 2, 3, 4].map(function () { return '<i></i>'; }).join('') + '</div><div class="hbc mt-plot">' + svg + dots + '<div class="mt-cols">' + cols + '</div></div><div class="hbx">' + lab + '</div></div></div>' +
    '<div class="legend mt8"><span><i style="--gc:var(--accent)"></i>Activos (abrieron la app)</span><span><i style="--gc:var(--accent-2)"></i>Nuevos (primera vez)</span></div>';
}

/* ---------- tabla de cohortes ---------- */
function mtCelda(n, tam) {
  if (n == null) return '<td class="num mt-c mut" title="Ese día aún no termina">…</td>';
  var p = tam ? n * 100 / tam : 0;
  return '<td class="num mt-c" style="--p:' + Math.min(1, p / 60).toFixed(3) + '" title="' + esc(nf(n) + ' de ' + nf(tam)) + '"><b>' + mtPct(Math.round(p * 10) / 10) + '</b><span>' + nf(n) + '</span></td>';
}
function mtCohortes(C) {
  if (!C.length) return '<p class="mut">Aún no hay jugadores nuevos en este rango.</p>';
  return '<div class="tw" data-keep="mtcoh" style="max-height:420px;overflow:auto"><table class="tbl mt-coh"><thead><tr><th>Llegaron el</th><th class="num">Nuevos</th><th class="num">Día 1</th><th class="num">Día 7</th><th class="num">Día 30</th></tr></thead><tbody>' +
    C.map(function (c) { return '<tr><td><b>' + esc(fd(c.dia)) + '</b><div class="xs mut">' + esc(DSEM[new Date(dayMs(c.dia)).getDay()]) + '</div></td><td class="num"><b>' + nf(c.tamano) + '</b></td>' + mtCelda(c.d1, c.tamano) + mtCelda(c.d7, c.tamano) + mtCelda(c.d30, c.tamano) + '</tr>'; }).join('') + '</tbody></table></div>';
}

/* ---------- repartos ---------- */
function mtReparto(list, lab, tot) {
  if (!list || !list.length) return '<p class="mut">Sin datos en este rango.</p>';
  return hbars(list.map(function (x) { return { l: lab(x.clave) + ' <span class="mut">' + pct(x.jugadores, tot) + '</span>', v: x.jugadores }; }));
}

function mtKpis(r, ld) {
  var k = (r && r.kpi) || {}, L = function (v) { return ld || v; };
  var stick = k.activos_30 ? Math.round(k.activos_hoy * 1000 / k.activos_30) / 10 : null;
  var dAyer = k.activos_ayer ? Math.round((k.activos_hoy - k.activos_ayer) * 100 / k.activos_ayer) : null;
  return '<div class="kpis k8">' +
    kpi('user', 'Activos hoy', L(nf(k.activos_hoy)), 'Ayer: ' + nf(k.activos_ayer) + (dAyer == null || ld ? '' : ' · <span class="delta ' + (dAyer >= 0 ? 'up' : 'dn') + '">' + (dAyer >= 0 ? '+' : '') + dAyer + ' %</span>')) +
    kpi('cal', 'Últimos 7 días', L(nf(k.activos_7)), 'Jugadores distintos') +
    kpi('chart', 'Últimos 30 días', L(nf(k.activos_30)), stick == null ? 'Jugadores distintos' : 'Hoy volvió el ' + mtPct(stick) + ' de ellos') +
    kpi('spark', 'Nuevos hoy', L(nf(k.nuevos_hoy)), 'Ayer: ' + nf(k.nuevos_ayer)) +
    kpi('refresh', 'Retención día 1', L(mtPct(k.d1)), 'Vuelven al día siguiente') +
    kpi('refresh', 'Retención día 7', L(mtPct(k.d7)), 'Vuelven a la semana') +
    kpi('refresh', 'Retención día 30', L(mtPct(k.d30)), k.d30 == null && !ld ? 'Aún nadie cumple 30 días en este rango' : 'Vuelven al mes') +
    kpi('game', 'Partidas por jugador', L(mtNum(k.partidas_media)), 'Al día · mediana ' + mtNum(k.partidas_mediana)) +
    '</div>';
}

function vMetricas() {
  var rng = mtRng(), o = met(rng), r = o.rows;
  var h = pageHead('Métricas', 'Cuánta gente juega Blokku, cuántos vuelven y cuánto juegan. Anónimo: un resumen por teléfono y día, sin nombres.',
    seg('mtRng', rng, [[7, '7 días'], [30, '30 días'], [90, '90 días']]) + '<button class="btn" data-a="mtReload">' + ic('refresh') + 'Actualizar</button>',
    undefined);
  if (o.err && o.err.code === 'sin_sql') return h + '<div class="card">' + mtSinSql() + '</div>';
  if (o.err) h += rerr(o, 'las métricas').replace('data-a="rretry"', 'data-a="mtReload"');
  if (r == null && !o.err) return h + mtKpis(null, '<span class="sk" style="display:inline-block;width:48px;height:26px"></span>') + '<div class="card mt16"><div class="cb"><div class="sk" style="height:220px"></div></div></div>';
  if (r == null) return h;
  if (mtVacio(r)) return h + '<div class="card">' + mtEspera() + '</div>';
  var T = r.totales;
  h += mtKpis(r);
  h += '<div class="card mt16"><div class="ch">' + ic('trend') + '<h3>Activos y nuevos por día</h3><span class="sub grow">' + plural(T.activos, 'jugador') + ' en ' + plural(rng, 'día') + ' · ' + plural(T.nuevos, 'nuevo') + (T.veteranos ? ' · ' + nf(T.veteranos) + ' de antes' : '') + '</span>' + (r.ultimo ? '<span class="xs mut nowrap">Último dato ' + esc(relT(r.ultimo)) + '</span>' : '') + '</div><div class="cb">' + mtChart(r.dias || []) + '</div></div>';
  h += '<div class="split sec"><div class="card"><div class="ch">' + ic('refresh') + '<h3>Retención por día de llegada</h3><span class="sub">Cohortes</span></div><div class="cb">' + mtCohortes(r.cohortes || []) + '</div></div>';
  var P = r.plataformas || [], pv = function (k) { var x = P.filter(function (p) { return p.clave === k; })[0]; return x ? x.jugadores : 0; };
  var parts = Object.keys(MT_PLAT).map(function (k) { return { v: pv(k), c: MT_PLAT[k][1], l: MT_PLAT[k][0] }; }).filter(function (x) { return x.v; });
  var M = r.modos || [], mtot = M.reduce(function (a, x) { return a + x.partidas; }, 0);
  h += '<div class="col gap16"><div class="card"><div class="ch">' + ic('phone') + '<h3>Android vs iOS</h3></div><div class="cb row gap16" style="flex-wrap:nowrap">' + donut(parts) + '<div class="col">' + parts.map(function (x) { return '<div class="legend"><span><i style="--gc:' + x.c + '"></i>' + x.l + ' <b style="color:var(--text)">' + nf(x.v) + '</b> (' + pct(x.v, T.activos) + ')</span></div>'; }).join('') + '</div></div></div>' +
    '<div class="card"><div class="ch">' + ic('game') + '<h3>Partidas por modo</h3><span class="sub">' + plural(T.partidas, 'partida') + '</span></div><div class="cb">' + (M.length ? hbars(M.map(function (x) { return { l: esc(MT_MODOS[x.clave] || x.clave) + ' <span class="mut">' + pct(x.partidas, mtot) + '</span>', v: x.partidas }; })) : '<p class="mut">Nadie ha terminado una partida en este rango.</p>') + '</div></div></div></div>';
  h += '<div class="grid g2 sec" style="align-items:start"><div class="card"><div class="ch">' + ic('layers') + '<h3>Versiones</h3><span class="sub">Última que usó cada jugador</span></div><div class="cb">' + mtReparto(r.versiones, function (v) { return v ? 'v' + esc(v) : '<span class="mut">sin versión</span>'; }, T.activos) + '</div></div>' +
    '<div class="card"><div class="ch">' + ic('flag') + '<h3>Países</h3><span class="sub">Top 20</span></div><div class="cb">' + mtReparto(r.paises, function (c) { return (rkFlag(c) + ' ') + esc(rkPais(c)); }, T.activos) + '</div></div></div>';
  return h;
}

/* ---------- tarjeta en Inicio ---------- */
function mtCard() {
  var o = met(30), r = o.rows, k = r && r.kpi;
  var h = '<div class="card"><div class="ch">' + ic('trend') + '<h3>Jugadores</h3><span class="sub grow">' + (k ? 'Hoy, 7 y 30 días' : '') + '</span><a class="btn ghost xs" href="#/metricas">Ver métricas</a></div>';
  if (o.err) return h + '<div class="cb">' + (o.err.code === 'sin_sql' ? '<p class="mut sm">Llegan cuando salga la 1.0.6. Ese día corre <span class="path">' + esc(SQLF.metricas) + '</span> en Supabase.</p>' : '<p class="mut sm">' + esc(o.err.message) + '</p>') + '</div></div>';
  if (!r) return h + '<div class="cb"><div class="sk skl"></div><div class="sk skl" style="width:60%"></div></div></div>';
  if (mtVacio(r)) return h + '<div class="cb"><p class="mut sm" style="margin:0">Llegan cuando salga la 1.0.6: cada teléfono manda un resumen anónimo al día.</p></div></div>';
  var cell = function (l, v, s) { return '<div class="mt-mini"><span>' + esc(l) + '</span><b>' + v + '</b>' + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
  return h + '<div class="cb"><div class="mt-minis">' +
    cell('Activos hoy', nf(k.activos_hoy), 'ayer ' + nf(k.activos_ayer)) + cell('7 días', nf(k.activos_7)) + cell('30 días', nf(k.activos_30)) +
    cell('Nuevos hoy', nf(k.nuevos_hoy)) + cell('Retención D1', mtPct(k.d1)) + cell('Retención D7', mtPct(k.d7)) + '</div>' +
    '<div class="mt8">' + spark((r.dias || []).map(function (d) { return d.activos; }), 320, 46).replace('class="spark"', 'class="spark mt-spark"') + '</div><div class="xs mut">Activos por día, últimos 30 días · ' + mtNum(k.partidas_media) + ' partidas por jugador al día</div></div></div>';
}

A.mtRng = function (el) { S.f.mtr = Number(el.dataset.v); paintPage(); };
A.mtReload = function () { metLoad(mtRng()); if (mtRng() !== 30 && MET[30]) metLoad(30); };
VIEWS.metricas = vMetricas;
