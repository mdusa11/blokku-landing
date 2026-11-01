/* ================= PASES DE BATALLA: LÍNEA DEL TIEMPO Y COMPARATIVA (solo lectura) ================= */
// Contenido de cada nivel: admin/panel/datos-temporadas.js (var TPD), generado con scripts/gen-temporadas.mjs
// desde lib/pase/*.json de la app. Fechas y gemas: admin_solo_gemas; Bloques y protectores: admin_pase_bloques
// (los mismos datos que usa «Solo gemas › Pase»). Si el servidor difiere del JSON, la casilla se marca.
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/pases'; })) {
    var at = -1; g.items.forEach(function (i, n) { if (i[0] === 'juego/temporadas') at = n; });
    g.items.splice(at >= 0 ? at + 1 : g.items.length, 0, ['juego/pases', 'Pases de batalla', 'layers']);
  }
  ROUTES['juego/pases'] = { t: 'Pases de batalla', ic: 'layers', g: g ? g.g : 'Juego', k: 'juego' };
})();
N20['juego/pases'] = 1;
AYUDA['juego/pases'] = {
  que: 'Los pases de batalla (temporadas) uno junto al otro: una línea del tiempo con las fechas de cada temporada y, nivel por nivel, qué trae el carril gratis y el premium (cosméticos con su rareza, Bloques, cofres, protectores y gemas), con totales para comparar una temporada contra otra.',
  ve: 'Es lo que el jugador ve en la pantalla del Pase de la app 2.0: la temporada en curso, sus 30 niveles y lo que gana en cada uno. Aquí no se cambia nada, solo se mira.',
  cuando: 'Antes de diseñar o ajustar una temporada nueva (para que no sea más pobre ni más rica que la anterior), al revisar si el premium vale lo que cuesta, o para ver cuántos días faltan para que empiece o termine un pase.',
  como: [
    '<b>De dónde salen los datos:</b> los premios de cada nivel vienen de la app (archivos lib/pase/temporada_N.json) y se copian a este panel con <span class="mono">node scripts/gen-temporadas.mjs</span>; hay que correrlo (y volver a compilar el panel) cada vez que cambie una temporada de la app. Las <b>fechas, las gemas por nivel, los Bloques y los protectores</b> se leen en vivo del servidor, así que coinciden con lo que de verdad paga.',
    '<b>Casilla marcada «Servidor»:</b> el servidor paga un valor distinto al del JSON de la app (por ejemplo corregiste los Bloques de un nivel en «Solo gemas › Pase»). El jugador recibe el del servidor, aunque la casilla de la app enseñe el suyo.',
    '<b>Exclusivo</b> = solo se gana en ese pase (no se vende ni sale por código). <b>Paquete mítico</b> (estrella) = el paquete completo de 6 piezas.',
    '<b>Valor aproximado en Bloques:</b> Bloques que da + cosméticos comunes (3,000), raros (9,000) y épicos (24,000) al precio de la tienda. Los legendarios y míticos no se venden con Bloques, así que no suman. Es una guía para comparar, no un precio real.',
    '<b>Cuánto regresa el premium:</b> las gemas del carril premium contra el precio del pase en gemas; si se cambiara todo el valor en Bloques por gemas al tipo de cambio de la tienda, se suma también.',
    '<b>Para editar</b> gemas, Bloques o fechas usa el botón «Editar en Solo gemas › Pase» de cada temporada.',
    H_HORA
  ]
};

ICP.tpgem = 'M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l-2 6 5 11 5-11-2-6';
ICP.tpcofre = 'M4 10h16v10H4zM3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v4H3zM12 10v4';
ICP.tpescudo = 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z';
ICP.tpblq = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';

