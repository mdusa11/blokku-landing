/* ================= gráficas (SVG a mano) ================= */
function spark(vals, w, h) {
  w = w || 96; h = h || 34; var mx = Math.max.apply(null, vals.concat([1])), n = vals.length, pts = vals.map(function (v, i) { return [(i * (w - 4) / Math.max(1, n - 1)) + 2, h - 3 - (v / mx) * (h - 8)]; });
  var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
  var id = 'sg' + Math.random().toString(36).slice(2, 7);
  return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5b4cf0" stop-opacity=".28"/><stop offset="1" stop-color="#5b4cf0" stop-opacity="0"/></linearGradient></defs><path d="' + d + ' L' + (w - 2) + ' ' + h + ' L2 ' + h + 'Z" fill="url(#' + id + ')"/><path d="' + d + '" fill="none" stroke="#5b4cf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="' + pts[n - 1][0].toFixed(1) + '" cy="' + pts[n - 1][1].toFixed(1) + '" r="2.6" fill="#e64aa0"/></svg>';
}
function bars(data, o) {
  o = o || {}; var n = data.length, mx = Math.max.apply(null, data.map(function (d) { return d.v; }).concat([1])), nice = mx <= 4 ? 4 : Math.ceil(mx / 4) * 4, every = Math.ceil(n / (o.ticks || 8));
  var h = '<div class="hb" role="img" aria-label="' + esc(o.label || 'Gráfica') + '"><div class="hby">' + [4, 3, 2, 1, 0].map(function (g) { return '<span>' + Math.round(nice * g / 4) + '</span>'; }).join('') + '</div><div class="hbp"><div class="hbg">' + [0, 1, 2, 3, 4].map(function () { return '<i></i>'; }).join('') + '</div><div class="hbc">';
  data.forEach(function (d, i) { h += '<div class="hbb" title="' + esc(d.tip || (d.label + ': ' + d.v)) + '"><i' + (d.hot ? ' class="hot"' : '') + ' style="height:' + (d.v ? Math.max(1.5, d.v * 100 / nice) : 0) + '%"></i></div>'; });
  h += '</div><div class="hbx">';
  data.forEach(function (d, i) { h += '<span>' + ((i % every === 0 && n - i > every / 2) || i === n - 1 ? esc(d.label) : '') + '</span>'; });
  return h + '</div></div></div>';
}
function donut(parts, size) {
  size = size || 120; var tot = parts.reduce(function (a, p) { return a + p.v; }, 0), r = size / 2 - 10, c = 2 * Math.PI * r, off = 0, h = '<svg viewBox="0 0 ' + size + ' ' + size + '" style="width:' + size + 'px;height:' + size + 'px;flex:none" role="img" aria-label="Reparto"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--sunken)" stroke-width="14"/>';
  if (tot) parts.forEach(function (p) { if (!p.v) return; var l = c * p.v / tot; h += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + p.c + '" stroke-width="14" stroke-dasharray="' + l.toFixed(2) + ' ' + (c - l).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"><title>' + esc(p.l + ': ' + p.v) + '</title></circle>'; off += l; });
  return h + '<text x="50%" y="47%" text-anchor="middle" style="font:800 20px var(--font);fill:var(--text)">' + nf(tot) + '</text><text x="50%" y="63%" text-anchor="middle" style="font:600 10px var(--font);fill:var(--muted)">total</text></svg>';
}
function hbars(list, max) {
  max = max || Math.max.apply(null, list.map(function (x) { return x.v; }).concat([1]));
  return '<div class="hbar">' + list.map(function (x) { return '<div class="bl"><span>' + x.l + '</span><div class="bar"><i style="width:' + Math.max(2, Math.round(x.v * 100 / max)) + '%"></i></div></div><div class="num">' + nf(x.v) + '</div>'; }).join('') + '</div>';
}

/* ================= INICIO ================= */
function kpi(icn, label, val, sub, extra, act) {
  return '<div class="kpi' + (act ? ' hov" data-a="go" data-r="' + act : '') + '"' + (act ? ' role="link" tabindex="0"' : '') + '><div class="kl"><span class="kic">' + ic(icn) + '</span>' + esc(label) + '</div><div class="kn">' + val + '</div><div class="ks">' + (sub || '') + '</div>' + (extra || '') + '</div>';
}
function alertsList() {
  var out = [], now = Date.now(), t = dn(todayS());
  Object.keys(S.missing).forEach(function (k) { out.push({ c: 'bad', i: 'db', t: 'Falta correr ' + SQLF[k] + ' en Supabase', s: 'Escritorio › Blokku › 02-Documentos › Supabase', r: 'ajustes' }); });
  rows('codigos').forEach(function (c) {
    var e = cEst(c);
    if (e === 'agotado' && c.ultimo && now - new Date(c.ultimo).getTime() < 3 * 864e5) out.push({ c: 'warn', i: 'ticket', t: 'El código ' + c.mostrar + ' se agotó', s: c.usos + ' de ' + c.usos_max + ' usos · ' + (c.cosmeticos || []).map(cname).join(' + '), open: 'code:' + c.id, r: 'codigos/rotativos' });
    if (e === 'activo' && c.caduca && new Date(c.caduca).getTime() - now < 864e5) out.push({ c: 'info', i: 'clock', t: 'El código ' + c.mostrar + ' caduca ' + relT(c.caduca), s: (c.usos || 0) + ' canjes hasta ahora', open: 'code:' + c.id, r: 'codigos/rotativos' });
  });
  rows('eventos').forEach(function (e) {
    if (!e.activo) return; var a = new Date(e.inicio).getTime(), b = new Date(e.fin).getTime();
    if (a > now && a - now < 2 * 864e5) out.push({ c: 'info', i: 'cal', t: 'El evento «' + ml(e.nombre) + '» empieza ' + relT(e.inicio), s: fdt(e.inicio) + ' · ' + goalTxt(e.meta, e.objetivo), open: 'ev:' + e.id, r: 'vivo/eventos' });
    if (a <= now && b > now && b - now < 2 * 864e5) out.push({ c: 'warn', i: 'cal', t: 'El evento «' + ml(e.nombre) + '» termina ' + relT(e.fin), s: fdt(e.fin), open: 'ev:' + e.id, r: 'vivo/eventos' });
  });
  rows('avisos').forEach(function (a) {
    var b = new Date(a.fin).getTime(), s = new Date(a.inicio).getTime();
    if (a.activo && s <= now && b > now && b - now < 864e5) out.push({ c: 'info', i: 'bell', t: 'El aviso «' + (ml(a.titulo) || 'sin título') + '» termina ' + relT(a.fin), s: AV_FMT[avFmt(a)] + ' · ' + nf(a.vistos) + ' vistos', open: 'av:' + a.id, r: 'vivo/avisos' });
  });
  var rk = RM.rkres && RM.rkres.rows;
  if (rk && rk.sospechosos > 0) out.push({ c: 'warn', i: 'flag', t: plural(rk.sospechosos, 'puntaje sospechoso', 'puntajes sospechosos') + ' en el ranking', s: 'Aprueba los legítimos y borra las trampas', open: 'rk:sosp', r: 'juego/ranking' });
  var en = erNuevos();
  if (en) { var er0 = erList().filter(function (x) { return x.estado === 'nuevo'; })[0]; out.push({ c: 'bad', i: 'warn', t: plural(en, 'error nuevo', 'errores nuevos') + ' en la app', s: er0 ? erTitulo(er0) : '', open: 'er:nuevos', r: 'proyecto/errores' }); }
  if (DB.ready) {
    items('timeline').forEach(function (x) { if (x.estado === 'idea' || x.tipo === 'estreno') return; var d = dn(x.inicio) - t; if (d === 0 || d === 1) out.push({ c: 'info', i: 'spark', t: x.titulo + ' ' + (d ? 'empieza mañana' : 'empieza hoy'), s: x.notas || '', open: 'tl:' + x.id, r: 'juego/temporadas' }); });
    items('versiones').forEach(function (v) { if (v.ios === 'en revisión' || v.android === 'en revisión') out.push({ c: 'info', i: 'layers', t: 'La versión ' + v.version + ' está en revisión' + (v.ios === 'en revisión' ? ' de Apple' : ' de Google'), s: v.ios === 'en revisión' ? 'Cuando la aprueben, se publica a mano en App Store Connect.' : '', r: 'proyecto/versiones' }); });
  }
  return out;
}
function upcoming() {
  var t = dn(todayS()), out = [];
  var rep = {}; rows('eventos').forEach(function (e) { if (REPLACES[e.id] && e.activo) rep[REPLACES[e.id]] = 1; });
  items('timeline').forEach(function (x) { var a = dn(x.inicio), b = dn(x.fin || x.inicio); if (x.tipo === 'estreno' || b < t || rep[x.id]) return; out.push({ d: a > t ? x.inicio : todayS(), live: a <= t, t: x.titulo, s: (x.estado === 'idea' ? 'Idea · ' : '') + fdr(x.inicio, x.fin), open: 'tl:' + x.id, r: 'juego/temporadas', idea: x.estado === 'idea' }); });
  rows('eventos').forEach(function (e) { if (!e.activo || new Date(e.fin) < new Date()) return; var s = ymd(new Date(e.inicio)); out.push({ d: dn(s) > t ? s : todayS(), live: dn(s) <= t, t: (ml(e.nombre) || e.id) + ' (en la app)', s: 'Evento remoto · ' + fdt(e.inicio, 1) + ' → ' + fdt(e.fin, 1), open: 'ev:' + e.id, r: 'vivo/eventos' }); });
  out.sort(function (a, b) { return dn(a.d) - dn(b.d) || (a.idea ? 1 : 0) - (b.idea ? 1 : 0); });
  return out.slice(0, 7);
}
function vInicio() {
  var h = new Date().getHours(), sal = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches', d = new Date();
  var out = '<div class="hero"><h1>' + sal + ', Manuel</h1><p>' + DSEM[d.getDay()].replace(/^./, function (c) { return c.toUpperCase(); }) + ' ' + d.getDate() + ' de ' + MES[d.getMonth()] + '. Esto es lo que pasa hoy en Blokku.</p>' +
    '<div class="row"><button class="btn w" data-a="qDrop">' + ic('zap') + 'Lanzar drop</button><button class="btn" data-a="qAviso">' + ic('bell') + 'Nuevo aviso</button><button class="btn" data-a="qCodes">' + ic('ticket') + 'Crear códigos</button><button class="btn" data-a="qPend">' + ic('plus') + 'Pendiente</button></div></div>';
  out += '<div style="margin:14px 0 0">' + whyHtml('inicio') + howHtml('inicio') + '</div>';
  /* KPIs */
  var rkr = rm('rkres'), cj = rm('canjes'), A = cjAgg(), d14 = lastDays(A.day, 14), w1 = d14.slice(7).reduce(function (a, x) { return a + x.v; }, 0), w0 = d14.slice(0, 7).reduce(function (a, x) { return a + x.v; }, 0);
  var hoy = A.day[todayS()] || 0, ayer = A.day[iso(dn(todayS()) - 1)] || 0;
  var C = rows('codigos'), cact = C.filter(function (c) { return cEst(c) === 'activo'; }).length, cuse = C.reduce(function (a, c) { return a + (c.usos || 0); }, 0);
  var E = rows('eventos'), eact = E.filter(function (e) { return evEst(e) === 'activo'; }).length, eprox = E.filter(function (e) { return evEst(e) === 'proximo'; }).length;
  var AV = rows('avisos'), aact = AV.filter(function (a) { return avEst(a) === 'activo'; }), vs = 0, cl = 0; aact.forEach(function (a) { vs += a.vistos || 0; cl += a.clics || 0; });
  var ld = function (o) { return o && o.rows == null && !o.err ? '<span class="sk" style="display:inline-block;width:48px;height:26px"></span>' : null; };
  var delta = w0 ? Math.round((w1 - w0) * 100 / w0) : null;
  if (!RKN.rows && !RKN.err) rkNLoad();
  var nuevosK = RKN.rows && RKN.rango === 'hoy' ? kpi('user', 'Nuevos hoy', nf(RKN.total), RKN.total ? 'Ver quiénes son →' : 'Nadie se ha registrado aún', '', 'juego/ranking').replace('data-a="go"', 'data-a="rkNuevosGo"') : '';
  out += '<div class="kpis k6' + (erNuevos() || nuevosK ? ' k7' : '') + '">' +
    kpi('trophy', 'Canjes hoy', ld(cj) || nf(hoy), cj.err ? 'Sin datos' : 'Ayer: ' + nf(ayer) + ' · códigos fijos', '', 'codigos/canjes') +
    kpi('chart', 'Últimos 7 días', ld(cj) || nf(w1), cj.err ? 'Sin datos' : delta == null ? 'vs. semana anterior: —' : '<span class="delta ' + (delta >= 0 ? 'up' : 'dn') + '">' + (delta >= 0 ? '+' : '') + delta + ' %</span> vs. semana anterior', cj.rows ? spark(d14.map(function (x) { return x.v; })) : '', 'codigos/canjes') +
    kpi('zap', 'Códigos activos', ld(RM.codigos) || nf(cact), nf(cuse) + ' canjes de rotativos', '', 'codigos/rotativos') +
    kpi('cal', 'Eventos', ld(RM.eventos) || nf(eact) + '<small>activos</small>', eprox ? nf(eprox) + ' próximo' + (eprox > 1 ? 's' : '') : 'Ninguno próximo', '', 'vivo/eventos') +
    kpi('trophy', 'Jugadores en ranking', ld(rkr) || (rkr.err ? '—' : nf(rkr.rows.jugadores)), rkr.err ? (rkr.err.code === 'sin_sql' ? 'Falta correr ' + SQLF.ranking : 'Sin datos') : nf(rkr.rows.activos_7d) + ' activos en 7 días', '', 'juego/ranking') +
    kpi('bell', 'Avisos activos', ld(RM.avisos) || nf(aact.length), aact.length ? nf(vs) + ' vistos · ' + pct(cl, vs) + ' tocaron el botón' : 'Ninguno en la app ahora', '', 'vivo/avisos') +
    nuevosK + (erNuevos() ? kpi('warn', 'Errores nuevos', nf(erNuevos()), erFatales() ? nf(erFatales()) + ' fatal' + (erFatales() > 1 ? 'es' : '') + ' · sin revisar' : 'Sin revisar', '', 'proyecto/errores') : '') +
    '</div>';
  /* columnas */
  var al = alertsList();
  out += '<div class="split sec"><div class="col gap16">';
  out += '<div class="card"><div class="ch">' + ic('warn') + '<h3>Atención</h3><span class="sub">' + (al.length ? al.length + ' cosa' + (al.length > 1 ? 's' : '') : 'Todo en orden') + '</span></div>' +
    (al.length ? al.slice(0, 8).map(function (a) { return '<div class="alert ' + a.c + ' li clk" data-a="openx" data-r="' + a.r + '" data-o="' + esc(a.open || '') + '"><span class="ai">' + ic(a.i) + '</span><div class="t"><b>' + esc(a.t) + '</b>' + (a.s ? '<span>' + esc(a.s) + '</span>' : '') + '</div>' + ic('chr', 'faint') + '</div>'; }).join('') :
      '<div class="alert ok"><span class="ai">' + ic('check') + '</span><div class="t"><b>Nada urgente</b><span>No hay códigos agotados ni por vencer, eventos por empezar o terminar, errores nuevos ni puntajes sospechosos.</span></div></div>') + '</div>';
  out += mtCard();
  out += nowInApp();
  out += '</div><div class="col gap16">';
  /* pendientes */
  var P = items('pendientes').filter(function (k) { return k.quien === 'Manuel' && k.col !== 'hecho'; }).sort(function (a, b) { return (a.bloqueo ? 1 : 0) - (b.bloqueo ? 1 : 0); });
  out += '<div class="card"><div class="ch">' + ic('tasks') + '<h3>Tus pendientes</h3><span class="sub grow">' + P.filter(function (k) { return !k.bloqueo; }).length + ' para ahora</span><a class="btn ghost xs" href="#/proyecto/pendientes">Ver todos</a></div><div class="list" style="border:0;box-shadow:none;border-radius:0">' +
    (P.length ? P.slice(0, 6).map(function (k) { return tkCard(k, true); }).join('') : emptyBox('check', 'Nada pendiente', 'Disfruta el día.')) + '</div></div>';
  /* próximas fechas */
  var U = upcoming();
  out += '<div class="card"><div class="ch">' + ic('cal') + '<h3>Próximas fechas</h3><span class="sub grow"></span><a class="btn ghost xs" href="#/juego/temporadas">Calendario</a></div>' +
    (U.length ? U.map(function (u) { var p = u.d.split('-'); return '<div class="li clk" data-a="openx" data-r="' + u.r + '" data-o="' + esc(u.open) + '"><div class="dbox"><b>' + (+p[2]) + '</b><span>' + MES[+p[1] - 1].slice(0, 3) + '</span></div><div class="t"><b>' + esc(u.t) + '</b><span>' + esc(u.s) + '</span></div>' + (u.live ? chip('En curso', 'ok') : u.idea ? chipN('Idea', 'line') : '<span class="xs mut nowrap">' + relDay(u.d) + '</span>') + '</div>'; }).join('') : emptyBox('cal', 'Sin fechas próximas', '')) + '</div>';
  /* tiendas */
  out += storesCard();
  out += '</div></div>';
  return out;
}
function storesCard() {
  var V = items('versiones').slice().sort(function (a, b) { return cmpVer(b.version, a.version); });
  var an = V.find(function (v) { return v.android === 'publicada'; }), ios = V.find(function (v) { return v.ios === 'en revisión'; }) || V.find(function (v) { return v.ios === 'publicada'; }), nx = V.find(function (v) { return v.android === 'lista' || v.ios === 'lista'; });
  function row(l, v, s, txt) { return '<div class="li clk" data-a="go" data-r="proyecto/versiones"><span class="b" style="width:84px;flex:none">' + l + '</span><div class="t"><b>' + (v ? esc(v) : '—') + '</b><span>' + esc(txt) + '</span></div>' + (s ? verChip(s) : '') + '</div>'; }
  return '<div class="card"><div class="ch">' + ic('store') + '<h3>Tiendas</h3></div>' +
    row('Android', an && an.version, an && an.android, an ? 'Publicada en Google Play' : 'Sin versión publicada') +
    row('iOS', ios && ios.version, ios && ios.ios, ios ? (ios.ios === 'en revisión' ? 'En revisión de Apple' : 'Publicada en el App Store') : 'Sin versión') +
    row('Siguiente', nx && nx.version, nx && 'lista', nx ? (nx.espera ? 'En espera de ' + nx.espera : 'Lista para subir') : 'Nada preparado') + '</div>';
}
function nowInApp() {
  var o = rm('config'), c = o.rows;
  var h = '<div class="card"><div class="ch">' + ic('phone') + '<h3>Ahora mismo en la app</h3><span class="sub grow">Lo que reciben los teléfonos al abrir Blokku</span><a class="btn ghost xs" href="#/vivo/ahora">Ver como la app</a></div>';
  if (o.err) return h + '<div class="cb mut">' + esc(o.err.message) + '</div></div>';
  if (!c) return h + '<div class="cb"><div class="sk skl"></div><div class="sk skl" style="width:60%"></div></div></div>';
  var ev = c.eventos || [], av = c.avisos || [], off = c.eventos_apagados || [];
  if (!ev.length && !av.length) h += '<div class="cb mut">Nada remoto: los jugadores ven la app como viene de fábrica. Cuando enciendas un evento o un aviso, aparecerá aquí.</div>';
  ev.forEach(function (e) { var on = new Date(e.inicio) <= new Date(); h += '<div class="li clk" data-a="openx" data-r="vivo/eventos" data-o="ev:' + esc(e.id) + '">' + cthumb((e.premios || [])[0], 'sm') + '<div class="t"><b>' + esc(ml(e.nombre) || e.id) + '</b><span>' + esc(goalTxt(e.meta, e.objetivo)) + ' · ' + (on ? 'termina ' + relT(e.fin) : 'se anuncia; empieza ' + relT(e.inicio)) + '</span></div>' + chip(on ? 'En curso' : 'Anunciado', on ? 'ok' : 'ac') + '</div>'; });
  av.forEach(function (a) { h += '<div class="li clk" data-a="openx" data-r="vivo/avisos" data-o="av:' + esc(a.id) + '"><div class="th sm" style="--tc:' + (a.tipo === 'drop' ? '#e64aa0' : '#5b4cf0') + '">' + ic(a.tipo === 'drop' ? 'zap' : 'bell') + '</div><div class="t"><b>' + esc(ml(a.titulo) || (a.tipo === 'drop' ? '¡Salió un código!' : 'Aviso')) + '</b><span>' + (a.tipo === 'drop' ? 'Drop (ventana emergente)' : 'Tarjeta en el menú') + ' · ' + targetTxt(a) + '</span></div>' + chip('Visible', 'ok') + '</div>'; });
  if (off.length) h += '<div class="cb xs mut">Eventos apagados (la app los ignora): ' + off.map(esc).join(', ') + '</div>';
  return h + '</div>';
}
function targetTxt(a) { var p = a.plataforma === 'android' ? 'solo Android' : a.plataforma === 'ios' ? 'solo iOS' : 'Android e iOS'; return p + (a.version_menor ? ' · versión menor a ' + esc(a.version_menor) : '') + ' · ' + ({ una: 'una vez', diaria: 'una vez al día', siempre: 'cada vez que abre' }[a.repetir] || 'una vez'); }
A.openx = function (el) { var r = el.dataset.r, o = el.dataset.o; go(r, o ? { open: o } : null); };
A.qDrop = function () { openDrop(); };
A.qAviso = function () { avForm(null); };
A.qCodes = function () { genForm(); };
A.qPend = function () { pendForm(null); };
VIEWS.inicio = vInicio;