var TP = { c: 'ambos', t: 'todas' };
var TP_RAR = { common: ['Común', '#8a94a6'], rare: ['Raro', '#3b82f6'], epic: ['Épico', '#a855f7'], legendary: ['Legendario', '#f59e0b'], mythic: ['Mítico', '#ec4899'] };
var TP_PLU = { common: 'Comunes', rare: 'Raros', epic: 'Épicos', legendary: 'Legendarios', mythic: 'Míticos' };
var TP_RAR_ORD = ['common', 'rare', 'epic', 'legendary', 'mythic'];
var TP_PRECIO = { common: 3000, rare: 9000, epic: 24000 };
var TP_KIND = { theme: ['Tema', 'image'], pieceStyle: ['Piezas', 'grid'], lineEffect: ['Efecto', 'spark'], frame: ['Marco', 'board'], badge: ['Insignia', 'star'], title: ['Título', 'hash'], nameColor: ['Color de nombre', 'edit'], costume: ['Disfraz', 'user'], placeSound: ['Sonido', 'mega'], streakIcon: ['Ícono de racha', 'zap'] };
var TP_GEM = '#4497F5', TP_BLQ = '#D4A017';

function tpData() { return typeof TPD !== 'undefined' && TPD && TPD.temporadas ? TPD : null; }
function tpCos(id) { var d = tpData(); return (d && d.cosm[id]) || { n: id, k: '?', r: 'common' }; }
function tpSG() { return typeof sgRows === 'function' ? sgRows() : null; }
function tpPB() { return typeof sgPbRows === 'function' ? sgPbRows() : null; }
function tpSrvT(id) { var r = tpSG(); return r ? (r.temporadas || []).filter(function (t) { return t.id === id; })[0] || null : null; }
function tpPbT(id) { var r = tpPB(); return r ? (r.temporadas || []).filter(function (t) { return t.id === id; })[0] || null : null; }
function tpCfg(k) { var r = tpSG(), c = r && (r.config || []).filter(function (x) { return x.clave === k; })[0]; return c ? Number(c.valor) : null; }
function tpPrecio(rar) {
  var r = tpSG(), c = r && (r.tienda || []).filter(function (x) { return x.clave === 'precio_' + ({ common: 'comun', rare: 'raro', epic: 'epico' }[rar]); })[0];
  return c && c.valor > 0 ? Number(c.valor) : TP_PRECIO[rar] || 0;
}
function tpAhora() { var r = tpSG(), t = r && r.ahora ? new Date(r.ahora).getTime() : NaN; return isNaN(t) ? Date.now() : t; }
function tpMs(v) { return new Date(v).getTime(); }
function tpDias(ms) { return Math.round(ms / 864e5); }
function tpFin(v) { return fdt(new Date(tpMs(v) - 6e4).toISOString(), true); }
function tpEstado(t, ahora) { return ahora < tpMs(t.inicio) ? 'próxima' : ahora < tpMs(t.fin) ? 'en curso' : 'terminada'; }
function tpRelativo(t, ahora) {
  var e = tpEstado(t, ahora), d;
  if (e === 'próxima') { d = Math.ceil((tpMs(t.inicio) - ahora) / 864e5); return d <= 1 ? 'empieza mañana' : 'empieza en ' + nf(d) + ' días'; }
  if (e === 'en curso') { d = Math.ceil((tpMs(t.fin) - ahora) / 864e5); return d <= 1 ? 'termina hoy o mañana' : 'quedan ' + nf(d) + ' días'; }
  d = Math.floor((ahora - tpMs(t.fin)) / 864e5); return d < 1 ? 'terminó hoy' : 'terminó hace ' + nf(d) + ' día' + (d === 1 ? '' : 's');
}
function tpEstChip(e) { return e === 'en curso' ? chip('en curso', 'ok') : e === 'próxima' ? chip('próxima', 'info') : chip('terminada', 'line'); }

/* ---------- temporadas combinadas: contenido de la app + servidor ---------- */
// {id, numero, nombre, inicio, fin, jsonIni, jsonFin, srv, d (contenido o null)}
function tpTemps() {
  var d = tpData(), r = tpSG(), out = {}, lst = [];
  ((d && d.temporadas) || []).forEach(function (t) { out[t.id] = { id: t.id, numero: t.numero, nombre: t.nombre.es, lema: t.lema.es, inicio: t.inicio, fin: t.fin, jsonIni: t.inicio, jsonFin: t.fin, d: t, srv: null }; });
  if (r) (r.temporadas || []).forEach(function (s) {
    var o = out[s.id] || (out[s.id] = { id: s.id, numero: Number((/\d+/.exec(s.id) || [0])[0]) || 0, nombre: s.id, lema: '', d: null });
    o.srv = s; o.inicio = s.inicio; o.fin = s.fin; o.niveles = s.niveles;
  });
  Object.keys(out).forEach(function (k) { lst.push(out[k]); });
  lst.sort(function (a, b) { return tpMs(a.inicio) - tpMs(b.inicio); });
  lst.forEach(function (t) {
    t.etq = t.d && t.numero ? 'T' + t.numero : t.id;
    t.fechasDist = !!(t.srv && t.jsonIni && (Math.abs(tpMs(t.srv.inicio) - tpMs(t.jsonIni)) > 6e4 || Math.abs(tpMs(t.srv.fin) - tpMs(t.jsonFin)) > 6e4));
    t.sinServidor = !!(r && !t.srv);
  });
  return lst;
}

/* ---------- premios de una casilla ---------- */
// Premios del servidor: bloques (con cofre), protectores y gemas del carril.
function tpEsperado(items) {
  var b = 0, p = 0, g = 0;
  items.forEach(function (i) { if (i.t === 'b' || i.t === 'f') b += i.n; else if (i.t === 'p') p += i.n; else if (i.t === 'g') g += i.n; });
  return { b: b, p: p, g: g };
}
// Compara con el servidor; devuelve null si coincide o no hay datos.
function tpDifSrv(t, n, lane, items) {
  var pb = tpPbT(t.id), out = {}, any = false, e = tpEsperado(items);
  if (pb) {
    var x = ((pb.cajas || {})[String(n)] || {})[lane === 'g' ? 'gratis' : 'premium'] || {};
    var sb = Number(x.bloques) || 0, sp = Number(x.protectores) || 0;
    if (sb !== e.b) { out.b = sb; any = true; }
    if (sp !== e.p) { out.p = sp; any = true; }
  }
  if (t.srv && lane === 'p') {
    var sg = Number((t.srv.gemas || {})[String(n)]) || 0;
    if (e.g && sg !== e.g) { out.g = sg; any = true; }
  }
  return any ? out : null;
}
function tpGemasSrv(t, n) { return t.srv ? Number((t.srv.gemas || {})[String(n)]) || 0 : 0; }
function tpItems(t, lvl, lane) {
  var items = (lane === 'g' ? lvl.g : lvl.p).slice();
  if (lane === 'p' && t.srv && !items.some(function (i) { return i.t === 'g'; })) { var gm = tpGemasSrv(t, lvl.n); if (gm > 0) items.push({ t: 'g', n: gm, srv: 1 }); }
  return items;
}

/* ---------- totales ---------- */
function tpLane(t, lane) {
  var s = { b: 0, f: 0, p: 0, g: 0, cos: 0, rar: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 }, ex: 0, paq: 0, val: 0, valCos: 0, sinPrecio: 0 };
  ((t.d && t.d.niveles) || []).forEach(function (l) {
    tpItems(t, l, lane).forEach(function (i) {
      if (i.t === 'b') s.b += i.n; else if (i.t === 'f') s.f += i.n; else if (i.t === 'p') s.p += i.n; else if (i.t === 'g') s.g += i.n;
      else (i.ids || []).forEach(function (id) {
        var c = tpCos(id); s.cos++; s.rar[c.r] = (s.rar[c.r] || 0) + 1; if (c.x) s.ex++;
        if (TP_PRECIO[c.r]) s.valCos += tpPrecio(c.r); else s.sinPrecio++;
      });
      if (i.paquete) s.paq++;
    });
  });
  s.val = s.b + s.f + s.valCos;
  return s;
}
function tpSum(a, b) {
  var o = { b: a.b + b.b, f: a.f + b.f, p: a.p + b.p, g: a.g + b.g, cos: a.cos + b.cos, ex: a.ex + b.ex, paq: a.paq + b.paq, val: a.val + b.val, valCos: a.valCos + b.valCos, sinPrecio: a.sinPrecio + b.sinPrecio, rar: {} };
  TP_RAR_ORD.forEach(function (r) { o.rar[r] = (a.rar[r] || 0) + (b.rar[r] || 0); });
  return o;
}
function tpStats(t) { var g = tpLane(t, 'g'), p = tpLane(t, 'p'); return { g: g, p: p, all: tpSum(g, p) }; }
function tpSel(st) { return TP.c === 'g' ? st.g : TP.c === 'p' ? st.p : st.all; }

/* ---------- línea del tiempo ---------- */
function tpTimeline(ts, ahora) {
  var h = '<div class="card sec"><div class="ch">' + ic('cal') + '<h3>Línea del tiempo</h3><span class="sub grow">Fechas del servidor (hora de México) · hoy ' + esc(fdt(new Date(ahora).toISOString(), true)) + '</span></div><div class="cb">';
  if (!ts.length) return h + '<p class="mut">No hay temporadas.</p></div></div>';
  var min = Math.min(ahora, tpMs(ts[0].inicio)) - 6 * 864e5, max = Math.max.apply(null, ts.map(function (t) { return tpMs(t.fin); })) + 8 * 864e5;
  if (ahora > max) max = ahora + 8 * 864e5;
  var span = max - min, pc = function (ms) { return Math.max(0, Math.min(100, 100 * (ms - min) / span)); };
  var bars = '', gaps = '', ticks = '', d0 = new Date(min), m = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 1, 6));
  for (; m.getTime() < max; m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1, 6))) {
    var p = pc(m.getTime());
    ticks += '<div class="tp-tk" style="left:' + p.toFixed(2) + '%"><span>' + esc(MES[m.getUTCMonth()].slice(0, 3)) + (m.getUTCMonth() === 0 ? ' ' + m.getUTCFullYear() : '') + '</span></div>';
  }
  var prevEnd = null, lanes = [];
  ts.forEach(function (t, i) {
    var a = tpMs(t.inicio), b = tpMs(t.fin), e = tpEstado(t, ahora), lbl = t.etq + ' · ' + t.nombre;
    var ln = 0; while (lanes[ln] != null && lanes[ln] > a) ln++; lanes[ln] = b;
    bars += '<div class="tp-bar ' + (e === 'en curso' ? 'on' : e === 'terminada' ? 'off' : '') + ' c' + (i % 2) + '" style="top:' + (6 + ln * 52) + 'px;left:' + pc(a).toFixed(2) + '%;width:' + (pc(b) - pc(a)).toFixed(2) + '%" title="' + esc(lbl + ': ' + fdt(t.inicio, true) + ' → ' + tpFin(t.fin) + ' (' + e + ')') + '"><b>' + esc(t.etq) + '</b><span>' + esc(t.nombre) + '</span></div>';
    var from = prevEnd == null ? (ahora < a ? ahora : null) : prevEnd;
    if (from != null && a - from > 36e5) {
      var dd = tpDias(a - from);
      gaps += '<div class="tp-gap" style="left:' + pc(from).toFixed(2) + '%;width:' + (pc(a) - pc(from)).toFixed(2) + '%" title="' + esc((prevEnd == null ? 'Faltan ' : 'Hueco de ') + nf(dd) + ' días' + (prevEnd == null ? ' para ' + t.etq : ' sin pase')) + '"><span>' + (prevEnd == null ? 'faltan ' : 'hueco ') + nf(dd) + ' d</span></div>';
    }
    prevEnd = Math.max(prevEnd || 0, b);
  });
  var hoy = '<div class="tp-hoy" style="left:' + pc(ahora).toFixed(2) + '%"><span>Hoy</span></div>';
  h += '<div class="tp-tl" role="img" aria-label="Línea del tiempo de las temporadas"><div class="tp-ax">' + ticks + '</div><div class="tp-tr" style="height:' + (14 + Math.max(1, lanes.length) * 52) + 'px">' + gaps + bars + hoy + '</div></div>';
  h += '<div class="tp-tcs">' + ts.map(function (t) { return tpTCard(t, ahora); }).join('') + '</div>';
  return h + '</div></div>';
}
function tpTCard(t, ahora) {
  var e = tpEstado(t, ahora), dias = tpDias(tpMs(t.fin) - tpMs(t.inicio));
  var avisos = '';
  if (t.srv && !t.srv.activa) avisos += chip('apagada en el servidor', 'warn');
  if (t.fechasDist) avisos += chip('fechas distintas a las de la app', 'warn');
  if (t.sinServidor) avisos += chip('no está en el servidor', 'bad');
  if (!t.d) avisos += chip('sin contenido en el panel', 'bad');
  var dif = tpNDif(t);
  if (dif) avisos += chip(nf(dif) + ' casilla' + (dif === 1 ? '' : 's') + ' distinta' + (dif === 1 ? '' : 's') + ' al servidor', 'warn');
  return '<div class="tp-tc"><div class="row nw" style="gap:8px;align-items:center;flex-wrap:wrap"><span class="tp-id">' + esc(t.etq) + '</span><b class="grow">' + esc(t.nombre) + '</b>' + tpEstChip(e) + '</div>' +
    (t.lema ? '<div class="xs mut" style="margin-top:2px">' + esc(t.lema) + '</div>' : '') +
    '<div class="sm" style="margin-top:8px"><b>' + esc(fdt(t.inicio, true)) + '</b> → <b>' + esc(tpFin(t.fin)) + '</b></div>' +
    '<div class="xs mut">' + esc(tpRelativo(t, ahora)) + ' · dura ' + nf(dias) + ' días · ' + nf(t.niveles || (t.d && t.d.niveles.length) || 0) + ' niveles</div>' +
    (avisos ? '<div class="chips" style="margin-top:8px">' + avisos + '</div>' : '') +
    '<div style="margin-top:10px"><button class="btn sm" data-a="tpEdit" data-id="' + esc(t.id) + '">' + ic('edit') + 'Editar en Solo gemas › Pase</button></div></div>';
}
A.tpEdit = function (el) {
  if (typeof SG !== 'undefined') { SG.tab = 'pase'; SG.tsel = el.dataset.id; SG.pbsel = el.dataset.id; }
  go('juego/solo-gemas');
};
A.tpCarril = function (el) { TP.c = el.dataset.v; paintPage(); };
A.tpVer = function (el) { TP.t = el.dataset.v; paintPage(); };
A.tpReload = function () { rload('solo_gemas'); rload('pase_bloques'); toast('Recargando…', 'info'); };

/* ---------- casillas ---------- */
function tpDifTxt(d) {
  var p = [];
  if (d.b != null) p.push(nf(d.b) + ' Bloques'); if (d.p != null) p.push(nf(d.p) + ' prot.'); if (d.g != null) p.push(nf(d.g) + ' gemas');
  return p.join(' · ');
}
function tpNDif(t) {
  var n = 0; if (!t.d || (!tpPbT(t.id) && !t.srv)) return 0;
  t.d.niveles.forEach(function (l) { ['g', 'p'].forEach(function (c) { if (tpDifSrv(t, l.n, c, tpItems(t, l, c))) n++; }); });
  return n;
}
function tpRow(icn, color, main, sub, rc, extra) {
  return '<div class="tp-it" style="--rc:' + rc + '"><span class="tp-ic"' + (color ? ' style="color:' + color + '"' : '') + '>' + ic(icn) + '</span><span class="tp-tx"><span class="tp-nm">' + main + '</span>' + (sub ? '<span class="tp-sub">' + sub + '</span>' : '') + '</span>' + (extra || '') + '</div>';
}
function tpItem(i) {
  if (i.t === 'b') return tpRow('tpblq', TP_BLQ, nf(i.n) + ' Bloques', '', TP_RAR.common[1]);
  if (i.t === 'f') return tpRow('tpcofre', TP_BLQ, 'Cofre', 'hasta ' + nf(i.n) + ' Bloques', TP_RAR[i.n >= 4000 ? 'epic' : 'rare'][1]);
  if (i.t === 'p') return tpRow('tpescudo', '', nf(i.n) + ' protector' + (i.n === 1 ? '' : 'es') + ' de racha', '', TP_RAR.rare[1]);
  if (i.t === 'g') return tpRow('tpgem', TP_GEM, nf(i.n) + ' gemas', i.srv ? 'las paga el servidor' : '', TP_RAR.epic[1]);
  if (i.paquete) {
    var cs = i.ids.map(tpCos), tema = cs.filter(function (c) { return c.k === 'theme'; })[0], nom = tema ? tema.n : i.paquete;
    var ex = cs.some(function (c) { return c.x; });
    return tpRow('star', '#f59e0b', 'Paquete mítico «' + esc(nom) + '»', nf(i.ids.length) + ' piezas: ' + esc(cs.map(function (c) { return c.n; }).join(' · ')), TP_RAR.mythic[1], '<span class="tp-ch">' + chip('paquete', 'warn') + (ex ? chip('EXCLUSIVO', 'ac') : '') + '</span>');
  }
  return i.ids.map(function (id) {
    var c = tpCos(id), k = TP_KIND[c.k] || ['?', 'gift'], r = TP_RAR[c.r] || TP_RAR.common;
    return tpRow(k[1], r[1], esc(c.n), esc(k[0]) + ' · <span style="color:' + r[1] + '">' + r[0] + '</span>', r[1], c.x ? '<span class="tp-ch">' + chip('EXCLUSIVO', 'ac') + '</span>' : '');
  }).join('');
}
function tpLaneCell(t, lvl, lane) {
  var items = tpItems(t, lvl, lane), dif = tpDifSrv(t, lvl.n, lane, items);
  var h = '<div class="tp-ln ' + (lane === 'p' ? 'tp-lp' : 'tp-lg') + '"><span class="tp-lb">' + (lane === 'p' ? 'Premium' : 'Gratis') + '</span>' + (items.length ? items.map(tpItem).join('') : '<span class="xs mut">—</span>');
  if (dif) h += '<div class="tp-dif" title="El servidor paga distinto a lo que trae la app (JSON)">' + chip('Servidor', 'warn', 'warn') + ' paga ' + esc(tpDifTxt(dif)) + '</div>';
  return h + '</div>';
}

/* ---------- comparativa nivel por nivel ---------- */
function tpFiltros(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var opts = [['todas', 'Ambas']].concat(ct.map(function (t) { return [t.id, t.etq]; }));
  return '<div class="row sec" style="flex-wrap:wrap;gap:12px"><div class="tp-fl"><span class="xs mut">Carril</span>' + seg('tpCarril', TP.c, [['ambos', 'Ambos'], ['p', 'Solo premium'], ['g', 'Solo gratis']]) + '</div>' +
    '<div class="tp-fl"><span class="xs mut">Comparar</span>' + seg('tpVer', TP.t, opts) + '</div></div>';
}
function tpComparativa(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var vis = TP.t === 'todas' ? ct : ct.filter(function (t) { return t.id === TP.t; });
  if (!vis.length) vis = ct;
  var h = '<div class="card sec"><div class="ch">' + ic('layers') + '<h3>Nivel por nivel</h3><span class="sub grow">Qué trae cada nivel</span></div><div class="cb">';
  if (!vis.length) return h + '<p class="mut">No hay contenido de temporadas en el panel. Corre <span class="mono">node scripts/gen-temporadas.mjs</span>.</p></div></div>';
  var nmax = Math.max.apply(null, vis.map(function (t) { return t.d.niveles.length; }));
  h += '<div class="tp-cmp" style="--tpn:' + vis.length + '"><div class="tp-row tp-hd"><div class="tp-n">Nivel</div>' + vis.map(function (t) { return '<div class="tp-c"><b>' + esc(t.etq) + '</b> ' + esc(t.nombre) + '</div>'; }).join('') + '</div>';
  for (var n = 1; n <= nmax; n++) {
    var dest = vis.some(function (t) { var l = t.d.niveles[n - 1]; return l && l.d; });
    h += '<div class="tp-row' + (dest ? ' dest' : '') + '"><div class="tp-n"><b>' + n + '</b>' + (dest ? '<span title="Nivel destacado">' + ic('star') + '</span>' : '') + '</div>';
    vis.forEach(function (t) {
      var l = t.d.niveles[n - 1];
      h += '<div class="tp-c"><div class="tp-tt"><b>' + esc(t.etq) + '</b> · nivel ' + n + '</div>' + (l ? (TP.c !== 'p' ? tpLaneCell(t, l, 'g') : '') + (TP.c !== 'g' ? tpLaneCell(t, l, 'p') : '') : '<span class="xs mut">sin este nivel</span>') + '</div>';
    });
    h += '</div>';
  }
  return h + '</div></div></div>';
}

/* ---------- totales ---------- */
function tpTotales(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var h = '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Totales por temporada</h3><span class="sub grow">' + (TP.c === 'p' ? 'Solo premium' : TP.c === 'g' ? 'Solo gratis' : 'Gratis + premium') + ' · abajo de cada número, gratis y premium</span></div>';
  if (!ct.length) return h + '<div class="cb"><p class="mut">Sin contenido.</p></div></div>';
  var st = ct.map(function (t) { return tpStats(t); }), two = ct.length === 2;
  var precio = tpCfg('pase_precio'), bxg = tpCfg('bloques_por_gema');
  function fila(lbl, fn, o) {
    o = o || {};
    var vals = st.map(function (s) { return fn(s); });
    var h = '<tr><td>' + lbl + '</td>' + vals.map(function (v) { return '<td class="num"><b>' + v.t + '</b>' + (v.s ? '<div class="xs mut">' + v.s + '</div>' : '') + '</td>'; }).join('');
    if (two) { var d = vals[1].n - vals[0].n; h += '<td class="num tp-dc ' + (d > 0 ? 'tp-up' : d < 0 ? 'tp-dn' : 'mut') + '">' + (vals[0].n == null ? '' : (d > 0 ? '+' : '') + nf(d)) + '</td>'; }
    return h + '</tr>';
  }
  function num(k, suf) { return function (s) { var v = tpSel(s)[k]; return { n: v, t: nf(v) + (suf || ''), s: TP.c === 'ambos' ? 'G ' + nf(s.g[k]) + ' · P ' + nf(s.p[k]) : '' }; }; }
  function bq(s) { var v = tpSel(s); return { n: v.b + v.f, t: nf(v.b + v.f), s: 'cofres ' + nf(v.f) + (TP.c === 'ambos' ? '<br>G ' + nf(s.g.b + s.g.f) + ' · P ' + nf(s.p.b + s.p.f) : '') }; }
  function rar(r) { return function (s) { var v = tpSel(s).rar[r]; return { n: v, t: nf(v), s: TP.c === 'ambos' ? 'G ' + nf(s.g.rar[r]) + ' · P ' + nf(s.p.rar[r]) : '' }; }; }
  function val(s) { var v = tpSel(s); return { n: v.val, t: nf(v.val), s: 'Bloques ' + nf(v.b + v.f) + ' + cosméticos ' + nf(v.valCos) + (v.sinPrecio ? '<br>(' + nf(v.sinPrecio) + ' sin precio no suman)' : '') }; }
  var body = fila('Bloques <span class="xs mut">(con cofres)</span>', bq) + fila('Protectores de racha', num('p')) + fila('<span style="color:' + TP_GEM + '"><b>Gemas</b></span> <span class="xs mut">(servidor)</span>', num('g')) + fila('Cosméticos', num('cos')) +
    TP_RAR_ORD.map(function (r) { return fila('<span class="tp-dot" style="background:' + TP_RAR[r][1] + '"></span>' + TP_PLU[r], rar(r)); }).join('') +
    fila(chip('EXCLUSIVO', 'ac') + ' cosméticos', num('ex')) + fila('<span style="color:#f59e0b">' + ic('star') + '</span> Paquetes míticos', num('paq')) +
    fila('Valor aprox. en Bloques', val);
  function regresa(s) {
    var p = s.p, pct = precio ? Math.round(100 * p.g / precio) : null;
    var enBq = bxg ? Math.round(p.val / bxg) : null, tot = precio && enBq != null ? Math.round(100 * (p.g + enBq) / precio) : null;
    return { n: pct, t: pct == null ? '—' : pct + ' %', s: precio ? nf(p.g) + ' de ' + nf(precio) + ' gemas' + (tot != null ? '<br>con su valor en Bloques ≈ ' + tot + ' %' : '') : 'falta el precio del servidor' };
  }
  body += fila('Cuánto regresa el premium <span class="xs mut">(en gemas)</span>', regresa);
  h += '<div class="tw"><table class="tbl tp-tb"><thead><tr><th></th>' + ct.map(function (t) { return '<th class="num">' + esc(t.etq) + '</th>'; }).join('') + (two ? '<th class="num tp-dc">Dif.</th>' : '') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  h += '<div class="cb"><p class="xs mut" style="margin:0">Valor aproximado: común ' + nf(tpPrecio('common')) + ', raro ' + nf(tpPrecio('rare')) + ', épico ' + nf(tpPrecio('epic')) + ' Bloques (precios de tienda); legendarios y míticos no se venden con Bloques y no suman. «Regresa el premium»: las gemas del carril premium entre el precio del pase' + (bxg ? '; el valor en Bloques se cambia a gemas a ' + nf(bxg) + ' Bloques por gema' : '') + '.</p></div>';
  return h + '</div>';
}

/* ---------- vista ---------- */
function vPases() {
  var o1 = rm('solo_gemas'), o2 = rm('pase_bloques'), d = tpData();
  var h = pageHead('Pases de batalla', 'Las temporadas en una <b>línea del tiempo</b> y, nivel por nivel, <b>qué trae cada una</b> para compararlas. Solo lectura: para cambiar algo usa «Solo gemas › Pase».', '<button class="btn" data-a="tpReload">' + ic('refresh') + 'Recargar</button>');
  if (!d) return h + '<div class="card">' + emptyBox('db', 'Faltan los datos de las temporadas', 'Corre node scripts/gen-temporadas.mjs en blokku-landing y vuelve a compilar el panel.') + '</div>';
  var avisos = '';
  if (o1 && o1.err) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>No se pudieron leer las fechas y gemas del servidor</b>' + (o1.err.code === 'sin_sql' ? 'Falta correr ' + esc(SQLF.solo_gemas) + '. ' : esc(o1.err.message) + '. ') + 'Se muestran las fechas y premios del JSON de la app, sin comprobar contra el servidor.</div></div>';
  else if (!tpSG()) avisos += '<div class="ban info">' + ic('info') + '<div class="tx"><b>Cargando fechas y gemas del servidor…</b>Mientras tanto se ve lo que trae la app.</div></div>';
  if (o2 && o2.err) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>No se pudieron leer los Bloques del servidor</b>' + (o2.err.code === 'sin_sql' ? 'Falta correr ' + esc(SQLF.pase_bloques) + '. ' : esc(o2.err.message) + '. ') + 'No se puede comprobar que los Bloques y protectores coincidan con el servidor.</div></div>';
  var ts = tpTemps(), ahora = tpAhora();
  var dist = ts.filter(function (t) { return tpNDif(t) > 0; });
  if (dist.length) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>El servidor paga distinto a la app en ' + esc(dist.map(function (t) { return t.etq; }).join(' y ')) + '</b>Las casillas con «Servidor» enseñan lo que de verdad se paga (se cambió en «Solo gemas › Pase» o el JSON de la app ya cambió y falta regenerar los datos).</div></div>';
  return h + avisos + tpTimeline(ts, ahora) + tpFiltros(ts) + tpTotales(ts) + tpComparativa(ts);
}
VIEWS['juego/pases'] = vPases;
